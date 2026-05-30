import { Router, Response, Request } from 'express';
import { getDb } from '../db/schema';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { webpush, vapidPublicKey, vapidPrivateKey } from '../services/webPush';

const router = Router();

// All admin routes require auth
router.use(requireAuth);

type StatusBody = { status: string; notes?: string };

// ── Dashboard Stats ───────────────────────────────────────────────────────────
router.get('/stats', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const stats = {
    prayer: db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count, SUM(CASE WHEN ai_urgency='urgent' THEN 1 ELSE 0 END) as urgent FROM prayer_requests`).get(),
    counselling: db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count FROM counselling_sessions`).get(),
    contact: db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count FROM contact_messages`).get(),
    membership: db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count FROM memberships`).get(),
    responses: db.prepare(`SELECT COUNT(*) as total FROM service_responses`).get(),
    icare: db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count FROM icare_requests`).get(),
  };
  res.json({ success: true, stats });
});

// ── Prayer Requests ───────────────────────────────────────────────────────────
router.get('/prayer', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM prayer_requests ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

router.get('/prayer/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM prayer_requests WHERE id = ?').get(req.params.id);
  if (!row) { res.status(404).json({ success: false, error: 'Not found' }); return; }
  res.json({ success: true, data: row });
});

router.patch('/prayer/:id', (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body as StatusBody;
  const db = getDb();
  db.prepare("UPDATE prayer_requests SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?").run(status, notes ?? '', req.params.id);
  res.json({ success: true });
});

// ── Counselling Sessions ──────────────────────────────────────────────────────
router.get('/counselling', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM counselling_sessions ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

router.get('/counselling/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM counselling_sessions WHERE id = ?').get(req.params.id);
  if (!row) { res.status(404).json({ success: false, error: 'Not found' }); return; }
  res.json({ success: true, data: row });
});

router.patch('/counselling/:id', (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body as StatusBody;
  const db = getDb();
  db.prepare("UPDATE counselling_sessions SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?").run(status, notes ?? '', req.params.id);
  res.json({ success: true });
});

// ── Contact Messages ──────────────────────────────────────────────────────────
router.get('/contact', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

router.patch('/contact/:id', (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body as StatusBody;
  const db = getDb();
  db.prepare("UPDATE contact_messages SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?").run(status, notes ?? '', req.params.id);
  res.json({ success: true });
});

// ── Memberships ───────────────────────────────────────────────────────────────
router.get('/memberships', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM memberships ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

router.patch('/memberships/:id', (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body as StatusBody;
  const db = getDb();
  db.prepare("UPDATE memberships SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?").run(status, notes ?? '', req.params.id);
  res.json({ success: true });
});

// ── Service Responses ─────────────────────────────────────────────────────────
router.get('/responses', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM service_responses ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

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

// ── Sermons CRUD ──────────────────────────────────────────────────────────────
router.get('/sermons', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM sermons ORDER BY date DESC').all();
  res.json({ success: true, data: rows });
});

router.post('/sermons', (req: AuthRequest, res: Response) => {
  const { title, topic, speaker, summary, scriptures, youtube_url, date } = req.body as {
    title: string; topic: string; speaker: string; summary: string;
    scriptures: string[]; youtube_url: string; date: string;
  };
  const { v4: uuidv4 } = require('uuid');
  const db = getDb();
  db.prepare(`
    INSERT INTO sermons (id, title, topic, speaker, summary, scriptures, youtube_url, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), title, topic, speaker, summary, JSON.stringify(scriptures), youtube_url, date);
  res.json({ success: true });
});

router.delete('/sermons/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM sermons WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.patch('/sermons/:id', (req: AuthRequest, res: Response) => {
  const { title, topic, speaker, summary, scriptures, youtube_url, notes_url, date } = req.body as {
    title?: string; topic?: string; speaker?: string; summary?: string;
    scriptures?: string[]; youtube_url?: string; notes_url?: string; date?: string;
  };
  const db = getDb();
  db.prepare(`
    UPDATE sermons SET
      title = COALESCE(?, title),
      topic = COALESCE(?, topic),
      speaker = COALESCE(?, speaker),
      summary = COALESCE(?, summary),
      scriptures = COALESCE(?, scriptures),
      youtube_url = COALESCE(?, youtube_url),
      notes_url = COALESCE(?, notes_url),
      date = COALESCE(?, date)
    WHERE id = ?
  `).run(title, topic, speaker, summary, scriptures ? JSON.stringify(scriptures) : undefined, youtube_url, notes_url, date, req.params.id);
  res.json({ success: true });
});

// ── Prayer Wall Admin ─────────────────────────────────────────────────────────
router.get('/prayer-wall', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM prayer_wall ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows });
});

router.patch('/prayer-wall/:id', (req: AuthRequest, res: Response) => {
  const { approved } = req.body as { approved: boolean };
  const db = getDb();
  db.prepare('UPDATE prayer_wall SET approved = ? WHERE id = ?').run(approved ? 1 : 0, req.params.id);
  res.json({ success: true });
});

router.delete('/prayer-wall/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM prayer_wall WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Events Admin ──────────────────────────────────────────────────────────────
router.get('/events', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const events = db.prepare('SELECT * FROM events ORDER BY date ASC').all() as Array<Record<string, unknown>>;
  const rsvpCounts = db.prepare('SELECT event_id, COUNT(*) as count FROM rsvps GROUP BY event_id').all() as Array<{ event_id: string; count: number }>;
  const counts: Record<string, number> = {};
  rsvpCounts.forEach(r => { counts[r.event_id] = r.count; });
  res.json({ success: true, data: events.map(e => ({ ...e, rsvp_count: counts[String(e.id)] ?? 0 })) });
});

router.get('/events/:id/rsvps', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ success: true, data: rows });
});

router.post('/events', (req: AuthRequest, res: Response) => {
  const { title, description, date, time, location, type, image_url } = req.body as {
    title: string; description?: string; date: string; time: string;
    location?: string; type?: string; image_url?: string;
  };
  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO events (id, title, description, date, time, location, type, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description ?? '', date, time, location ?? 'The Rock Shopping Centre, Bury', type ?? 'service', image_url ?? '');
  res.json({ success: true, id });
});

router.delete('/events/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics', (_req: AuthRequest, res: Response) => {
  const db = getDb();

  const last30 = db.prepare(`
    SELECT date(created_at) as day,
      SUM(CASE WHEN type='prayer' THEN 1 ELSE 0 END) as prayer,
      SUM(CASE WHEN type='counselling' THEN 1 ELSE 0 END) as counselling,
      SUM(CASE WHEN type='contact' THEN 1 ELSE 0 END) as contact,
      SUM(CASE WHEN type='membership' THEN 1 ELSE 0 END) as membership
    FROM (
      SELECT created_at, 'prayer' as type FROM prayer_requests
      UNION ALL SELECT created_at, 'counselling' FROM counselling_sessions
      UNION ALL SELECT created_at, 'contact' FROM contact_messages
      UNION ALL SELECT created_at, 'membership' FROM memberships
    )
    WHERE date(created_at) >= date('now', '-30 days')
    GROUP BY day ORDER BY day ASC
  `).all();

  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM prayer_requests) as prayer,
      (SELECT COUNT(*) FROM counselling_sessions) as counselling,
      (SELECT COUNT(*) FROM contact_messages) as contact,
      (SELECT COUNT(*) FROM memberships) as membership,
      (SELECT COUNT(*) FROM service_responses) as responses,
      (SELECT COUNT(*) FROM sermons) as sermons,
      (SELECT COUNT(*) FROM events) as events,
      (SELECT COUNT(*) FROM prayer_wall WHERE approved=1) as prayer_wall
  `).get();

  const urgentPrayer = db.prepare(
    "SELECT COUNT(*) as count FROM prayer_requests WHERE ai_urgency='urgent' AND status='new'"
  ).get() as { count: number };

  res.json({ success: true, last30, totals, urgentPrayer: urgentPrayer.count });
});

// ── Push Notifications (send — auth required) ─────────────────────────────────
router.post('/push-send', (req: AuthRequest, res: Response) => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    res.status(503).json({ success: false, error: 'Push notifications not configured. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to .env' });
    return;
  }
  const { title, body, url } = req.body as { title: string; body: string; url?: string };
  const db = getDb();
  const subs = db.prepare('SELECT * FROM push_subscriptions').all() as Array<{ endpoint: string; p256dh: string; auth: string }>;

  let sent = 0;
  const payload = JSON.stringify({ title, body, url: url ?? '/' });

  Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
        .then(() => { sent++; })
        .catch(() => { db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint); })
    )
  ).then(() => res.json({ success: true, sent }));
});

// ── Weekly Bulletin Generator ────────────────────────────────────────────────
router.get('/bulletins', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM bulletins ORDER BY date DESC LIMIT 20').all();
  res.json({ success: true, data: rows });
});

router.post('/bulletins', (req: AuthRequest, res: Response) => {
  const { title, date, scripture, theme, announcements } = req.body as {
    title: string; date: string; scripture?: string; theme?: string; announcements?: string;
  };

  const content = generateBulletin({ title, date, scripture, theme, announcements });

  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO bulletins (id, title, date, scripture, theme, announcements, content)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, date, scripture ?? '', theme ?? '', announcements ?? '', content);

  res.json({ success: true, id, content });
});

function generateBulletin(opts: { title: string; date: string; scripture?: string; theme?: string; announcements?: string }): string {
  const { title, date, scripture, theme, announcements } = opts;
  const formattedDate = new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const lines = [
    `# ${title}`,
    `**The Lighthouse Church RCCG, Bury** | ${formattedDate}`,
    '',
    '---',
    '',
    '## Welcome',
    `We welcome you to today's service at The Lighthouse Church RCCG. Whether this is your first time or you've been with us for years, you are loved and valued.`,
    '',
  ];

  if (theme) {
    lines.push(`## Theme: ${theme}`, '');
  }

  if (scripture) {
    lines.push('## Memory Scripture', `> *"${scripture}"*`, '');
  }

  lines.push(
    '## Service Order',
    '- Praise & Worship',
    '- Prayer',
    '- Welcome & Announcements',
    '- Tithes & Offerings',
    '- The Word',
    '- Altar Call',
    '- Closing Worship & Benediction',
    ''
  );

  lines.push(
    '## Service Times',
    '- **Sunday** Sunday Service — 10:00 AM',
    '- **Sunday** (1st of month) Thanksgiving Service — 10:00 AM',
    '- **Wednesday** Virtual Prayer Night — 5:30 PM',
    '- **Thursday** Digging Deep Word Study — 5:30 PM',
    '- **Friday** (last of month) Virtual Vigil — 11:00 PM',
    ''
  );

  if (announcements && announcements.trim()) {
    lines.push('## Announcements', announcements, '');
  }

  lines.push(
    '---',
    '*The Rock Shopping Centre, Vue Cinema, Bury BL9 0ND*',
    '*www.lighthousechurchburyrccg.co.uk*'
  );

  return lines.join('\n');
}

// ── Stripe Checkout ───────────────────────────────────────────────────────────
router.post('/create-checkout', requireAuth, (req: AuthRequest, res: Response) => {
  void (async () => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(503).json({ success: false, error: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env' });
      return;
    }
    const { amount, fund, returnUrl } = req.body as { amount: number; fund: string; returnUrl: string };
    const stripe = new Stripe(stripeKey);
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: { name: `${fund} — RCCG Lighthouse Parish` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${returnUrl}?success=1`,
        cancel_url: `${returnUrl}?cancelled=1`,
      });
      res.json({ success: true, url: session.url });
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  })();
});

export default router;
