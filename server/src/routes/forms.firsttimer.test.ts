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

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/forms', formsRouter);
  return app;
}

describe('POST /api/forms/first-timer', () => {
  beforeAll(() => { initDb(); });
  beforeEach(() => { resetDb(); });
  afterAll(() => { closeDb(); });

  it('rejects invalid email with 400', async () => {
    const res = await request(makeApp()).post('/api/forms/first-timer').send({
      full_name: 'John Doe',
      email: 'invalid-email',
    });
    expect(res.status).toBe(400);
  });

  it('rejects missing full_name with 400', async () => {
    const res = await request(makeApp()).post('/api/forms/first-timer').send({
      email: 'john@example.com',
    });
    expect(res.status).toBe(400);
  });

  it('accepts valid payload with required fields only', async () => {
    const res = await request(makeApp()).post('/api/forms/first-timer').send({
      full_name: 'John Doe',
      email: 'john@example.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Welcome to The Lighthouse Church');
    expect(sendSubmissionEmail).toHaveBeenCalledWith('first_timer', expect.objectContaining({
      full_name: 'John Doe',
      email: 'john@example.com',
    }));
  });

  it('accepts valid payload with all optional fields', async () => {
    const res = await request(makeApp()).post('/api/forms/first-timer').send({
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '07123456789',
      age_group: '18-35',
      how_heard: 'Friend/Family',
      visit_date: '2026-05-30',
      interests: 'Worship, Prayer',
      prayer_request: 'Please pray for my family',
      wants_followup: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendSubmissionEmail).toHaveBeenCalledWith('first_timer', expect.objectContaining({
      full_name: 'Jane Smith',
      age_group: '18-35',
      wants_followup: true,
    }));
  });
});
