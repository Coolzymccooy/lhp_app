import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import bcrypt from 'bcryptjs';

/**
 * The published default admin.
 *
 * These exact values sat in this repo — which is public — and were seeded into
 * every fresh database, including production. Anyone who read the source could
 * sign in. The seed is gone; these constants exist only so the migration that
 * cleans up existing installs can be tested.
 */
const LEGACY_EMAIL = 'admin@lighthouseparish.org';
const LEGACY_ID = 'admin-001';

let dataDir: string;
let schema: typeof import('./schema');

function insertLegacyAdmin() {
  schema.getDb()
    .prepare(
      `INSERT INTO admin_users (id, email, password_hash, name, role)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(LEGACY_ID, LEGACY_EMAIL, bcrypt.hashSync('Admin@LHP2024!', 4), 'LHP Admin', 'super_admin');
}

function insertRealAdmin(email = 'pastor@example.org') {
  schema.getDb()
    .prepare(
      `INSERT INTO admin_users (id, email, password_hash, name, role)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(`real-${email}`, email, bcrypt.hashSync('a-real-password', 4), 'Church Admin', 'admin');
}

function admins(): string[] {
  return schema.getDb()
    .prepare('SELECT email FROM admin_users ORDER BY email')
    .all()
    .map((row: unknown) => (row as { email: string }).email);
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lhp-adminseed-'));
  process.env.DATA_DIR = dataDir;
  schema = await import('./schema');
  schema.initDb();
});

beforeEach(() => {
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
  schema.resetDb();
});

afterEach(() => {
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
});

afterAll(() => {
  schema.closeDb();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('admin seeding', () => {
  it('creates no admin at all on a fresh database', () => {
    schema.initDb();
    expect(admins()).toEqual([]);
  });

  it('seeds only from the environment when configured', () => {
    process.env.ADMIN_EMAIL = 'pastor@example.org';
    process.env.ADMIN_PASSWORD = 'set-in-coolify';
    schema.initDb();
    expect(admins()).toEqual(['pastor@example.org']);
  });
});

describe('removing the published default admin', () => {
  it('deletes it once a real admin exists', () => {
    insertLegacyAdmin();
    insertRealAdmin();

    schema.initDb();

    expect(admins()).toEqual(['pastor@example.org']);
  });

  it('deletes it when the real admin is seeded from the environment in the same boot', () => {
    insertLegacyAdmin();
    process.env.ADMIN_EMAIL = 'pastor@example.org';
    process.env.ADMIN_PASSWORD = 'set-in-coolify';

    schema.initDb();

    expect(admins()).toEqual(['pastor@example.org']);
  });

  it('keeps it when it is the only admin, rather than locking the church out', () => {
    insertLegacyAdmin();

    schema.initDb();

    // Deleting the sole account would leave nobody able to sign in and no way
    // back in short of shell access to the server. It is left in place and
    // loudly warned about instead.
    expect(admins()).toEqual([LEGACY_EMAIL]);
  });

  it('rotates the password when ADMIN_EMAIL is set to the legacy address', () => {
    // Otherwise this configuration is a trap: seedAdmin sees the account
    // already exists and returns without applying ADMIN_PASSWORD, and the
    // cleanup below sees no other admin and keeps the row — so the published
    // password survives every restart while appearing to be configured.
    insertLegacyAdmin();
    process.env.ADMIN_EMAIL = LEGACY_EMAIL;
    process.env.ADMIN_PASSWORD = 'a-new-password';

    schema.initDb();

    expect(admins()).toEqual([LEGACY_EMAIL]);
    const row = schema.getDb()
      .prepare('SELECT password_hash FROM admin_users WHERE email = ?')
      .get(LEGACY_EMAIL) as { password_hash: string };
    expect(bcrypt.compareSync('a-new-password', row.password_hash)).toBe(true);
    expect(bcrypt.compareSync('Admin@LHP2024!', row.password_hash)).toBe(false);
  });

  it('is idempotent — a second boot changes nothing', () => {
    insertLegacyAdmin();
    insertRealAdmin();

    schema.initDb();
    schema.initDb();

    expect(admins()).toEqual(['pastor@example.org']);
  });

  it('leaves an unrelated admin that merely shares the legacy name alone', () => {
    insertRealAdmin('someone@example.org');
    insertRealAdmin('another@example.org');

    schema.initDb();

    expect(admins()).toEqual(['another@example.org', 'someone@example.org']);
  });
});
