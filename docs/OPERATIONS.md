# Operations — The Lighthouse Church RCCG website

## Where do form submissions go?
Every website form (contact, prayer, counselling, e-membership, service response, iCare) is:
1. Saved to the database (`server/data/lhp.db`).
2. Viewable in the **admin dashboard** at `/admin` (login at `/admin/login`).
3. Emailed to **Rccgtlp1@yahoo.com** (set by `NOTIFY_EMAIL`).

## Admin access
- The admin login is seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` on first server start.
- After first login, change the password via the dashboard.
- Only people with the admin email + password can see submissions. Share credentials securely.

## Email sending
Outbound email uses SMTP. The simplest option is to use the church's own Yahoo account:

1. Log in to **Rccgtlp1@yahoo.com** on Yahoo Mail
2. Go to **Account Security** → **Generate app password** (Yahoo requires an app password for SMTP, not the normal login password)
3. Set these environment variables in `.env`:
   ```
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=465
   SMTP_USER=Rccgtlp1@yahoo.com
   SMTP_PASS=<app password from step 2>
   SMTP_FROM=Rccgtlp1@yahoo.com
   NOTIFY_EMAIL=Rccgtlp1@yahoo.com
   ```

**Alternatives:** For better deliverability, consider a free transactional email provider:
- **Resend** — ~3,000 emails/month free; use their SMTP credentials
- **Brevo** (formerly Sendinblue) — ~300 emails/day free; use their SMTP credentials

**Offline operation:** If SMTP is not configured, submissions are still saved and shown in the admin dashboard; only the outbound email is skipped.

## Hosting
This is a **single Node web service**: Express serves the built React client, the `/api`
endpoints, the SQLite database, and uploaded gallery images. It must run on a host that
keeps a **persistent disk** — **not** a static/serverless host.

> ⚠️ **Vercel and Netlify will NOT work** for this app — they are static/serverless and
> cannot run a long-lived server or persist SQLite + uploaded files. Use Render (below),
> Railway, or Fly.io.

### Deploy on Render (recommended) — via the included Blueprint
A `render.yaml` Blueprint is committed at the repo root. It configures everything:
- **Web Service**, build `npm run deploy:build` (installs all deps incl. devDeps, then builds),
  start `npm start`, health check `/api/health`.
- A **1 GB persistent disk** mounted at `/var/data`, with `DATA_DIR=/var/data` so the
  database (`/var/data/data/lhp.db`) and uploaded images (`/var/data/uploads`) survive
  redeploys.

Steps:
1. In Render: **New → Blueprint**, connect `github.com/Coolzymccooy/lhp_app`, pick branch `master`. Render reads `render.yaml`.
2. When prompted, fill the secret env vars (marked `sync: false`): `ANTHROPIC_API_KEY`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and (optionally) the `SMTP_*` values. `JWT_SECRET` is auto-generated.
3. Deploy. (Delete any earlier **Static Site** service for this repo — that was the wrong type and is what failed.)
4. Point your domain DNS (A/CNAME for `lighthousechurchburyrccg.co.uk`) at the Render app.

The Blueprint uses the **Starter** plan because the persistent disk requires a paid instance
(~£6/mo). To trial on the **free** plan instead, remove the `disk:` block and set `plan: free`
in `render.yaml` — but note the database and uploaded images will reset on every redeploy/restart.

### Manual setup (any Node host)
- **Build command:** `npm run deploy:build`
- **Start command:** `npm start`
- **Env:** `NODE_ENV=production`, `DATA_DIR=<persistent-mount>`, `JWT_SECRET`, `NOTIFY_EMAIL`,
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, optional `ANTHROPIC_API_KEY` / `SMTP_*` / `YOUTUBE_CHANNEL_ID` / `STRIPE_SECRET_KEY`.
- Mount a persistent volume and point `DATA_DIR` at it.

**Alternatives:** Railway or Fly.io (persistent volumes); or swap SQLite for managed PostgreSQL
for easier horizontal scaling (requires a DB-driver change).

## Running locally
1. **Build everything:**
   ```bash
   npm run build
   ```
2. **Start the server** (serves the React app + API on PORT, default 5000):
   ```bash
   npm start
   ```
3. **Visit:** `http://localhost:5000/`
   - Home page: React app
   - `/admin/login`: Admin login
   - `/admin`: Dashboard (view submissions, generate bulletins)
   - `/api/health`: Health check
   - `/api/forms/*`: Form submission endpoints
