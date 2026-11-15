import { useEffect, useRef, useState } from "react";
import "./vault.css";

const api = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/vault`;

async function vaultRequest(path, options = {}) {
  const response = await fetch(`${api}${path}`, { credentials: "include", cache: "no-store", ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== "/login") {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error(body.message || "Unable to load the Vault.");
  }
  return response.json();
}

function uploadDocument(file, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${api}/documents`);
    request.withCredentials = true;
    request.timeout = 120000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      let body;
      try { body = JSON.parse(request.responseText); }
      catch { body = {}; }
      if (request.status >= 200 && request.status < 300) resolve(body);
      else reject(new Error(body.message || "Document upload failed."));
    };
    request.onerror = () => reject(new Error("Document upload failed. Check your connection."));
    request.ontimeout = () => reject(new Error("Document upload timed out."));
    const form = new FormData();
    form.append("document", file);
    request.send(form);
  });
}

export default function Vault() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [managementBusy, setManagementBusy] = useState(false);
  const [managementStatus, setManagementStatus] = useState("");
  const [managementError, setManagementError] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    let active = true;
    vaultRequest("/me").then((result) => {
      if (active) setUser(result);
    }).catch(() => {}).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    vaultRequest("/documents").then((result) => setDocuments(result.documents)).catch((err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    const urls = [];
    (async () => {
      try {
        const { count } = await vaultRequest(`/documents/${selected.slug}/pages`);
        for (let page = 1; page <= count; page += 1) {
          const response = await fetch(`${api}/documents/${selected.slug}/pages/${page}`, { credentials: "include", cache: "no-store" });
          if (!response.ok) throw new Error(response.status === 401 ? "Your session has expired. Please sign in again." : "Unable to render a document page.");
          const blob = await response.blob();
          if (!active) break;
          const url = URL.createObjectURL(blob);
          urls.push(url);
          setPages((current) => [...current, { number: page, url }]);
        }
      } catch (err) { if (active) setError(err.message); }
    })();
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [selected]);

  useEffect(() => {
    const blockKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["c", "s", "p", "u"].includes(event.key.toLowerCase())) event.preventDefault();
    };
    window.addEventListener("keydown", blockKeys);
    return () => window.removeEventListener("keydown", blockKeys);
  }, []);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await vaultRequest("/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      setPassword("");
      setUser(result);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function logout() {
    try { await vaultRequest("/logout", { method: "POST" }); }
    catch (err) { setError(err.message); return; }
    setSelected(null);
    setPages([]);
    setDocuments([]);
    setUser(null);
    setPassword("");
    setSelectedFile(null);
    setManagementStatus("");
  }

  function selectDocument(doc) {
    setPages([]);
    setError("");
    setSelected({ ...doc });
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!selectedFile || managementBusy) return;
    setManagementBusy(true);
    setManagementError("");
    setManagementStatus("");
    setUploadProgress(0);
    try {
      await uploadDocument(selectedFile, setUploadProgress);
      const result = await vaultRequest("/documents");
      setDocuments(result.documents);
      setSelected(null);
      setPages([]);
      setSelectedFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setManagementStatus("Document uploaded. Select it to view the new pages.");
    } catch (err) { setManagementError(err.message); }
    finally { setManagementBusy(false); }
  }

  async function handleDelete() {
    const doc = documents[0];
    if (!doc || managementBusy || !window.confirm(`Delete ${doc.filename}? This cannot be undone.`)) return;
    setManagementBusy(true);
    setManagementError("");
    setManagementStatus("");
    try {
      await vaultRequest(`/documents/${doc.slug}`, { method: "DELETE" });
      const result = await vaultRequest("/documents");
      setDocuments(result.documents);
      setSelected(null);
      setPages([]);
      setManagementStatus("Document deleted.");
    } catch (err) { setManagementError(err.message); }
    finally { setManagementBusy(false); }
  }

  return (
    <div className="vault">
      {checking ? <div className="vault-loading">Checking private access…</div> : !user ? (
        <main className="vault-login-shell">
          <div className="vault-login-brand"><span className="vault-mark">◇</span><span>PRIVATE ACCESS</span></div>
          <form className="vault-login-card" onSubmit={login}>
            <p className="vault-kicker">AUTHENTICATED AREA / 01</p>
            <h1>Secure Vault<span>.</span></h1>
            <p className="vault-subtitle">Sign in to view your private document.</p>
            <label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <p className="vault-error" role="alert">{error}</p>}
            <button className="vault-primary" disabled={busy}>{busy ? "Entering…" : "Enter Vault"}<span>→</span></button>
          </form>
          <a className="vault-back" href="#/home">← Back to Portfolio</a>
        </main>
      ) : (
        <div className="vault-workspace">
          <aside className="vault-sidebar">
            <div className="vault-sidebar-brand"><span className="vault-mark">◇</span><strong>Secure Vault</strong></div>
            <div className="vault-identity"><span className="vault-avatar">{user.username.slice(0, 1).toUpperCase()}</span><div><strong>{user.username}</strong><small>{user.role}</small></div><span className="vault-online" title="Authenticated" /></div>
            <div className="vault-nav-label">DOCUMENTS</div>
            <div className="vault-doc-list">{documents.map((doc) => <button key={doc.slug} className={`vault-doc-item ${selected?.slug === doc.slug ? "is-active" : ""}`} onClick={() => selectDocument(doc)}><span className="vault-doc-icon">▤</span><span><strong>{doc.title}</strong><small>PDF • View Only</small></span><span className="vault-doc-arrow">→</span></button>)}</div>
            {!documents.length && <p className="vault-empty-small">No document is available yet.</p>}
            <div className="vault-sidebar-bottom"><button onClick={logout}>↪ <span>Logout</span></button><a href="#/home">← <span>Back to Portfolio</span></a></div>
          </aside>
          <main className="vault-main">
            <header className="vault-topbar"><span>PRIVATE WORKSPACE</span><span className="vault-auth"><i /> AUTHENTICATED</span></header>
            <div className="vault-content">
              {error && <p className="vault-error" role="alert">{error}</p>}
              {user.role === "admin" && <section className="vault-management" aria-label="Document management">
                <div className="vault-management-heading"><div><p className="vault-kicker">ADMIN ONLY</p><h2>Document Management</h2></div><span>20 MB MAX</span></div>
                <form onSubmit={handleUpload}>
                  <label className="vault-file-label" htmlFor="vault-pdf">Choose PDF</label>
                  <input ref={fileInput} id="vault-pdf" type="file" accept="application/pdf,.pdf" onChange={(event) => { setSelectedFile(event.target.files?.[0] || null); setManagementError(""); }} disabled={managementBusy} />
                  <button className="vault-manage-button" type="submit" disabled={!selectedFile || managementBusy}>{managementBusy ? "Working…" : documents.length ? "Upload / Replace Document" : "Upload Document"}</button>
                </form>
                {managementBusy && <div className="vault-upload-progress" role="progressbar" aria-label="Upload progress" aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${uploadProgress}%` }} /></div>}
                {managementBusy && <p className="vault-manage-note">{uploadProgress < 100 ? `Uploading ${uploadProgress}%` : "Processing PDF…"}</p>}
                {managementError && <p className="vault-error" role="alert">{managementError}</p>}
                {managementStatus && <p className="vault-success" role="status">{managementStatus}</p>}
                <div className="vault-current-document"><div><small>CURRENT DOCUMENT</small><strong>{documents[0]?.filename || "No document uploaded"}</strong></div>{documents.length > 0 && <button type="button" onClick={handleDelete} disabled={managementBusy}>Delete</button>}</div>
              </section>}
              {selected ? <>
                <div className="vault-document-header"><div><p className="vault-kicker">DOCUMENT / {selected.type}</p><h1>{selected.title}</h1><p>Available for private viewing.</p></div><span className="vault-view-badge">◉ VIEW ONLY</span></div>
                <div className="vault-pages" onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
                  {!pages.length && !error && <p className="vault-loading">Rendering pages…</p>}
                  {pages.map((page) => <div className="vault-page" key={page.number}><div className="vault-page-meta">PAGE {String(page.number).padStart(2, "0")}</div><div className="vault-page-image"><img src={page.url} alt={`Page ${page.number} of ${selected.title}`} draggable="false" /><div className="vault-watermark" aria-hidden="true">{user.username.toUpperCase()} • PRIVATE • VIEW ONLY</div></div></div>)}
                </div>
              </> : <div className="vault-welcome"><p className="vault-kicker">YOUR PRIVATE SPACE</p><h1>Documents</h1><p>Select a document from the sidebar to view it securely.</p><div className="vault-card-grid">{documents.map((doc) => <button key={doc.slug} className="vault-feature-card" onClick={() => selectDocument(doc)}><span className="vault-doc-icon">▤</span><strong>{doc.title}</strong><small>PDF • View Only</small><span>Open →</span></button>)}</div></div>}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
