# Cybersecurity Portfolio

A full-stack personal portfolio application built to showcase cybersecurity projects, certifications, achievements, skills, and professional experience.

## Current Architecture

- Frontend: React + Vite
- Backend: Node.js + Express
- API: REST
- Database: MongoDB planned
- CI/CD: Planned
- Deployment: Planned

## Services

### Frontend

Runs by default on:

http://localhost:5173

### Backend

Runs by default on:

http://localhost:5000

## Current API Endpoints

- GET /api/health
- GET /api/projects
- GET /api/projects/:slug
- GET /api/certifications
- GET /api/achievements
- POST /api/contact

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Current Features

- Responsive portfolio interface
- Separate frontend and backend services
- REST API architecture
- Dynamic project data
- Certifications and achievements
- Contact form
- Frontend-to-backend communication
- Basic error handling

## Planned Features

- MongoDB persistence
- Admin dashboard
- Expanded admin dashboard and authorization
- Project and certification management
- Docker and Docker Compose
- Automated testing
- CI/CD pipeline
- Production deployment
- Custom domain
- Technical write-ups
- Improved security controls
# Private Vault (local setup)

The Vault is available at `http://localhost:8080/#/vault` when using Compose. It is intentionally absent from the public navigation. An admin can upload, replace, and delete the one managed PDF in the Vault interface; a viewer can only read it. The document lives at `backend/private-docs/private-document.pdf`, or the simple PDF basename set in `VAULT_DOCUMENT_FILENAME`. The directory is mounted writable into the backend container so web uploads survive container rebuilds, and it is excluded from Git and Docker build context. Generated page images live in `backend/document-cache/` for direct Node runs, or in the container's writable layer with Compose. Both are private and gitignored. Back up `backend/private-docs/` separately from Git.

Copy `.env.example` to `.env` at the repository root. Set `JWT_SECRET` to a random value of at least 32 characters. Set usernames and bcrypt hashes; generate each hash in `backend/` with:

```bash
read -rsp 'Password: ' VAULT_PASSWORD; echo
printf %s "$VAULT_PASSWORD" | node -e 'let p=""; process.stdin.on("data", c => p += c); process.stdin.on("end", () => require("bcryptjs").hash(p, 12).then(console.log))'
unset VAULT_PASSWORD
```

Use a different password for each account. Put the resulting hashes in `VAULT_ADMIN_PASSWORD_HASH` and `VAULT_VIEWER_PASSWORD_HASH`. Keep `.env` out of Git. Start and test with:

```bash
mkdir -p backend/private-docs
docker compose config
docker compose build
docker compose up -d
docker compose ps
curl -i http://localhost:5000/api/health
```

For direct development, configure the same variables in `backend/.env`, run `npm start` in `backend/`, and run `npm run dev` in `frontend/`; set `FRONTEND_URL=http://localhost:5173` and use `http://localhost:5173/#/vault`. Vault requests use `credentials: "include"`. On deployment set `NODE_ENV=production`, `FRONTEND_URL=https://sthasanjay.com.np`, and `VITE_API_URL=https://api.sthasanjay.com.np/api` in the deployment `.env`, rebuild both containers, and verify the Cloudflare Tunnel serves both hosts over HTTPS. The auth cookie is HttpOnly, Secure in production, SameSite=Lax, and scoped to `/api/vault`.

The PDF is rendered to authenticated JPEG pages. The UI has copying deterrents, but a viewer can still capture screenshots or retrieve the page images. If a signed token is stolen, its browser session is revoked on logout only while the backend process stays up; rotate `JWT_SECRET` to revoke all sessions. Vault configuration is required for login; without it the private API fails closed while the public portfolio remains available.

Admin uploads use `POST /api/vault/documents` with multipart field `document` and a 20 MB limit. Admin deletion uses `DELETE /api/vault/documents/private-document`. Both require an authenticated admin session and an allowed Origin. Browser uploads replace the configured server-side filename; the uploaded filename is never used as a storage path. Replacing or deleting clears rendered page images. Ensure the Ubuntu host directory `backend/private-docs/` is writable by the backend container before deployment.
