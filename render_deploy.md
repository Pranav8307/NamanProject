# Deploying this project to Render

This repository contains a React client (Vite) in `client/` and an Express + MongoDB server in `server/`.

This document explains how to deploy both the client (as a static site) and the server (as a Node web service) on Render.

Quick checklist
- Connect this repository to Render (Render dashboard -> New -> Web Service / Static Site)
- Create two Render services: one web service for the server and one static site for the client
- Set environment variables (MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, etc.) in Render dashboard
- Deploy and verify

Recommended Render settings (summary)

- Server (web service)
  - Type: Web Service
  - Environment: Node
  - Build Command: cd server && npm install
  - Start Command: cd server && npm start
  - PORT: leave unset (Render injects PORT automatically)
  - Important env vars to set in the Render dashboard:
    - NODE_ENV=production
    - MONGODB_URI (your MongoDB Atlas connection string)
    - JWT_SECRET (strong secret)
    - JWT_REFRESH_SECRET (strong secret)
    - CLIENT_URL (public URL of the deployed client site)

- Client (static site)
  - Type: Static Site
  - Build Command: cd client && npm install && npm run build
  - Publish Directory: client/dist
  - Optional env var: VITE_API_BASE (if your client uses a base API URL; otherwise configure the client to call relative paths)

Using `render.yaml` (optional)

This repo contains an example `render.yaml` you can use to create services with Render's Git-based configuration. Edit the file to add secret values, or leave secrets blank and set them in the Render dashboard (recommended).

Notes & gotchas

- The server reads configuration from `server/config/environment.js`. In production Render will set `NODE_ENV=production` if you configure it so; the code warns if required values like `JWT_SECRET` or `MONGODB_URI` are missing.
- The server uses `process.env.PORT` via the config manager — no change needed to bind to Render's port.
- Make sure `CLIENT_URL` environment variable on the server equals your deployed client URL so CORS and redirects work correctly (for OAuth redirect URIs).
- If you use OAuth providers (Google/Facebook) in production, configure the provider consoles to accept the Render service callback URLs (e.g. https://<your-server>.onrender.com/auth/google/callback).

Post-deploy verification

1. Deploy the server and the client.
2. Visit the static client URL. Try signing up / logging in and ensure network requests hit the server service URL.
3. Check the server's `/health` endpoint (https://<your-server>.onrender.com/health) for status.

If anything fails, check the service logs in the Render dashboard — they usually indicate missing env vars or build errors.

Troubleshooting common Render build errors

**"vite: not found" during client build**
- Cause: Vite is in `devDependencies` of `client/package.json`, but npm skips devDependencies when building.
- Fix: Use `--include=dev` flag in the build command:
  ```
  cd client && npm install --include=dev && npm run build
  ```
  I have already added this to `render.yaml` so future builds will work. If you want to change it in the Render dashboard (without editing the file), go to your Static Site service settings and update the Build Command to the above.
- Alternative: Set env var `NPM_CONFIG_PRODUCTION=false` in the Render environment variables so npm includes devDependencies automatically.

**Build works locally but fails on Render**
- Check Node version: Render uses Node 25.x by default. Your `package.json` specifies `"engines": { "node": ">=16.x" }` which is fine. If you need a specific version, set it in `render.yaml` or Render environment.
- Check env vars: Ensure all required vars (MONGODB_URI, JWT_SECRET, etc.) are set in the Render dashboard Environment tab.
- Check logs: Open Render service Build Logs and Runtime Logs tabs for detailed error output.

**"CORS error" or "cannot connect to server from client"**
- Ensure `CLIENT_URL` env var on the server equals your deployed client URL (exactly, with https/http scheme).
- Example: If client is at `https://oauth-social-login-client.onrender.com`, server's `CLIENT_URL` must be exactly that.
- Restart the server after changing env vars (Render auto-restarts on env var changes, but you can force via "Manual Deploy").
