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
  // requireAuth checks the token's admin still exists, so the row has to be
  // recreated after every reset — a signature alone no longer authenticates.
  getDb()
    .prepare('INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)')
    .run('test-user', 'test@test.com', 'unused-hash', 'Test User', 'admin');
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

describe('PATCH /admin/gallery/:id/cover', () => {
  it('marks an image as its album cover', async () => {
    const res = await upload({ album: 'Faith Igniters' });

    const patch = await request(app)
      .patch(`/admin/gallery/${res.body.id}/cover`)
      .set('Authorization', `Bearer ${token}`);

    expect(patch.status).toBe(200);
    const row = getDb().prepare('SELECT is_cover FROM gallery_images WHERE id = ?').get(res.body.id) as any;
    expect(row.is_cover).toBe(1);
  });

  it('allows only one cover per album, clearing the previous one', async () => {
    const first = await upload({ album: 'Faith Igniters' });
    const second = await upload({ album: 'Faith Igniters' });

    await request(app).patch(`/admin/gallery/${first.body.id}/cover`).set('Authorization', `Bearer ${token}`);
    await request(app).patch(`/admin/gallery/${second.body.id}/cover`).set('Authorization', `Bearer ${token}`);

    const rows = getDb()
      .prepare('SELECT id, is_cover FROM gallery_images WHERE album = ?')
      .all('Faith Igniters') as Array<{ id: string; is_cover: number }>;
    const covers = rows.filter(r => r.is_cover === 1).map(r => r.id);
    expect(covers).toEqual([second.body.id]);
  });

  it('does not disturb covers in other albums', async () => {
    const teen = await upload({ album: 'Faith Igniters' });
    const men = await upload({ album: "Men's Fellowship" });

    await request(app).patch(`/admin/gallery/${teen.body.id}/cover`).set('Authorization', `Bearer ${token}`);
    await request(app).patch(`/admin/gallery/${men.body.id}/cover`).set('Authorization', `Bearer ${token}`);

    const teenRow = getDb().prepare('SELECT is_cover FROM gallery_images WHERE id = ?').get(teen.body.id) as any;
    expect(teenRow.is_cover).toBe(1);
  });

  it('404s for an unknown image', async () => {
    const res = await request(app)
      .patch('/admin/gallery/does-not-exist/cover')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /admin/gallery', () => {
  it('returns the cover flag so the admin grid can show it', async () => {
    const res = await upload({ album: 'Evangelism' });
    await request(app).patch(`/admin/gallery/${res.body.id}/cover`).set('Authorization', `Bearer ${token}`);

    const list = await request(app).get('/admin/gallery').set('Authorization', `Bearer ${token}`);
    const row = list.body.data.find((r: any) => r.id === res.body.id);
    expect(row.is_cover).toBe(1);
  });
});

describe('album rename migration', () => {
  it('re-files photos left under a retired album name', async () => {
    const res = await upload({ album: 'Faith Igniters' });
    // Simulate a row uploaded before the rename.
    getDb().prepare('UPDATE gallery_images SET album = ? WHERE id = ?').run('Teen Fellowship', res.body.id);

    initDb();

    const row = getDb().prepare('SELECT album FROM gallery_images WHERE id = ?').get(res.body.id) as any;
    expect(row.album).toBe('Faith Igniters');
  });
});
