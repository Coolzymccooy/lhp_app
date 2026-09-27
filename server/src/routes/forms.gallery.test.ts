import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getDb, initDb, resetDb, closeDb } from '../db/schema';

let app: Express;
let dataDir: string;

/** Inserts a photo with an explicit timestamp so ordering is deterministic. */
function insertPhoto(id: string, album: string, createdAt: string, isCover = 0) {
  getDb()
    .prepare(
      `INSERT INTO gallery_images (id, url, caption, album, is_cover, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(id, `/uploads/gallery/${id}.jpg`, '', album, isCover, createdAt);
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lhp-public-gallery-'));
  process.env.DATA_DIR = dataDir;

  const { default: formsRouter } = await import('./forms');
  app = express();
  app.use(express.json());
  app.use('/forms', formsRouter);

  initDb();
});

beforeEach(() => {
  resetDb();
  initDb();
});

afterAll(() => {
  closeDb();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('GET /forms/gallery', () => {
  it('returns the cover flag so the public site can pick the chosen photo', async () => {
    insertPhoto('a', "Men's Fellowship", '2026-01-01 10:00:00', 1);
    insertPhoto('b', "Men's Fellowship", '2026-01-02 10:00:00');

    const res = await request(app).get('/forms/gallery').expect(200);
    const cover = res.body.data.find((row: { id: string }) => row.id === 'a');
    expect(cover.is_cover).toBe(1);
  });

  it('returns photos newest first', async () => {
    insertPhoto('old', 'Church Life', '2026-01-01 10:00:00');
    insertPhoto('new', 'Church Life', '2026-06-01 10:00:00');

    const res = await request(app).get('/forms/gallery').expect(200);
    expect(res.body.data.map((row: { id: string }) => row.id)).toEqual(['new', 'old']);
  });

  it("includes an album's cover even when it is older than the newest 200 photos", async () => {
    // The chosen cover, then enough newer uploads to push it out of the window.
    insertPhoto('chosen-cover', "Women's Fellowship", '2020-01-01 10:00:00', 1);
    for (let i = 0; i < 250; i++) {
      insertPhoto(`filler-${i}`, 'Church Life', `2026-01-01 10:${String(i % 60).padStart(2, '0')}:00`);
    }

    const res = await request(app).get('/forms/gallery').expect(200);
    const ids = res.body.data.map((row: { id: string }) => row.id);

    // Without this the cover control silently stops affecting the public site:
    // the album's chosen photo never reaches the client, so it falls back to a
    // newer photo, or to stock artwork when the whole album is older.
    expect(ids).toContain('chosen-cover');
  });

  it('still caps the number of ordinary photos it returns', async () => {
    for (let i = 0; i < 260; i++) {
      insertPhoto(`filler-${i}`, 'Church Life', `2026-01-01 10:${String(i % 60).padStart(2, '0')}:00`);
    }

    const res = await request(app).get('/forms/gallery').expect(200);
    expect(res.body.data.length).toBe(200);
  });
});
