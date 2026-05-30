import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../services/email', () => ({
  sendSubmissionEmail: vi.fn().mockResolvedValue(true),
}));
process.env.JWT_SECRET = 'test-secret';

import formsRouter from './forms';
import { initDb, closeDb, resetDb } from '../db/schema';
import { sendSubmissionEmail } from '../services/email';

function app() {
  const a = express();
  a.use(express.json());
  a.use('/api/forms', formsRouter);
  return a;
}

describe('form routes send email notifications', () => {
  beforeAll(() => { initDb(); });
  beforeEach(() => { resetDb(); });
  afterAll(() => { closeDb(); });

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
