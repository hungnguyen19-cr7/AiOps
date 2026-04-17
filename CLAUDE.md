# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AiOps is the **React 18 + Vite frontend** (SPA) for the NTQ-AIOps platform. It provides a landing page, Google OAuth admin login, and a feature-rich admin dashboard for managing tenants, cloud configs, and knowledge documents. It calls the backend API at `VITE_API_BASE_URL` (defaults to `https://api.ai-agentops.info/`).

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (hot reload)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

### Environment Variables
Create a `.env.local` file (gitignored):
```
VITE_GOOGLE_CLIENT_ID=...          # Google OAuth client ID
VITE_API_BASE_URL=https://api.ai-agentops.info/   # Backend API base URL
```

## Architecture

### Routing & Auth (`src/App.jsx`)
- `/` — Public landing page
- `/adminlogin` — Google OAuth login page
- `/admin` — Protected admin dashboard (requires `aiops_auth` key in `localStorage`)
- `/trust/:section?` — Compliance/trust page
- `ProtectedRoute` component guards `/admin`; redirects to `/adminlogin` if not authenticated

### Key Files
| Path | Purpose |
|------|---------|
| `src/main.jsx` | Entry point; wraps app with `GoogleOAuthProvider` |
| `src/App.jsx` | Route definitions + `ProtectedRoute` guard |
| `src/pages/AdminPage.jsx` | Main dashboard — tenant mgmt, cloud config, file uploads |
| `src/pages/AdminLoginPage.jsx` | Google OAuth login flow |
| `src/data/legalData.js` | Legal/compliance content for TrustPage |

### AdminPage
`AdminPage.jsx` is the core of the app (~71KB). It manages:
- Tenant CRUD and configuration
- Cloud credentials and AWS integration settings
- Knowledge document uploads (sent to backend)
- Connects to backend via `VITE_API_BASE_URL`

## Deployment (AWS CodeBuild + CodeDeploy)

- `buildspec.yml` — CodeBuild: `npm ci` → `npm run build` → artifacts (`dist/`, `scripts/`, `nginx/`, `appspec.yml`)
- `appspec.yml` — CodeDeploy: deploys to `/var/www/aiops` on EC2, copies Nginx config
- `nginx/aiops.conf` — Serves the SPA; all routes fall back to `index.html`; gzip + long-term asset caching
- `scripts/ec2_bootstrap.sh` — Provisions EC2: installs Nginx + AWS CodeDeploy agent

## Tech Stack
- **UI:** React 18, React Router 7, Tailwind CSS 3, Framer Motion
- **Auth:** `@react-oauth/google` (Google OAuth 2.0); session stored in `localStorage`
- **Build:** Vite 5, PostCSS, Autoprefixer
- **Icons:** lucide-react
- **Deploy:** AWS CodeBuild → CodeDeploy → EC2 + Nginx
