import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { getDb } from '../db/schema';
import { validate } from '../middleware/validate';
import { triageRequest } from '../services/triage';
import { vapidPublicKey } from '../services/webPush';
import { sendSubmissionEmail } from '../services/email';

const router = Router();

// ── Prayer Request ────────────────────────────────────────────────────────────
const prayerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  category: z.enum(['Healing', 'Family', 'Finances', 'Career/Business', 'Relationships', 'Salvation', 'Thanksgiving', 'Other']),
  prayer_request: z.string().min(10, 'Please describe your prayer request'),
  contact_me: z.boolean().optional().default(false),
});

router.post('/prayer', validate(prayerSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof prayerSchema>;
  const { urgency, category: aiCategory } = triageRequest(data.prayer_request);
  const db = getDb();

  db.prepare(`
    INSERT INTO prayer_requests (id, first_name, last_name, email, phone, category, request_text, contact_me, ai_urgency, ai_category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), data.first_name, data.last_name ?? '', data.email, data.phone ?? '', data.category, data.prayer_request, data.contact_me ? 1 : 0, urgency, aiCategory);

  void sendSubmissionEmail('prayer', data as unknown as Record<string, unknown>);
  res.json({
    success: true,
    message: 'Your prayer request has been received. Our prayer team will lift you up today.',
    urgency,
  });
});

// ── Counselling Session ───────────────────────────────────────────────────────
const counsellingSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
  counselling_type: z.enum(['Pre-Marital', 'Marriage', 'Family', 'Individual', 'Spiritual Guidance', 'Grief Support']),
  preferred_date: z.string().optional(),
  description: z.string().optional(),
});

router.post('/counselling', validate(counsellingSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof counsellingSchema>;
  const { urgency, category: aiCategory } = triageRequest(data.description ?? '');
  const db = getDb();

  db.prepare(`
    INSERT INTO counselling_sessions (id, full_name, email, phone, counselling_type, preferred_date, description, ai_urgency, ai_category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), data.full_name, data.email, data.phone, data.counselling_type, data.preferred_date ?? '', data.description ?? '', urgency, aiCategory);

  void sendSubmissionEmail('counselling', data as unknown as Record<string, unknown>);
  res.json({
    success: true,
    message: 'Your counselling request has been received. A member of our team will contact you within 48 hours.',
    urgency,
  });
});

// ── Contact Message ───────────────────────────────────────────────────────────
const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

router.post('/contact', validate(contactSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof contactSchema>;
  const db = getDb();

  db.prepare(`
    INSERT INTO contact_messages (id, first_name, last_name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), data.first_name, data.last_name ?? '', data.email, data.phone ?? '', data.subject ?? '', data.message);

  void sendSubmissionEmail('contact', data as unknown as Record<string, unknown>);
  res.json({ success: true, message: 'Thank you for reaching out. We\'ll get back to you soon!' });
});

// ── Membership Registration ───────────────────────────────────────────────────
const membershipSchema = z.object({
  member_type: z.enum(['new', 'existing']),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  privacy_policy: z.literal(true),
});

router.post('/membership', validate(membershipSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof membershipSchema>;
  const db = getDb();

  db.prepare(`
    INSERT INTO memberships (id, member_type, first_name, last_name, phone, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), data.member_type, data.first_name, data.last_name, data.phone, data.email ?? '');

  void sendSubmissionEmail('membership', data as unknown as Record<string, unknown>);
  res.json({ success: true, message: 'Registration received! We\'ll be in touch about the next Membership Class.' });
});

// ── Service Response ──────────────────────────────────────────────────────────
const responseSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  responses: z.array(z.string()).min(1, 'Please select at least one option'),
  message: z.string().optional(),
});

router.post('/respond', validate(responseSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof responseSchema>;
  const db = getDb();

  db.prepare(`
    INSERT INTO service_responses (id, first_name, last_name, email, phone, responses, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), data.first_name, data.last_name ?? '', data.email, data.phone ?? '', JSON.stringify(data.responses), data.message ?? '');

  void sendSubmissionEmail('respond', data as unknown as Record<string, unknown>);
  res.json({ success: true, message: 'Thank you for responding! Our pastoral team will reach out to you.' });
});

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

// ── Prayer Wall (public) ──────────────────────────────────────────────────────
const prayerWallSchema = z.object({
  name: z.string().min(1).max(100),
  request: z.string().min(10).max(1000),
  anonymous: z.boolean().optional().default(false),
});

router.get('/prayer-wall', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT id, name, request, anonymous, praying_count, created_at FROM prayer_wall WHERE approved = 1 ORDER BY created_at DESC'
  ).all() as Array<Record<string, unknown>>;
  const data = rows.map(r => ({
    ...r,
    name: r.anonymous ? 'Anonymous' : r.name,
  }));
  res.json({ success: true, data });
});

router.post('/prayer-wall', validate(prayerWallSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof prayerWallSchema>;
  const db = getDb();
  db.prepare(
    'INSERT INTO prayer_wall (id, name, request, anonymous) VALUES (?, ?, ?, ?)'
  ).run(uuidv4(), data.name, data.request, data.anonymous ? 1 : 0);
  res.json({ success: true, message: 'Thank you — your request will appear on the prayer wall once approved.' });
});

router.patch('/prayer-wall/:id/pray', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('UPDATE prayer_wall SET praying_count = praying_count + 1 WHERE id = ? AND approved = 1').run(req.params.id);
  res.json({ success: true });
});

// ── Events public ──────────────────────────────────────────────────────────────
const rsvpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  guests: z.number().int().min(1).max(10).optional().default(1),
});

router.get('/events', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM events WHERE date >= date('now') ORDER BY date ASC").all();
  res.json({ success: true, data: rows });
});

router.post('/events/:id/rsvp', validate(rsvpSchema), (req: Request, res: Response) => {
  const data = req.body as z.infer<typeof rsvpSchema>;
  const db = getDb();
  const event = db.prepare('SELECT id FROM events WHERE id = ?').get(req.params.id);
  if (!event) { res.status(404).json({ success: false, error: 'Event not found' }); return; }
  db.prepare(
    'INSERT INTO rsvps (id, event_id, name, email, phone, guests) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(uuidv4(), req.params.id, data.name, data.email, data.phone ?? '', data.guests ?? 1);
  res.json({ success: true, message: 'RSVP confirmed! We look forward to seeing you.' });
});

// ── Push Notifications (public — subscribe) ───────────────────────────────────
router.get('/vapid-public-key', (_req: Request, res: Response) => {
  if (!vapidPublicKey) {
    res.status(503).json({ success: false, error: 'Push notifications not configured' });
    return;
  }
  res.json({ success: true, key: vapidPublicKey });
});

const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

router.post('/push-subscribe', validate(pushSubscribeSchema), (req: Request, res: Response) => {
  const { endpoint, keys } = req.body as z.infer<typeof pushSubscribeSchema>;
  if (!vapidPublicKey) {
    res.status(503).json({ success: false, error: 'Push notifications not configured' });
    return;
  }
  const db = getDb();
  db.prepare(`
    INSERT INTO push_subscriptions (id, endpoint, p256dh, auth)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth
  `).run(uuidv4(), endpoint, keys.p256dh, keys.auth);
  res.json({ success: true });
});

// ── Stripe Online Giving (public) ─────────────────────────────────────────────
const checkoutSchema = z.object({
  amount: z.number().positive(),
  fund: z.string().min(1),
  returnUrl: z.string().url(),
});

router.post('/create-checkout', validate(checkoutSchema), (req: Request, res: Response) => {
  void (async () => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(503).json({
        success: false,
        error: 'Online giving not yet configured. Please use bank transfer or give in person.',
      });
      return;
    }
    const { amount, fund, returnUrl } = req.body as z.infer<typeof checkoutSchema>;
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
      res.status(500).json({ success: false, error: 'Payment session could not be created. Please try again.' });
    }
  })();
});

export default router;
