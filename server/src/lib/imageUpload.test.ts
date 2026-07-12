import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { imageUploadMiddleware, MAX_IMAGE_BYTES } from './imageUpload';

describe('imageUploadMiddleware', () => {
  let dir: string;
  let app: express.Express;

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'img-upload-test-'));
    app = express();
    app.post('/upload', imageUploadMiddleware(dir), (req, res) => {
      res.json({ success: true, filename: req.file?.filename ?? null });
    });
  });

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('accepts a small JPEG, stores it, and lowercases the extension', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('image', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: 'photo.JPG',
        contentType: 'image/jpeg',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.filename).toMatch(/\.jpg$/);
    expect(fs.existsSync(path.join(dir, res.body.filename))).toBe(true);
  });

  it('rejects oversized images with 413 and a friendly message', async () => {
    const big = Buffer.alloc(MAX_IMAGE_BYTES + 1);
    const res = await request(app)
      .post('/upload')
      .attach('image', big, { filename: 'big.png', contentType: 'image/png' });
    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('8MB');
  });

  it('rejects unsupported image types with 415 and a friendly message', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('image', Buffer.from('not really an image'), {
        filename: 'photo.heic',
        contentType: 'image/heic',
      });
    expect(res.status).toBe(415);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('JPG');
  });

  it('accepts webp under the size limit', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('image', Buffer.from('RIFF....WEBP'), {
        filename: 'pic.webp',
        contentType: 'image/webp',
      });
    expect(res.status).toBe(200);
    expect(res.body.filename).toMatch(/\.webp$/);
  });
});
