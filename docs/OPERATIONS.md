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
Because the app uses SQLite, it must be hosted where the database file persists across server restarts (a persistent disk).

**Recommended:**
- **Render** Web Service + persistent disk (~£6/month)
  1. Create a Web Service pointing to this repo
  2. Add a persistent disk mounted at `server/data` (where `lhp.db` lives)
  3. Build command: `npm run build`
  4. Start command: `npm start`
  5. Point your domain DNS (A/CNAME record for `lighthousechurchburyrccg.co.uk`) to the Render app

**Alternatives:**
- **Railway** or **Fly.io** (also offer persistent volumes)
- **Managed PostgreSQL** instead of SQLite (easier scaling; requires code change to use a different database driver)

**Important:** Free tier hosting with ephemeral disks (Heroku free tier, Vercel) **will wipe the SQLite database on each restart**. Avoid these unless you switch to managed PostgreSQL.

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
