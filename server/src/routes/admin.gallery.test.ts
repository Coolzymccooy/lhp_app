import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getDb, initDb, resetDb, closeDb } from '../db/schema';
import { DEFAULT_ALBUM } from '../lib/albums';

// A 1x1 PNG — enough to satisfy multer's mimetype filter.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

let app: Express;
let token: string;
let dataDir: string;
let galleryDir: string;

function upload(fields: Record<string, string> = {}) {
  const req = request(app)
    .post('/admin/gallery')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', PNG, { filename: 'photo.png', contentType: 'image/png' });
  for (const [key, value] of Object.entries(fields)) req.field(key, value);
  return req;
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';

  // admin.ts resolves its upload dirs at import time, so DATA_DIR must be set first.
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lhp-gallery-'));
  process.env.DATA_DIR = dataDir;
  galleryDir = path.join(dataDir, 'uploads', 'gallery');

  const { default: adminRouter } = await import('./admin');
  app = express();
  app.use(express.json());
  app.use('/admin', adminRouter);

  initDb();
});

beforeEach(() => {
  resetDb();
  token = jwt.sign(
    { id: 'test-user', email: 'test@test.com', name: 'Test User', role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterAll(() => {
  closeDb();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('POST /admin/gallery', () => {
  it('saves a photo filed under a known album', async () => {
    const res = await upload({ album: 'Evangelism', caption: 'Street outreach' });

    expect(res.status).toBe(200);
    const row = getDb().prepare('SELECT * FROM gallery_images WHERE id = ?').get(res.body.id) as any;
    expect(row.album).toBe('Evangelism');
    expect(row.caption).toBe('Street outreach');
  });

  it('files a photo uploaded without an album under the default album', async () => {
    const res = await upload();

    expect(res.status).toBe(200);
    const row = getDb().prepare('SELECT * FROM gallery_images WHERE id = ?').get(res.body.id) as any;
    expect(row.album).toBe(DEFAULT_ALBUM);
  });

  it('rejects an album outside the fixed list and stores nothing', async () => {
    const res = await upload({ album: 'Wedding Photos' });

    expect(res.status).toBe(400);
    const count = getDb().prepare('SELECT COUNT(*) as c FROM gallery_images').get() as { c: number };
    expect(count.c).toBe(0);
  });

  it('does not leave the uploaded file behind when the album is rejected', async () => {
    const before = fs.existsSync(galleryDir) ? fs.readdirSync(galleryDir).length : 0;

    await upload({ album: 'Wedding Photos' });

    const after = fs.existsSync(galleryDir) ? fs.readdirSync(galleryDir).length : 0;
    expect(after).toBe(before);
  });
});

describe('DELETE /admin/gallery/:id', () => {
  it('removes the image file from the configured data directory', async () => {
    const res = await upload({ album: 'Sunday Service' });
    const filename = path.basename(res.body.url);
    expect(fs.existsSync(path.join(galleryDir, filename))).toBe(true);

    const del = await request(app)
      .delete(`/admin/gallery/${res.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(200);
    expect(fs.existsSync(path.join(galleryDir, filename))).toBe(false);
  });
});
