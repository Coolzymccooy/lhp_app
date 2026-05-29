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
