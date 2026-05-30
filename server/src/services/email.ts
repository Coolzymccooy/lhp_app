import nodemailer from 'nodemailer';

export type SubmissionKind = 'prayer' | 'counselling' | 'contact' | 'membership' | 'respond' | 'icare' | 'first_timer';

export const KIND_LABELS: Record<SubmissionKind, string> = {
  prayer: 'Prayer Request',
  counselling: 'Counselling Session',
  contact: 'Contact Message',
  membership: 'Membership Registration',
  respond: 'Service Response',
  icare: 'iCare Request',
  first_timer: 'First-Time Guest',
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    // Return a no-op transporter for development
    return {
      sendMail: async () => ({ messageId: 'dev-mode-no-op' }),
    } as unknown as nodemailer.Transporter;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

export async function sendSubmissionEmail(
  kind: SubmissionKind,
  data: Record<string, unknown>
): Promise<void> {
  const transporter = getTransporter();
  const toEmail = process.env.CHURCH_EMAIL || 'Rccgtlp1@yahoo.com';
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@lighthousechurchburyrccg.co.uk';

  const subject = `New Submission: ${KIND_LABELS[kind]}`;
  const htmlBody = formatSubmissionEmail(kind, data);

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlBody,
    });
  } catch (err) {
    // Log but don't throw — submissions still succeed even if email fails
    console.error(`[email] Failed to send ${kind} notification:`, err);
  }
}

function formatSubmissionEmail(kind: SubmissionKind, data: Record<string, unknown>): string {
  const lines: string[] = [
    `<h2>${KIND_LABELS[kind]}</h2>`,
    '<table style="border-collapse: collapse; width: 100%; margin-top: 10px;">',
  ];

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue;
    const displayKey = key
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const displayValue = typeof value === 'boolean'
      ? (value ? 'Yes' : 'No')
      : String(value);
    lines.push(
      `<tr style="border-bottom: 1px solid #eee;">`,
      `<td style="padding: 8px; font-weight: bold; width: 30%;">${displayKey}</td>`,
      `<td style="padding: 8px;">${displayValue}</td>`,
      `</tr>`
    );
  }

  lines.push('</table>');
  lines.push('<p style="margin-top: 20px; color: #666; font-size: 12px;">');
  lines.push('This is an automated notification from the Lighthouse Church website.');
  lines.push('</p>');

  return lines.join('\n');
}
