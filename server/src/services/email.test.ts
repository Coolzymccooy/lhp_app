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
