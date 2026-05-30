import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import adminRouter from './admin';
import { getDb, initDb, resetDb, closeDb } from '../db/schema';

let app: Express;
let token: string;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';

  // Create an Express app and mount the admin router
  app = express();
  app.use(express.json());
  app.use('/admin', adminRouter);

  // Initialize database
  initDb();
});

beforeEach(() => {
  resetDb();
  // Create a valid JWT token
  token = jwt.sign(
    { id: 'test-user', email: 'test@test.com', name: 'Test User', role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterAll(() => {
  closeDb();
});

describe('Attendance API', () => {
  it('should POST a valid attendance record and compute total correctly', async () => {
    const res = await request(app)
      .post('/admin/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        service_date: '2026-05-30',
        service_type: 'Sunday Service',
        men: 10,
        women: 12,
        youth: 5,
        teens: 4,
        children: 9,
        notes: 'Good turnout',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();

    // Verify the record was saved with correct total
    const db = getDb();
    const row = db.prepare('SELECT * FROM attendance WHERE id = ?').get(res.body.id) as any;
    expect(row).toBeDefined();
    expect(row.men).toBe(10);
    expect(row.women).toBe(12);
    expect(row.youth).toBe(5);
    expect(row.teens).toBe(4);
    expect(row.children).toBe(9);
    expect(row.total).toBe(40);
  });

  it('should GET all attendance records in descending order', async () => {
    const db = getDb();
    const id1 = 'att-001';
    const id2 = 'att-002';
    db.prepare(`
      INSERT INTO attendance (id, service_date, service_type, men, women, youth, teens, children, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id1, '2026-05-20', 'Sunday Service', 10, 10, 5, 5, 5, 35);
    db.prepare(`
      INSERT INTO attendance (id, service_date, service_type, men, women, youth, teens, children, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id2, '2026-05-27', 'Sunday Service', 15, 15, 8, 8, 8, 54);

    const res = await request(app)
      .get('/admin/attendance')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].id).toBe(id2); // Most recent first
  });

  it('should PATCH an existing attendance record and recompute total', async () => {
    const db = getDb();
    const id = 'att-patch-test';
    db.prepare(`
      INSERT INTO attendance (id, service_date, service_type, men, women, youth, teens, children, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, '2026-05-30', 'Sunday Service', 10, 10, 5, 5, 5, 35);

    const res = await request(app)
      .patch(`/admin/attendance/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        service_date: '2026-05-30',
        service_type: 'Thanksgiving Service',
        men: 20,
        women: 20,
        youth: 10,
        teens: 10,
        children: 10,
        notes: 'Updated',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id) as any;
    expect(updated.men).toBe(20);
    expect(updated.women).toBe(20);
    expect(updated.total).toBe(70);
  });

  it('should DELETE an attendance record', async () => {
    const db = getDb();
    const id = 'att-delete-test';
    db.prepare(`
      INSERT INTO attendance (id, service_date, service_type, men, women, youth, teens, children, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, '2026-05-30', 'Sunday Service', 10, 10, 5, 5, 5, 35);

    const res = await request(app)
      .delete(`/admin/attendance/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id);
    expect(deleted).toBeUndefined();
  });

  it('should reject POST with negative counts', async () => {
    const res = await request(app)
      .post('/admin/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        service_date: '2026-05-30',
        service_type: 'Sunday Service',
        men: -5,
        women: 10,
        youth: 5,
        teens: 4,
        children: 9,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject POST without service_date', async () => {
    const res = await request(app)
      .post('/admin/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        service_type: 'Sunday Service',
        men: 10,
        women: 12,
        youth: 5,
        teens: 4,
        children: 9,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should GET analytics with services and monthly aggregates', async () => {
    const db = getDb();

    // Insert test data spanning 2 months
    for (let i = 0; i < 8; i++) {
      const day = 1 + i * 3;
      const date = `2026-05-${String(day).padStart(2, '0')}`;
      db.prepare(`
        INSERT INTO attendance (id, service_date, service_type, men, women, youth, teens, children, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(`att-${i}`, date, 'Sunday Service', 10, 10, 5, 5, 5, 35);
    }

    for (let i = 0; i < 4; i++) {
      const day = 1 + i * 5;
      const date = `2026-06-${String(day).padStart(2, '0')}`;
      db.prepare(`
        INSERT INTO attendance (id, service_date, service_type, men, women, youth, teens, children, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(`att-jun-${i}`, date, 'Sunday Service', 15, 15, 8, 8, 8, 54);
    }

    const res = await request(app)
      .get('/admin/attendance/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.services).toBeDefined();
    expect(res.body.monthly).toBeDefined();
    expect(res.body.summary).toBeDefined();

    // Check summary
    expect(res.body.summary.latestTotal).toBe(54);
    expect(res.body.summary.avg4).toBeGreaterThan(0);
    expect(res.body.summary.categoryTotalsAllTime.men).toBeGreaterThan(0);
  });

  it('should require auth for all endpoints', async () => {
    const resGet = await request(app).get('/admin/attendance');
    expect(resGet.status).toBe(401);

    const resPost = await request(app).post('/admin/attendance').send({
      service_date: '2026-05-30',
      men: 10,
      women: 10,
      youth: 5,
      teens: 5,
      children: 5,
    });
    expect(resPost.status).toBe(401);
  });
});
