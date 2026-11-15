const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const multer = require("multer");

const router = express.Router();
const run = promisify(execFile);
const cookieName = "vault_session";
const sessionMs = 8 * 60 * 60 * 1000;
const documentSlug = "private-document";
const privateDir = path.resolve(__dirname, "../private-docs");
const cacheDir = path.resolve(__dirname, "../document-cache");
const revoked = new Map();
let documentQueue = Promise.resolve();
const dummyHash = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
  fileFilter: (_req, file, done) => {
    if (file.mimetype !== "application/pdf" || !/\.pdf$/i.test(file.originalname)) {
      return done(new Error("Only PDF files are accepted"));
    }
    done(null, true);
  },
});

const noStore = (_req, res, next) => {
  res.set("Cache-Control", "private, no-store, max-age=0");
  res.set("Pragma", "no-cache");
  next();
};
router.use(noStore);

function accounts() {
  return [
    { role: "admin", username: process.env.VAULT_ADMIN_USERNAME, hash: process.env.VAULT_ADMIN_PASSWORD_HASH },
    { role: "viewer", username: process.env.VAULT_VIEWER_USERNAME, hash: process.env.VAULT_VIEWER_PASSWORD_HASH },
  ];
}

function configured() {
  const users = accounts();
  return Boolean(process.env.JWT_SECRET?.length >= 32 && users.every((user) =>
    user.username && /^\$2[aby]\$\d{2}\$/.test(user.hash || "")
  ) && users[0].username !== users[1].username);
}

function requireConfig(_req, res, next) {
  if (!configured()) return res.status(503).json({ message: "Vault is not configured" });
  next();
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/vault",
    maxAge: sessionMs,
  };
}

function requireOrigin(req, res, next) {
  const allowed = ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean);
  const origin = req.get("Origin");
  if (!origin || !allowed.includes(origin)) return res.status(403).json({ message: "Forbidden" });
  next();
}

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) throw new Error("missing");
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "portfolio-vault" });
    if (revoked.has(payload.jti) || !accounts().some((user) => user.role === payload.role && user.username === payload.sub)) throw new Error("invalid");
    req.vaultUser = { username: payload.sub, role: payload.role, jti: payload.jti, exp: payload.exp };
    next();
  } catch {
    res.status(401).json({ message: "Authentication required" });
  }
}

function requireAdmin(req, res, next) {
  if (req.vaultUser.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
}

function withDocumentLock(task) {
  const result = documentQueue.then(task);
  documentQueue = result.catch(() => {});
  return result;
}

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const submittedUsername =
      typeof req.body?.username === "string"
        ? req.body.username.trim().toLowerCase()
        : "";

    const knownUsername = accounts().some(
      (user) => user.username?.toLowerCase() === submittedUsername
    );

    const accountKey = knownUsername ? submittedUsername : "unknown";
    return `${ipKeyGenerator(req.ip)}:${accountKey}`;
  },
  message: { message: "Too many attempts. Try again later." },
});

router.post("/login", requireOrigin, loginLimit, requireConfig, async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = accounts().find((entry) => entry.username === username);
  const valid = await bcrypt.compare(password, user?.hash || dummyHash).catch(() => false);
  if (!user || !valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    algorithm: "HS256", issuer: "portfolio-vault", subject: user.username,
    jwtid: crypto.randomUUID(), expiresIn: "8h",
  });
  res.cookie(cookieName, token, cookieOptions());
  res.json({ username: user.username, role: user.role });
});

router.post("/logout", requireOrigin, (_req, res) => {
  try {
    const payload = jwt.verify(_req.cookies?.[cookieName], process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "portfolio-vault" });
    revoked.set(payload.jti, payload.exp);
  } catch { /* Clearing a missing or expired cookie is still successful. */ }
  for (const [jti, exp] of revoked) if (exp * 1000 < Date.now()) revoked.delete(jti);
  res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true });
});

router.use(requireConfig, requireAuth);
router.get("/me", (req, res) => res.json({ username: req.vaultUser.username, role: req.vaultUser.role }));

function documentPath() {
  const name = process.env.VAULT_DOCUMENT_FILENAME || "private-document.pdf";
  if (name !== path.basename(name) || !/^[\w .()-]+\.pdf$/i.test(name)) return null;
  return path.join(privateDir, name);
}

async function documentInfo() {
  const file = documentPath();
  if (!file) return null;
  try {
    const real = await fs.realpath(file);
    if (path.dirname(real) !== privateDir) return null;
    const stat = await fs.stat(real);
    if (!stat.isFile()) return null;
    return { file: real, stat };
  } catch { return null; }
}

async function pageCount(file) {
  const { stdout } = await run("pdfinfo", [file], { timeout: 10000, maxBuffer: 1024 * 1024 });
  const count = Number(stdout.match(/^Pages:\s+(\d+)$/m)?.[1]);
  if (!Number.isSafeInteger(count) || count < 1 || count > 500) throw new Error("Invalid PDF page count");
  return count;
}

async function clearPageCache() {
  await fs.rm(cacheDir, { recursive: true, force: true });
}

async function ensurePrivateDirectory() {
  await fs.mkdir(privateDir, { recursive: true, mode: 0o700 });
  if (await fs.realpath(privateDir) !== privateDir) throw new Error("Invalid document directory");
}

const documentSummary = () => ({
  slug: documentSlug,
  title: process.env.VAULT_DOCUMENT_TITLE || "Private Document",
  filename: path.basename(documentPath()),
  type: "PDF",
});

router.get("/documents", async (_req, res) => {
  const info = await withDocumentLock(documentInfo);
  res.json({ documents: info ? [documentSummary()] : [] });
});

router.get("/documents/:slug/pages", async (req, res) => {
  if (req.params.slug !== documentSlug) return res.status(404).json({ message: "Document not found" });
  try {
    const count = await withDocumentLock(async () => {
      const info = await documentInfo();
      return info ? pageCount(info.file) : null;
    });
    if (count === null) return res.status(404).json({ message: "Document not found" });
    res.json({ count });
  } catch { res.status(422).json({ message: "Document cannot be rendered" }); }
});

router.get("/documents/:slug/pages/:page", async (req, res) => {
  if (req.params.slug !== documentSlug || !/^[1-9]\d*$/.test(req.params.page)) return res.status(404).json({ message: "Page not found" });
  try {
    const image = await withDocumentLock(async () => {
      const info = await documentInfo();
      if (!info) return null;
      const page = Number(req.params.page);
      const count = await pageCount(info.file);
      if (!Number.isSafeInteger(page) || page > count) return null;
      await fs.mkdir(cacheDir, { recursive: true });
      const key = crypto.createHash("sha256").update(`${info.file}:${info.stat.ino}:${info.stat.size}:${info.stat.ctimeMs}:${page}`).digest("hex");
      const output = path.join(cacheDir, `${key}.jpg`);
      try { await fs.access(output); }
      catch {
        const prefix = path.join(cacheDir, `${key}-${crypto.randomUUID()}`);
        const temporary = `${prefix}.jpg`;
        try {
          await run("pdftoppm", ["-f", String(page), "-l", String(page), "-singlefile", "-scale-to", "1600", "-jpeg", "-jpegopt", "quality=85", info.file, prefix], { timeout: 60000, maxBuffer: 1024 * 1024 });
          await fs.rename(temporary, output);
        } finally { await fs.rm(temporary, { force: true }); }
      }
      return fs.readFile(output);
    });
    if (!image) return res.status(404).json({ message: "Page not found" });
    res.type("jpg");
    res.set("Content-Disposition", "inline");
    res.send(image);
  } catch {
    res.status(422).json({ message: "Page cannot be rendered" });
  }
});

const managementLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });

router.post("/documents", requireOrigin, requireAdmin, managementLimit, upload.single("document"), async (req, res) => {
  if (!req.file || req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
    return res.status(400).json({ message: "Only valid PDF files are accepted" });
  }
  try {
    const summary = await withDocumentLock(async () => {
      const target = documentPath();
      if (!target) throw new Error("Invalid document filename configuration");
      await ensurePrivateDirectory();
      const temporary = path.join(privateDir, `.vault-${crypto.randomUUID()}.tmp`);
      try {
        const handle = await fs.open(temporary, "wx", 0o600);
        try { await handle.writeFile(req.file.buffer); }
        finally { await handle.close(); }
        await pageCount(temporary);
        await clearPageCache();
        await fs.rename(temporary, target);
        return documentSummary();
      } finally { await fs.rm(temporary, { force: true }); }
    });
    res.status(201).json({ message: "Document uploaded", document: summary });
  } catch {
    res.status(422).json({ message: "Document could not be uploaded" });
  }
});

router.delete("/documents/:slug", requireOrigin, requireAdmin, managementLimit, async (req, res) => {
  if (req.params.slug !== documentSlug) return res.status(404).json({ message: "Document not found" });
  try {
    const removed = await withDocumentLock(async () => {
      const info = await documentInfo();
      if (!info) return false;
      await clearPageCache();
      await fs.unlink(info.file);
      return true;
    });
    if (!removed) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document deleted" });
  } catch {
    res.status(500).json({ message: "Document could not be deleted" });
  }
});

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "PDF exceeds the 20 MB limit" : "Invalid upload" });
  }
  if (error.message === "Only PDF files are accepted") return res.status(400).json({ message: error.message });
  next(error);
});

module.exports = router;
