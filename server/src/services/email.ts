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
