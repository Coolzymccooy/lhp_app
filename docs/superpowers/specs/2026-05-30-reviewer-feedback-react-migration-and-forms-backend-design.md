# Design — Reviewer Feedback, React Migration & Internal Forms Backend

**Date:** 2026-05-30
**Branch:** `worktree-feat+reviewer-feedback-backend` (worktree off `lhp_app`)
**Status:** Approved in brainstorming; pending written-spec review

---

## 1. Background & Problem

The church reviewer (Pastor Yemi Olujobi) sent a thread of feedback after reviewing the
**live site** `https://www.lighthousechurchburyrccg.co.uk/`.

Investigation established the true state of the codebases:

| Codebase | In git? | Deployed? | Forms | Notes |
|----------|---------|-----------|-------|-------|
| **Legacy static HTML** (`lhp_app` root `*.html` + `js/`) | yes (`lhp_app`) | **YES — this is the live site** | Formspree (`f/xgvjgzko`) | What the reviewer reviewed |
| **`lhp_app/client` + `server`** (React + Express + SQLite) | yes (`lhp_app`) | no | internal `/api/forms/*` already wired | Has admin dashboard, AI triage, `nodemailer` dep (unwired) |
| **`lhp2/lhp_react`** (Vite SPA) | **no** | no | Formspree | Separate experiment; to be retired |

The canonical git repo is `github.com/Coolzymccooy/lhp_app` (= this working directory).

### Decisions taken (user-confirmed during brainstorming)
1. **Migrate the live site to the React app** in `lhp_app/client` + `lhp_app/server`. Retire the
   legacy `*.html`/`js/` and the separate `lhp2/lhp_react`.
2. **Reuse the existing Express + SQLite backend** (`lhp_app/server`) to replace Formspree.
   Submissions go to **DB + admin dashboard + email**.
3. Email notifications are sent to **Rccgtlp1@yahoo.com** on every submission.
4. Church name → **"The Lighthouse Church RCCG"** (locality line "Bury, Manchester").
5. Theme/tagline → **"Reaching out, saving souls, making disciples through love"**.
6. Final service schedule confirmed (see §4, item 3).
7. Diverse imagery: build the section to swap images easily; **placeholders now**, church supplies
   real photos later.
8. Git: isolated **worktree + feature branch** off `lhp_app`.

---

## 2. Goals / Non-Goals

**Goals**
- Apply every actionable reviewer feedback item to the React app (`client/`).
- Replace Formspree entirely with the internal Express backend; all public forms (contact,
  e-membership, iCare, prayer, counselling, service-response) persist to DB, appear in the admin
  dashboard, and trigger an email to the church inbox.
- Single-origin deployment: Express serves the built client `dist/` + `/api`.
- Provide the church a clear path to log in and see submissions (admin seed + ops note).

**Non-Goals**
- No new AI features beyond an explanatory "how it works" panel for the existing Bulletin Copilot.
- No payment/Stripe changes beyond what already exists.
- Sourcing real diverse photography (church will supply); we ship a swap-ready section.
- Production host provisioning (we document the build/run; the actual DNS/host switch is operational).

---

## 3. Architecture

```
                          ┌─────────────────────────────────────────┐
  Browser ───────────────▶│  Express (lhp_app/server, Node)          │
                          │   • serves client/dist  (static SPA)     │
                          │   • /api/forms/*  (validate → SQLite)    │
   public forms ─POST────▶│   • /api/admin/*  (dashboard, auth)      │
                          │   • /api/ai/*     (next-step, etc.)      │
                          │        │                                 │
                          │        └─▶ services/email.ts (nodemailer)│──▶ Rccgtlp1@yahoo.com
                          └─────────────────────────────────────────┘
                                          │
                                   data/lhp.db (SQLite)
                                          │
                                   /admin dashboard (React, behind JWT)
```

- **Single origin** removes CORS complexity and yields one deployable process.
- Email is **best-effort & non-blocking**: a submission still succeeds (saved to DB) even if SMTP is
  unavailable; failures are logged, not surfaced to the user. SMTP unset ⇒ email silently skipped
  (dev-friendly). Email send happens after the DB write, off the response path.

### Modules / boundaries
- `client/src/content/site.ts` — **new** single source of truth (name, tagline, services, contact,
  socials). All branding/services read from here.
- `server/src/services/email.ts` — **new** notification service. Pure function `sendSubmissionEmail(kind, payload)`; depends only on nodemailer + env. Testable in isolation (transport injectable/mockable).
- Each `server/src/routes/forms.ts` handler: `validate → persist → fire-and-forget email → respond`.

---

## 4. Phase 1 — Frontend content fixes (`client/`)

Create `client/src/content/site.ts` first; refactor Header/Footer/HeroSlider/HomePage to read from it.

**Reviewer feedback → action reconciliation:**

| # | Reviewer item | Action | File(s) |
|---|---------------|--------|---------|
| 1 | "Change the name to The Lighthouse Church rccg" | Name → **"The Lighthouse Church RCCG"**, locality "Bury, Manchester" | `site.ts`, `Header.tsx:41-45`, `Footer.tsx:35-36,100`, `HeroSlider.tsx:19`, `HomePage.tsx:75`, `AboutPage.tsx`, `index.html`(title) |
| 2 | Theme: "Reaching out, saving souls, making disciples through love" (replace "Where the love of God…") | Set as primary tagline/mission | `site.ts`, `HeroSlider.tsx` subtitles, `Footer.tsx:38`, `HomePage.tsx:76` |
| 3 | Service times / "Our Services" rewrite | Replace `SERVICES` & footer list & countdown with confirmed schedule (below) | `HomePage.tsx:33-39`, `Footer.tsx:57-61`, `ServiceCountdown.tsx:3-6,89` |
| 4 | "Remove assistant regional head of Bury family"; "put us together — Pastors in charge of the parish; add Region 1 Province 1 Zone 2" | Both pastors titled **"Pastor in Charge"**; add designation **"RCCG The Lighthouse Church · Region 1 · Province 1 · Zone 2"**; remove "Regional/Co-Pastor" + any "assistant regional head" text | `SeniorPastorsPage.tsx:4-29,65,69` |
| 5 | "Add Youth Church after Summer Mentoring"; "Add Sarah's Heart ❤️ …" | Add a **"What We Offer"** section (ported from legacy `about.html`) incl. Summer Mentoring → **Youth Church** → … and a **Sarah's Heart** entry: *"For couples waiting on God for the fruit of the womb — spiritual & emotional support, plus information on medical options and signposting."* | new section in `AboutPage.tsx` (or `iCarePage.tsx`) |
| 6 | Service Teams "add Technical and social media" | Add **Service Teams** section (Worship, Media, Ushering, Prayer, Children's Workers, Parking, Security, Hospitality) **+ Technical & Social Media** | `GroupsPage.tsx` |
| 7 | "Add other races like Caucasian pics" (Connect/Grow/Thrive) | Make fellowship grid image-config-driven; placeholders now, easy swap later | `HomePage.tsx:24-31,159-182` (MINISTRIES/grid) |
| 8 | Giving: "delete Hands giving- dark background"; "404 when clicking each Ways-to-give item" | React Give has no hands-giving image and no broken links (legacy `/give/giftaid` 404s are gone). Add a **Gift Aid** info card; keep auditorium hero. Verify no dead links. | `GivePage.tsx:6-33,178-208` |
| 9 | "Weekly Bulletin AI Copilot — how does this work?" | Add a **"How this works"** explainer panel to the admin Bulletin page | `admin/BulletinPage.tsx` |
| 10 | "Where does the contacts go?" | Answered by Phase 2 (DB + dashboard + email). Add reassuring on-page confirmation copy. | `ContactPage.tsx` + backend |
| 11 | "I love the Lighthouse AI assistant" / "I like the colour blend" | No action (positive) | — |
| 12 | "Is this email new / who has access / send login details" | Ops: admin seed + access note (Phase 2/3) | `server` + README |

**Confirmed final service schedule (item 3):**

| Day | Service | Time |
|-----|---------|------|
| Sunday | Sunday Service | 10:00am |
| Sunday (1st of month) | Thanksgiving Service | 10:00am |
| Wednesday | Virtual Prayer Night | 5:30pm |
| Thursday | Digging Deep Word Study | 5:30pm |
| Friday (last of month) | Virtual Vigil | 11:00pm |

Removed: Sunrise Service, Praise Hour, Sunshine Service, Carpe Diem, Open Heavens.

---

## 5. Phase 2 — Internal backend replacing Formspree (`server/`)

1. **`services/email.ts`** — nodemailer transport from env (`SMTP_HOST/PORT/USER/PASS/FROM`).
   `sendSubmissionEmail(kind, data)` builds a subject + plaintext/HTML summary and sends to
   `process.env.NOTIFY_EMAIL` (default `Rccgtlp1@yahoo.com`). No-op + log when SMTP unset. Never throws to caller.
2. **Wire email into every form route** in `forms.ts`: `contact`, `prayer`, `counselling`,
   `membership`, `respond` — fire-and-forget after DB insert.
3. **Add iCare endpoint + table** — the "Need Help or Want to Volunteer" form
   (full_name, email, phone, interest [help|volunteer], preferred_contact, message).
   New `icare_requests` table in `db/schema.ts`; `POST /api/forms/icare`; admin list view.
4. **Client form audit** — all `client` public forms already POST to `/api/forms/*`
   (verified: Contact, Membership, Prayer, Counselling, Respond). Add the new iCare form on
   `iCarePage.tsx`. Remove every Formspree reference from the project; retire legacy `*.html`.
5. **Admin dashboard** — ensure `admin/SubmissionsPage.tsx` lists all categories incl. iCare.
6. **Admin seeding & access** — a one-time seed (env-driven `ADMIN_EMAIL`/`ADMIN_PASSWORD`) creating
   the church admin user if none exists; short README section: who has access, how to log in at
   `/admin/login`, and that notifications go to `Rccgtlp1@yahoo.com`.
7. **CORS** — single-origin serving makes cross-origin unnecessary; keep the existing allow-list as a
   fallback for split deploys.

### Env additions (`.env.example`)
```
NOTIFY_EMAIL=Rccgtlp1@yahoo.com      # where submission notifications are sent
ADMIN_EMAIL=                          # seeded admin login (set in prod)
ADMIN_PASSWORD=                       # seeded admin password (set in prod, change after first login)
# SMTP_* already present
```

---

## 6. Phase 3 — Imagery & deployment

- Connect/Grow/Thrive grid reads its image set from `site.ts`/assets so photos swap without code
  changes; ship with current images as placeholders. `log`/README note that diverse photos are pending.
- **Single-origin build/serve:** `server/index.ts` serves `client/dist` (static + SPA fallback to
  `index.html`) alongside `/api`. Root `package.json` `build` already builds client + server; add a
  `start` that runs the server serving the built client.
- Retire legacy `*.html`, `js/`, `css/` and `lhp2/lhp_react` (remove or move to an `legacy/` archive
  dir) once parity is confirmed.

---

## 7. Testing

No test suite exists today. Add focused tests for new backend logic:
- **Unit:** `email.ts` — builds correct subject/body per kind; is a no-op when SMTP unset; never
  throws (mock transport).
- **Integration:** each `/api/forms/*` route — valid payload persists a row and returns success;
  invalid payload returns 400; email service invoked once (mocked). Include the new `/icare`.
- **Manual/E2E (smoke):** submit each public form against a locally-running server; confirm a DB row,
  a dashboard entry, and (with SMTP test creds) a received email.

Target: cover the new/changed server code paths; frontend content changes are verified by manual run + screenshot.

---

## 8. Risks & open items

- **Service schedule wording** — confirmed; if Thanksgiving Service should be dropped, adjust.
- **Email deliverability** — sending *to* Yahoo is fine; the *sending* account (SMTP_USER) needs a
  valid provider + app password. Gmail/again-Yahoo app password to be supplied for production. Dev
  works without (no-op).
- **Bulletin Copilot** lives in the **admin** area (not the public bulletin the reviewer screenshotted
  on legacy); the "how it works" panel will clarify its purpose. If the church wanted a *public*
  bulletin generator, that's a separate request.
- **Hosting switch** from static HTML to the Node app is operational and outside this branch's code,
  but the single-origin server makes it a standard Node deploy.

---

## 9. Out of scope
- New AI capabilities; Stripe/giving redesign; real photography; production infra provisioning.
