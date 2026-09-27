import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import os from 'os';
import path from 'path';

let app: Express;
let dataDir: string;
let schema: typeof import('../db/schema');

function addAdmin(id: string, email: string) {
  schema.getDb()
    .prepare('INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, email, bcrypt.hashSync('irrelevant', 4), 'Someone', 'admin');
}

function tokenFor(id: string, email: string, expiresIn: jwt.SignOptions['expiresIn'] = '1h') {
  return jwt.sign({ id, email, name: 'Someone', role: 'admin' }, process.env.JWT_SECRET!, { expiresIn });
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lhp-auth-'));
  process.env.DATA_DIR = dataDir;

  schema = await import('../db/schema');
  const { requireAuth } = await import('./auth');

  app = express();
  app.get('/protected', requireAuth, (_req, res) => {
    res.json({ success: true });
  });

  schema.initDb();
});

beforeEach(() => {
  schema.resetDb();
});

afterAll(() => {
  schema.closeDb();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('requireAuth', () => {
  it('rejects a request with no token', async () => {
    await request(app).get('/protected').expect(401);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ id: 'a', email: 'a@b.c' }, 'not-the-secret', { expiresIn: '1h' });
    await request(app).get('/protected').set('Authorization', `Bearer ${forged}`).expect(401);
  });

  it('rejects an expired token', async () => {
    addAdmin('a1', 'real@example.org');
    const expired = jwt.sign({ id: 'a1', email: 'real@example.org' }, process.env.JWT_SECRET!, { expiresIn: '-1s' });
    await request(app).get('/protected').set('Authorization', `Bearer ${expired}`).expect(401);
  });

  it('allows a valid token whose admin still exists', async () => {
    addAdmin('a1', 'real@example.org');
    await request(app).get('/protected').set('Authorization', `Bearer ${tokenFor('a1', 'real@example.org')}`).expect(200);
  });

  it('rejects a valid token whose admin has been deleted', async () => {
    // The reason this matters: tokens last 24 hours. Removing the published
    // default admin from the database does not revoke a token an attacker
    // already holds, so deleting the row would otherwise close nothing until
    // that token expired on its own.
    addAdmin('gone', 'admin@lighthouseparish.org');
    const stolen = tokenFor('gone', 'admin@lighthouseparish.org');

    await request(app).get('/protected').set('Authorization', `Bearer ${stolen}`).expect(200);

    schema.getDb().prepare('DELETE FROM admin_users WHERE id = ?').run('gone');

    await request(app).get('/protected').set('Authorization', `Bearer ${stolen}`).expect(401);
  });

  it('rejects a token whose id no longer matches its email', async () => {
    // Guards against a deleted account's id being reused by a later one.
    addAdmin('a1', 'real@example.org');
    const mismatched = tokenFor('a1', 'someone-else@example.org');
    await request(app).get('/protected').set('Authorization', `Bearer ${mismatched}`).expect(401);
  });
});
