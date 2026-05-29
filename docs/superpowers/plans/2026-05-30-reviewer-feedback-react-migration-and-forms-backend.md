# Reviewer Feedback, React Migration & Forms Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply all church-reviewer feedback to the React app (`client/`) and replace Formspree with the existing internal Express backend (`server/`) — submissions persist to SQLite, appear in the admin dashboard, and email a notification to `Rccgtlp1@yahoo.com`.

**Architecture:** `client/` (React/Vite/Tailwind) becomes the live site, served single-origin by `server/` (Express + better-sqlite3), which also exposes `/api/*`. A new `services/email.ts` (nodemailer) sends best-effort notifications. Legacy root `*.html` and the separate `lhp2/lhp_react` are retired.

**Tech Stack:** React 18, Vite, Tailwind, TypeScript, react-router-dom, axios, lucide-react, react-hot-toast; Express 5, better-sqlite3, zod, nodemailer, jsonwebtoken, bcryptjs; Vitest (added for server tests).

**Spec:** `docs/superpowers/specs/2026-05-30-reviewer-feedback-react-migration-and-forms-backend-design.md`

**Working dir:** worktree `C:\Users\segun\source\repos\lhp_app\.claude\worktrees\feat+reviewer-feedback-backend` on branch `worktree-feat+reviewer-feedback-backend`.

**Conventions:**
- Commit messages: `type: description` (feat/fix/docs/test/chore/refactor). No attribution trailer (disabled globally).
- Run all commands from the worktree root unless noted. Use PowerShell-safe commands.

---

## Phase 0 — Setup

### Task 0: Install dependencies & confirm baseline

**Files:** none (verification only)

- [ ] **Step 1: Install all deps**

Run (from worktree root):
```bash
npm run install:all
```
Expected: installs root, `client/`, and `server/` node_modules with no fatal errors.

- [ ] **Step 2: Confirm server type-checks**

Run:
```bash
npm run build --prefix server
```
Expected: `tsc` completes; emits `server/dist`. (If pre-existing type errors appear, note them — do not fix unrelated code.)

- [ ] **Step 3: Confirm client builds**

Run:
```bash
npm run build --prefix client
```
Expected: Vite build succeeds, emits `client/dist`.

- [ ] **Step 4: Commit nothing (baseline only)** — proceed to Phase A.

---

## Phase A — Backend: internal forms + email (`server/`)

### Task A1: Add Vitest test tooling to the server

**Files:**
- Modify: `server/package.json`
- Create: `server/vitest.config.ts`

- [ ] **Step 1: Add dev deps + test script**

Run:
```bash
npm install -D vitest --prefix server
```

Then edit `server/package.json` `scripts` to add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Create `server/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
```

- [ ] **Step 3: Verify the runner works (no tests yet)**

Run:
```bash
npm test --prefix server
```
Expected: Vitest runs and reports "No test files found" (exit 0) or similar.

- [ ] **Step 4: Commit**

```bash
git add server/package.json server/package-lock.json server/vitest.config.ts
git commit -m "chore: add vitest to server"
```

---

### Task A2: Email notification service (TDD)

**Files:**
- Create: `server/src/services/email.ts`
- Test: `server/src/services/email.test.ts`

The service builds a subject + body per submission kind and sends to `NOTIFY_EMAIL` (default `Rccgtlp1@yahoo.com`). It is a no-op when SMTP is unconfigured and NEVER throws to the caller. The transport is injectable for testing.

- [ ] **Step 1: Write the failing test**

`server/src/services/email.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { buildSubmissionEmail, sendSubmissionEmail, __setTransportForTests } from './email';

describe('buildSubmissionEmail', () => {
  it('builds a subject and body for a contact submission', () => {
    const msg = buildSubmissionEmail('contact', {
      first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', message: 'Hello there',
    });
    expect(msg.subject).toContain('Contact');
    expect(msg.text).toContain('Jane');
    expect(msg.text).toContain('jane@example.com');
    expect(msg.text).toContain('Hello there');
  });

  it('serialises array/object fields readably', () => {
    const msg = buildSubmissionEmail('respond', {
      first_name: 'Sam', email: 's@e.com', responses: ['First time', 'Tell me more'],
    });
    expect(msg.text).toContain('First time');
    expect(msg.text).toContain('Tell me more');
  });
});

describe('sendSubmissionEmail', () => {
  it('is a no-op (returns false) when no transport is configured', async () => {
    __setTransportForTests(null);
    const ok = await sendSubmissionEmail('contact', { first_name: 'X', email: 'x@e.com', message: 'hi' });
    expect(ok).toBe(false);
  });

  it('sends via the transport and returns true', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: '1' });
    __setTransportForTests({ sendMail } as never);
    const ok = await sendSubmissionEmail('prayer', { first_name: 'Y', email: 'y@e.com', prayer_request: 'pray' });
    expect(ok).toBe(true);
    expect(sendMail).toHaveBeenCalledOnce();
    const arg = sendMail.mock.calls[0][0];
    expect(arg.to).toBe('Rccgtlp1@yahoo.com');
    expect(arg.subject).toContain('Prayer');
  });

  it('never throws and returns false when the transport errors', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('smtp down'));
    __setTransportForTests({ sendMail } as never);
    const ok = await sendSubmissionEmail('contact', { first_name: 'Z', email: 'z@e.com', message: 'hi' });
    expect(ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test --prefix server -- email
```
Expected: FAIL — cannot find module `./email`.

- [ ] **Step 3: Write minimal implementation**

`server/src/services/email.ts`:
```ts
import nodemailer, { Transporter } from 'nodemailer';

export type SubmissionKind =
  | 'contact' | 'prayer' | 'counselling' | 'membership' | 'respond' | 'icare';

const KIND_LABELS: Record<SubmissionKind, string> = {
  contact: 'Contact Message',
  prayer: 'Prayer Request',
  counselling: 'Counselling Request',
  membership: 'Membership Registration',
  respond: 'Service Response',
  icare: 'iCare / Volunteer Request',
};

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'Rccgtlp1@yahoo.com';

export interface BuiltEmail {
  subject: string;
  text: string;
  html: string;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function buildSubmissionEmail(kind: SubmissionKind, data: Record<string, unknown>): BuiltEmail {
  const label = KIND_LABELS[kind];
  const rows = Object.entries(data)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatValue(v)}`);
  const text = [`New ${label} from the website`, '', ...rows].join('\n');
  const html = `<h2>New ${label}</h2><table>${Object.entries(data)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => `<tr><td><strong>${k.replace(/_/g, ' ')}</strong></td><td>${formatValue(v)}</td></tr>`)
    .join('')}</table>`;
  return { subject: `[LHP Website] New ${label}`, text, html };
}

let transport: Transporter | null | undefined;

/** Test seam — inject a fake transport (or null to force no-op). */
export function __setTransportForTests(t: Transporter | null): void {
  transport = t;
}

function getTransport(): Transporter | null {
  if (transport !== undefined) return transport; // includes explicit null from tests
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transport = null;
    return null;
  }
  transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587', 10),
    secure: parseInt(SMTP_PORT ?? '587', 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transport;
}

/** Sends a notification. Returns true on success, false if skipped/failed. Never throws. */
export async function sendSubmissionEmail(kind: SubmissionKind, data: Record<string, unknown>): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    console.warn(`[email] SMTP not configured — skipping ${kind} notification`);
    return false;
  }
  try {
    const { subject, text, html } = buildSubmissionEmail(kind, data);
    await t.sendMail({
      from: process.env.SMTP_FROM ?? 'noreply@lighthousechurchburyrccg.co.uk',
      to: NOTIFY_EMAIL,
      replyTo: typeof data.email === 'string' ? data.email : undefined,
      subject, text, html,
    });
    return true;
  } catch (err) {
    console.error(`[email] failed to send ${kind} notification:`, err);
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm test --prefix server -- email
```
Expected: PASS (all 5 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/services/email.ts server/src/services/email.test.ts
git commit -m "feat: add submission email notification service"
```

---

### Task A3: iCare submissions table + endpoint (TDD)

The iCare ("Need Help or Want to Volunteer") form has no endpoint yet. Add a table, a `POST /api/forms/icare` route, and email wiring.

**Files:**
- Modify: `server/src/db/schema.ts` (add `icare_requests` table in the `initDb` `db.exec(...)` block)
- Modify: `server/src/routes/forms.ts` (add route + email; also wire email into existing routes in Task A4)
- Modify: `server/src/routes/admin.ts` (add GET list + PATCH status)
- Test: `server/src/routes/forms.icare.test.ts`

- [ ] **Step 1: Add the table to `schema.ts`**

Inside the existing `db.exec(\`...\`)` template in `initDb()`, add this CREATE TABLE alongside the others (e.g. right after the `service_responses` table):
```sql
    CREATE TABLE IF NOT EXISTS icare_requests (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      interest TEXT NOT NULL DEFAULT 'help',
      preferred_contact TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
```

- [ ] **Step 2: Write the failing test**

`server/src/routes/forms.icare.test.ts`:
```ts
import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../services/email', () => ({
  sendSubmissionEmail: vi.fn().mockResolvedValue(true),
}));

process.env.JWT_SECRET = 'test-secret';

import formsRouter from './forms';
import { initDb } from '../db/schema';
import { sendSubmissionEmail } from '../services/email';

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/forms', formsRouter);
  return app;
}

describe('POST /api/forms/icare', () => {
  beforeAll(() => { initDb(); });

  it('rejects invalid payloads with 400', async () => {
    const res = await request(makeApp()).post('/api/forms/icare').send({ full_name: '' });
    expect(res.status).toBe(400);
  });

  it('accepts a valid payload, returns success, and emails', async () => {
    const res = await request(makeApp()).post('/api/forms/icare').send({
      full_name: 'Yemi Olujobi',
      email: 'yemiolujobi@yahoo.com',
      phone: '07900000000',
      interest: 'volunteer',
      preferred_contact: 'Email',
      message: 'Willing to volunteer',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendSubmissionEmail).toHaveBeenCalledWith('icare', expect.objectContaining({
      full_name: 'Yemi Olujobi', interest: 'volunteer',
    }));
  });
});
```

- [ ] **Step 3: Add supertest, then run to verify it fails**

Run:
```bash
npm install -D supertest @types/supertest --prefix server
npm test --prefix server -- icare
```
Expected: FAIL — `/api/forms/icare` returns 404 (route not defined).

- [ ] **Step 4: Implement the route in `forms.ts`**

Add the import at the top of `server/src/routes/forms.ts`:
```ts
import { sendSubmissionEmail } from '../services/email';
```
Add this route (e.g. after the `/respond` route):
```ts
// ── iCare / Volunteer Request ─────────────────────────────────────────────────
const icareSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  interest: z.enum(['help', 'volunteer']).default('help'),
  preferred_contact: z.string().optional(),
  message: z.string().optional(),
});

router.post('/icare', validate(icareSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof icareSchema>;
  const db = getDb();
  db.prepare(`
    INSERT INTO icare_requests (id, full_name, email, phone, interest, preferred_contact, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), data.full_name, data.email, data.phone ?? '', data.interest, data.preferred_contact ?? '', data.message ?? '');
  void sendSubmissionEmail('icare', data as unknown as Record<string, unknown>);
  res.json({ success: true, message: 'Thank you — our iCare team will be in touch soon.' });
});
```

- [ ] **Step 5: Run test to verify it passes**

Run:
```bash
npm test --prefix server -- icare
```
Expected: PASS.

- [ ] **Step 6: Add admin list/patch for iCare in `admin.ts`**

Add after the Service Responses section:
```ts
// ── iCare Requests ────────────────────────────────────────────────────────────
router.get('/icare', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM icare_requests ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

router.patch('/icare/:id', (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body as StatusBody;
  const db = getDb();
  db.prepare("UPDATE icare_requests SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?").run(status, notes ?? '', req.params.id);
  res.json({ success: true });
});
```
Also add `icare` to the `/stats` object:
```ts
    icare: db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status="new" THEN 1 ELSE 0 END) as new_count FROM icare_requests').get(),
```

- [ ] **Step 7: Commit**

```bash
git add server/src/db/schema.ts server/src/routes/forms.ts server/src/routes/admin.ts server/src/routes/forms.icare.test.ts server/package.json server/package-lock.json
git commit -m "feat: add iCare submissions endpoint, table, and admin views"
```

---

### Task A4: Wire email into existing form routes (TDD)

**Files:**
- Modify: `server/src/routes/forms.ts` (contact, prayer, counselling, membership, respond)
- Test: `server/src/routes/forms.email.test.ts`

- [ ] **Step 1: Write the failing test**

`server/src/routes/forms.email.test.ts`:
```ts
import { describe, it, expect, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../services/email', () => ({
  sendSubmissionEmail: vi.fn().mockResolvedValue(true),
}));
process.env.JWT_SECRET = 'test-secret';

import formsRouter from './forms';
import { initDb } from '../db/schema';
import { sendSubmissionEmail } from '../services/email';

function app() {
  const a = express();
  a.use(express.json());
  a.use('/api/forms', formsRouter);
  return a;
}

describe('form routes send email notifications', () => {
  beforeAll(() => { initDb(); });

  it('contact triggers an email', async () => {
    const res = await request(app()).post('/api/forms/contact').send({
      first_name: 'Jane', email: 'jane@example.com', message: 'Hello, this is a test message.',
    });
    expect(res.body.success).toBe(true);
    expect(sendSubmissionEmail).toHaveBeenCalledWith('contact', expect.objectContaining({ first_name: 'Jane' }));
  });

  it('prayer triggers an email', async () => {
    const res = await request(app()).post('/api/forms/prayer').send({
      first_name: 'Sam', email: 'sam@example.com', category: 'Healing', prayer_request: 'Please pray for healing.',
    });
    expect(res.body.success).toBe(true);
    expect(sendSubmissionEmail).toHaveBeenCalledWith('prayer', expect.objectContaining({ category: 'Healing' }));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run:
```bash
npm test --prefix server -- forms.email
```
Expected: FAIL — `sendSubmissionEmail` not called (routes don't call it yet).

- [ ] **Step 3: Add `void sendSubmissionEmail(...)` to each route**

In `server/src/routes/forms.ts`, immediately before each `res.json({ success: true, ... })` in the `contact`, `prayer`, `counselling`, `membership`, and `respond` handlers, add the matching line (the import was added in Task A3):
- contact: `void sendSubmissionEmail('contact', data as unknown as Record<string, unknown>);`
- prayer: `void sendSubmissionEmail('prayer', data as unknown as Record<string, unknown>);`
- counselling: `void sendSubmissionEmail('counselling', data as unknown as Record<string, unknown>);`
- membership: `void sendSubmissionEmail('membership', data as unknown as Record<string, unknown>);`
- respond: `void sendSubmissionEmail('respond', data as unknown as Record<string, unknown>);`

- [ ] **Step 4: Run to verify it passes**

Run:
```bash
npm test --prefix server -- forms.email
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/forms.ts server/src/routes/forms.email.test.ts
git commit -m "feat: email church inbox on every form submission"
```

---

### Task A5: Admin user seeding + env

**Files:**
- Modify: `server/src/db/schema.ts` (add `seedAdmin()` called from `initDb`)
- Modify: `server/src/index.ts` (no change needed if seed runs in initDb)
- Modify: `.env.example`

- [ ] **Step 1: Add `seedAdmin` to `schema.ts`**

At the end of `initDb()` (after the `db.exec(...)`), call `seedAdmin(db)`. Add the function:
```ts
function seedAdmin(db: Database.Database) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return; // nothing to seed
  const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);
  if (existing) return;
  const { v4: uuidv4 } = require('uuid');
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), email, hash, 'Church Admin', 'admin');
  console.log(`[seed] created admin user ${email}`);
}
```
(`bcrypt` is already imported at the top of `schema.ts`.)

- [ ] **Step 2: Add env keys to `.env.example`**

Append:
```
# Notifications — where website form submissions are emailed
NOTIFY_EMAIL=Rccgtlp1@yahoo.com

# Seeded admin login (set in production; change password after first login)
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

- [ ] **Step 3: Type-check**

Run:
```bash
npm run build --prefix server
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server/src/db/schema.ts .env.example
git commit -m "feat: seed church admin user from env"
```

---

### Task A6: Fix bulletin generator service times + church name

**Files:**
- Modify: `server/src/routes/admin.ts:299,328-336` (`generateBulletin`)

- [ ] **Step 1: Update the church name line**

In `generateBulletin`, change:
```ts
    `**RCCG Lighthouse Parish, Bury** | ${formattedDate}`,
```
to:
```ts
    `**The Lighthouse Church RCCG, Bury** | ${formattedDate}`,
```
and the Welcome paragraph reference `RCCG Lighthouse Parish` → `The Lighthouse Church RCCG`.

- [ ] **Step 2: Replace the Service Times block**

Replace the `'## Service Times', ...` lines with:
```ts
    '## Service Times',
    '- **Sunday** Sunday Service — 10:00 AM',
    '- **Sunday** (1st of month) Thanksgiving Service — 10:00 AM',
    '- **Wednesday** Virtual Prayer Night — 5:30 PM',
    '- **Thursday** Digging Deep Word Study — 5:30 PM',
    '- **Friday** (last of month) Virtual Vigil — 11:00 PM',
    ''
```

- [ ] **Step 3: Type-check**

Run:
```bash
npm run build --prefix server
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/admin.ts
git commit -m "fix: update bulletin generator service times and church name"
```

---

### Task A7: Single-origin static serving

Serve the built `client/dist` from Express, with SPA fallback, so the whole site runs from one Node process.

**Files:**
- Modify: `server/src/index.ts`
- Modify: root `package.json` (add a `start` script)

- [ ] **Step 1: Serve static + SPA fallback in `index.ts`**

After the `/api/*` route registrations and the health check, but BEFORE the global error handler, add:
```ts
// ── Serve built client (single-origin) ────────────────────────────────────────
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});
```
(`path` is already imported.)

- [ ] **Step 2: Add root `start` script**

In root `package.json` `scripts`, add:
```json
"start": "node server/dist/index.js"
```

- [ ] **Step 3: Verify build + serve**

Run:
```bash
npm run build
npm start
```
Expected: server logs "LHP Server running"; visiting `http://localhost:5000/` serves the React app; `http://localhost:5000/api/health` returns `{ "status": "ok" }`. Stop the server (Ctrl+C) after confirming.

- [ ] **Step 4: Commit**

```bash
git add server/src/index.ts package.json
git commit -m "feat: serve built client from express (single-origin)"
```

---

## Phase B — Frontend content fixes (`client/`)

### Task B1: Central site config

**Files:**
- Create: `client/src/content/site.ts`

- [ ] **Step 1: Create the config**

```ts
export const site = {
  name: 'The Lighthouse Church RCCG',
  shortName: 'The Lighthouse Church',
  locality: 'Bury, Manchester',
  designation: 'Region 1 · Province 1 · Zone 2',
  tagline: 'Reaching out, saving souls, making disciples through love',
  address: 'The Rock Shopping Centre, Vue Cinema, The Rock, Bury, BL9 0ND',
  phone: '+44 790 863 5374',
  email: 'info@lighthousechurchburyrccg.co.uk',
  services: [
    { day: 'Sunday', name: 'Sunday Service', time: '10:00 AM' },
    { day: 'Sunday', name: 'Thanksgiving Service', time: '10:00 AM', note: '1st Sunday' },
    { day: 'Wednesday', name: 'Virtual Prayer Night', time: '5:30 PM' },
    { day: 'Thursday', name: 'Digging Deep Word Study', time: '5:30 PM' },
    { day: 'Friday', name: 'Virtual Vigil', time: '11:00 PM', note: 'Last Friday' },
  ],
  social: {
    facebook: 'https://www.facebook.com/rccgtlp1',
    instagram: 'https://www.instagram.com/rccgtlp1/',
    youtube: 'https://www.youtube.com/@rccgtlp1',
    x: 'https://x.com/rccgtlp1',
  },
} as const;

export type ServiceTime = (typeof site.services)[number];
```

- [ ] **Step 2: Commit**

```bash
git add client/src/content/site.ts
git commit -m "feat: add central site config to client"
```

---

### Task B2: Header branding

**Files:** Modify `client/src/components/layout/Header.tsx:41-45`

- [ ] **Step 1: Update brand text**

Add `import { site } from '../../content/site';` at the top. Replace lines 41-45:
```tsx
          <img src={logoUrl} alt={site.name} className="h-10 md:h-12 w-auto object-contain" />
          <div className="hidden sm:block">
            <div className="font-bold text-sm leading-tight text-gray-900">{site.shortName} RCCG</div>
            <div className="text-xs text-primary font-semibold">{site.locality}</div>
          </div>
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/layout/Header.tsx
git commit -m "feat: rename church to The Lighthouse Church RCCG in header"
```

---

### Task B3: Footer branding, services, contact

**Files:** Modify `client/src/components/layout/Footer.tsx:35-38,57-61,89,100`

- [ ] **Step 1: Update brand + tagline + services + email**

Add `import { site } from '../../content/site';`. Then:
- Lines 35-36: `<h3 ...>{site.shortName}</h3>` and `<p ...>RCCG · {site.locality}</p>`
- Line 38 (description): replace with `{site.tagline}.`
- Replace the Service Times `<ul>` (lines 57-61) with:
```tsx
              {site.services.map(s => (
                <li key={`${s.day}-${s.name}`}>
                  <span className="text-primary font-semibold">{s.day}</span> {s.name} — {s.time}
                  {('note' in s && s.note) ? ` (${s.note})` : ''}
                </li>
              ))}
```
- Line 89: email href + text → `{site.email}` (use `mailto:${site.email}`).
- Line 100 copyright: `&copy; {new Date().getFullYear()} {site.name}, Bury. All rights reserved.`

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/layout/Footer.tsx
git commit -m "feat: update footer branding, services and contact email"
```

---

### Task B4: HeroSlider tagline & name

**Files:** Modify `client/src/components/ui/HeroSlider.tsx:16-47`

- [ ] **Step 1: Update slides**

Add `import { site } from '../../content/site';`. In the `SLIDES` array:
- Slide 1 `eyebrow`: `` `${site.name} · ${site.locality}` `` ; `subtitle`: `site.tagline`.
- Slide 2 `eyebrow`: `'Sunday Service'`; `subtitle`: `'Join us every Sunday at 10:00am · The Rock Shopping Centre, Bury'`.
- Slide 3 `subtitle`: replace "Lighthouse family" → "Lighthouse Church family".

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ui/HeroSlider.tsx
git commit -m "feat: update hero slides with new name and tagline"
```

---

### Task B5: HomePage services, welcome, tagline

**Files:** Modify `client/src/pages/HomePage.tsx:33-39,75-76`

- [ ] **Step 1: Replace SERVICES + welcome strip**

Add `import { site } from '../content/site';`. Replace the `SERVICES` const (lines 33-39) with `const SERVICES = site.services;` (and update the map key/labels: render `s.note` if present). Update the rendering block (lines 97-105) to show the optional note:
```tsx
            {SERVICES.map(s => (
              <div key={`${s.day}-${s.name}`} className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="text-primary font-bold text-xs uppercase tracking-widest mb-1">{s.day}</div>
                <div className="font-bold text-gray-900 text-base mb-2">{s.name}</div>
                <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" /> {s.time}
                </div>
                {('note' in s && s.note) ? <div className="text-gray-400 text-xs mt-1">{s.note}</div> : null}
              </div>
            ))}
```
- Line 75: `Welcome to {site.shortName}`.
- Line 76: `{site.locality} · {site.tagline}`.

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS (grid still renders; now 5 services with notes).

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/HomePage.tsx
git commit -m "feat: drive homepage services from config; new welcome + tagline"
```

---

### Task B6: ServiceCountdown — new primary service

**Files:** Modify `client/src/components/ui/ServiceCountdown.tsx`

The countdown targets the weekly Sunday service. Update name/time only (Sunday 10:00 AM Sunday Service).

- [ ] **Step 1: Update constants + labels**

- Line 3 comment + lines 5-6: `SERVICE_HOUR = 10; SERVICE_MIN = 0;` (Sunday 10:00 AM).
- Line 74: `WE ARE LIVE NOW — Sunday Service in progress`.
- Line 89: `Next Sunday Service — Sunday 10:00 AM`.

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ui/ServiceCountdown.tsx
git commit -m "fix: countdown targets Sunday Service at 10:00am"
```

---

### Task B7: Senior Pastors — joint Pastors in Charge + designation

**Files:** Modify `client/src/pages/SeniorPastorsPage.tsx:4-29,49-51,65,69`

- [ ] **Step 1: Update both pastors' titles + add designation**

Add `import { site } from '../content/site';`. In the `PASTORS` array set both `title: 'Pastor in Charge'`. In the first pastor's first bio paragraph, replace "is the Regional Pastor and Senior Pastor of RCCG Lighthouse Parish, Bury" with "is a Pastor in Charge of The Lighthouse Church RCCG, Bury". In the second pastor's first bio paragraph replace "serves as Co-Pastor and Minister of RCCG Lighthouse Parish" with "serves as a Pastor in Charge of The Lighthouse Church RCCG". Remove any "assistant regional head"/"Bury family" phrasing (none currently present — confirm none introduced).

- [ ] **Step 2: Add the parish designation under the hero**

In the hero block, change the subtitle (line 51) to:
```tsx
            <p className="text-white/80 mt-2">Pastors in Charge · {site.designation}</p>
```

- [ ] **Step 3: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/SeniorPastorsPage.tsx
git commit -m "feat: present pastors jointly as Pastors in Charge with region designation"
```

---

### Task B8: About — "What We Offer" with Youth Church & Sarah's Heart

**Files:** Modify `client/src/pages/AboutPage.tsx`

- [ ] **Step 1: Add a "What We Offer" section**

Add this data + section (place the section near the end of the page, before any closing CTA). Use lucide icons already common in the app:
```tsx
const OFFERINGS = [
  { title: 'Food Bank', desc: 'Non-perishable food for members and anyone in the community who needs it.' },
  { title: 'Pastoral & Welfare Support', desc: 'Face-to-face and telephone support for practical and spiritual needs.' },
  { title: 'Parenting & Marriage Support', desc: 'Free parenting classes and advice on marital and family issues.' },
  { title: 'Summer Mentoring', desc: 'Mentoring classes for girls, running in August.' },
  { title: 'Youth Church', desc: 'A vibrant space for our young people to grow in faith and community.' },
  { title: "Sarah's Heart ❤️", desc: 'For couples waiting on God for the fruit of the womb — spiritual and emotional support, plus information on available medical options and signposting.' },
];
```
```tsx
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Our Community</p>
            <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERINGS.map(o => (
              <div key={o.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <h3 className="font-bold text-gray-900 mb-2">{o.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
```
Note ordering: **Youth Church immediately follows Summer Mentoring**, and Sarah's Heart is included (per reviewer).

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/AboutPage.tsx
git commit -m "feat: add What We Offer incl Youth Church and Sarah's Heart"
```

---

### Task B9: Groups — Service Teams incl. Technical & Social Media

**Files:** Modify `client/src/pages/GroupsPage.tsx`

- [ ] **Step 1: Add a Service Teams section**

Add this data + section (use lucide icons: Music, Video, Users, HandHeart/Heart, Baby, Car, Shield, Coffee, Laptop — import what's available; fall back to `Users` for any missing):
```tsx
const SERVICE_TEAMS = [
  { name: 'Worship Team', desc: 'Lead the congregation in worship through music and song.' },
  { name: 'Media Team', desc: 'Handle sound, lighting, video, and live streaming.' },
  { name: 'Technical & Social Media', desc: 'Manage the website, online platforms, and our social media presence.' },
  { name: 'Ushering', desc: 'Welcome guests and ensure services run smoothly.' },
  { name: 'Prayer Team', desc: 'Intercede for the church and minister to those in need.' },
  { name: "Children's Workers", desc: 'Teach and care for children during services.' },
  { name: 'Parking Team', desc: 'Direct traffic and assist with parking.' },
  { name: 'Hospitality', desc: 'Provide refreshments and fellowship opportunities.' },
];
```
```tsx
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Serve</p>
            <h2 className="text-3xl font-bold text-gray-900">Service Teams</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">There's a place for everyone to serve. Join one of our teams.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICE_TEAMS.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/GroupsPage.tsx
git commit -m "feat: add Service Teams section incl Technical & Social Media"
```

---

### Task B10: Give — add Gift Aid, confirm no dead links

**Files:** Modify `client/src/pages/GivePage.tsx:6-33`

- [ ] **Step 1: Add a Gift Aid method**

Add a third entry to `GIVING_METHODS` (after "Give in Person"):
```tsx
  {
    title: 'Gift Aid',
    desc: 'UK taxpayers can increase their giving by 25% at no extra cost through Gift Aid. Ask our finance team for a Gift Aid declaration form.',
    details: [
      { label: 'Eligibility', value: 'UK taxpayers' },
      { label: 'Boost', value: '+25% on your gift' },
      { label: 'How', value: 'Complete a one-off declaration' },
    ],
    icon: Heart,
    color: 'bg-pink-50 border-pink-200',
    iconColor: 'text-pink-600 bg-pink-100',
  },
```
(All cards are static info — there are no `/give/giftaid` links, so the legacy 404s do not exist here. No hands-giving image is used. No further action needed for those items.)

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS (grid now shows 3 methods).

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/GivePage.tsx
git commit -m "feat: add Gift Aid giving option"
```

---

### Task B11: iCare — add Help/Volunteer form posting to backend

**Files:** Modify `client/src/pages/iCarePage.tsx`

Add a real form (matching the reviewer's "Need Help or Want to Volunteer" screenshot) that POSTs to `/api/forms/icare`.

- [ ] **Step 1: Add form state + submit handler**

At the top of the file add:
```tsx
import { useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
```
Inside the component (before `return`), add:
```tsx
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', interest: 'help', preferred_contact: 'Email', message: '' });
  const [submitting, setSubmitting] = useState(false);

  async function submitICare(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/forms/icare', form);
      toast.success(data.message ?? 'Thank you — our iCare team will be in touch soon.');
      setForm({ full_name: '', email: '', phone: '', interest: 'help', preferred_contact: 'Email', message: '' });
    } catch {
      toast.error('Something went wrong. Please try again or call us.');
    } finally {
      setSubmitting(false);
    }
  }
```

- [ ] **Step 2: Replace the final "Counselling link" CTA section's buttons with a form**

Add a new section before the closing `</main>`:
```tsx
      <section className="section-pad bg-white">
        <div className="container-max max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Get in Touch</p>
            <h2 className="text-3xl font-bold text-gray-900">Need Help or Want to Volunteer?</h2>
            <p className="text-gray-500 mt-3">Contact our iCare team to request support or to join our volunteers.</p>
          </div>
          <form onSubmit={submitICare} className="grid gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <input required placeholder="Full Name *" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 text-sm" />
            <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 text-sm" />
            <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 text-sm" />
            <select value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white">
              <option value="help">I need support</option>
              <option value="volunteer">I'm willing to volunteer</option>
            </select>
            <select value={form.preferred_contact} onChange={e => setForm({ ...form, preferred_contact: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white">
              <option>Email</option><option>Phone</option><option>Either</option>
            </select>
            <textarea rows={4} placeholder="How can we help? (optional)" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 text-sm" />
            <button type="submit" disabled={submitting} className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-pink-700 transition-colors disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send to iCare Team'}
            </button>
          </form>
        </div>
      </section>
```

- [ ] **Step 3: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/iCarePage.tsx
git commit -m "feat: iCare help/volunteer form posts to internal backend"
```

---

### Task B12: Contact — reassurance copy ("where do the contacts go?")

**Files:** Modify `client/src/pages/ContactPage.tsx`

- [ ] **Step 1: Add a confirmation line near the form**

Add a short note under the contact form heading:
```tsx
          <p className="text-gray-500 text-sm mb-4">Your message goes straight to our church office team, who aim to respond within 2 working days.</p>
```
(Find the form's heading/intro and insert this line. Do not change the submit logic — it already posts to `/api/forms/contact`.)

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ContactPage.tsx
git commit -m "feat: clarify where contact submissions go"
```

---

### Task B13: Bulletin Copilot — "How this works" explainer

**Files:** Modify `client/src/pages/admin/BulletinPage.tsx`

- [ ] **Step 1: Add an explainer panel**

Below the page header (around line 104-105), add:
```tsx
        <div className="mb-6 rounded-xl border border-pink-200 bg-pink-50 p-4 text-sm text-gray-700">
          <p className="font-bold text-gray-900 mb-1">How this works</p>
          <p>Enter the bulletin title, service date, theme, memory scripture, and any announcements, then click <strong>Generate Bulletin</strong>. The tool instantly assembles a formatted first-draft Sunday bulletin (welcome, service order, service times, announcements) that you can review, edit, print, or save. It's a starting point — always review before publishing.</p>
        </div>
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/admin/BulletinPage.tsx
git commit -m "feat: add How this works explainer to bulletin copilot"
```

---

### Task B14: Diverse fellowship imagery — config-driven placeholders

**Files:** Modify `client/src/pages/HomePage.tsx:24-31` (MINISTRIES) + `client/src/content/site.ts`

The reviewer asked to add other races (e.g. Caucasian) to the Connect/Grow/Thrive imagery. We make the image set easy to swap and keep current images as placeholders.

- [ ] **Step 1: Add a fellowship image list to `site.ts`**

Append to `site` object:
```ts
  fellowshipImages: {
    youngAdults: '/assets/youngadults.webp',
    teens: '/assets/teenfellowship.webp',
    men: '/assets/mensfellowship.webp',
    women: '/assets/womenfellowship.webp',
  },
```

- [ ] **Step 2: Point MINISTRIES images at the config**

In `HomePage.tsx`, change the relevant `img` values to read from `site.fellowshipImages` (e.g. `img: site.fellowshipImages.teens`). Add a code comment:
```tsx
// NOTE: Replace these with a racially diverse photo set when the church supplies them — just drop files in /public/assets and update site.fellowshipImages.
```

- [ ] **Step 3: Verify build**

Run: `npm run build --prefix client`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/HomePage.tsx client/src/content/site.ts
git commit -m "chore: make fellowship imagery config-driven for easy diverse-photo swap"
```

---

## Phase C — Cleanup, docs, verification

### Task C1: Retire legacy HTML & note lhp_react

**Files:** delete/move root `*.html`, `js/`, `css/` (legacy); add `legacy/README.md`

- [ ] **Step 1: Move legacy static assets out of the web root**

Run:
```bash
mkdir legacy
git mv index.html about.html contact.html counselling.html content-copilot.html faq.html give.html groups.html icare.html membershipclass.html prayer.html respondformv1.html seniorpastors.html thank-you.html watchlive.html legacy/
git mv js legacy/js
git mv css legacy/css
```

- [ ] **Step 2: Add a note**

Create `legacy/README.md`:
```markdown
# Legacy static site (retired 2026-05-30)

These files were the previous live site. The live site is now the React app in `client/`
served by `server/`. Kept for reference only. The separate `lhp2/lhp_react` experiment is
also retired (it was never in git).
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: retire legacy static HTML site to legacy/"
```

---

### Task C2: Ops README — admin access & notifications

**Files:** Create `docs/OPERATIONS.md`

- [ ] **Step 1: Write the ops doc**

```markdown
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
- Outbound email uses SMTP (`SMTP_HOST/PORT/USER/PASS/FROM`). Provide a real mailbox + app password.
- If SMTP is not configured, submissions are still saved + shown in the dashboard; only the email is skipped.

## Running
- Build everything: `npm run build`
- Start (serves site + API on PORT, default 5000): `npm start`
```

- [ ] **Step 2: Commit**

```bash
git add docs/OPERATIONS.md
git commit -m "docs: add operations guide (admin access, submissions, email)"
```

---

### Task C3: Full server test run + manual smoke checklist

- [ ] **Step 1: Run the full server test suite**

Run:
```bash
npm test --prefix server
```
Expected: all tests PASS.

- [ ] **Step 2: Manual smoke test (documented, run locally)**

With `.env` set (`JWT_SECRET`, optionally `SMTP_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`), run `npm run build && npm start`, then verify:
- [ ] Home shows new name "The Lighthouse Church RCCG", tagline, and the 5-item service schedule.
- [ ] Submitting the Contact form shows a success toast; a row appears under `/admin` Contact; (with SMTP) an email arrives at Rccgtlp1@yahoo.com.
- [ ] Submitting the iCare form works the same way.
- [ ] Senior Pastors shows "Pastors in Charge · Region 1 · Province 1 · Zone 2".
- [ ] About shows "What We Offer" with Youth Church after Summer Mentoring + Sarah's Heart.
- [ ] Groups shows Service Teams incl. "Technical & Social Media".
- [ ] No page references Formspree (grep `formspree` in `client/` returns nothing).

- [ ] **Step 3: Final commit (if any doc tweaks)** — otherwise done.

---

## Self-Review Notes (coverage check)

- Spec §4 items 1-9 → Tasks B2-B14 + A6 (name in bulletin). ✔
- Spec §5 backend (email, iCare, wiring, seed, dashboard) → Tasks A2-A5. ✔
- Spec §3 single-origin serving → Task A7. ✔
- Spec §6 imagery + retire legacy → Tasks B14, C1. ✔
- Spec §7 testing → Tasks A1-A4 (unit/integration) + C3 (smoke). ✔
- "Where do contacts go" (item 10/12) → A2-A4 + B12 + C2. ✔
- Formspree removal: client never used it (verified); legacy HTML retired in C1. ✔
