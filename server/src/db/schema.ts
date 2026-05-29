import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'lhp.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prayer_requests (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      category TEXT NOT NULL,
      request_text TEXT NOT NULL,
      contact_me INTEGER NOT NULL DEFAULT 0,
      ai_urgency TEXT NOT NULL DEFAULT 'normal',
      ai_category TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS counselling_sessions (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      counselling_type TEXT NOT NULL,
      preferred_date TEXT,
      description TEXT,
      ai_category TEXT,
      ai_urgency TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      assigned_to TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY,
      member_type TEXT NOT NULL DEFAULT 'new',
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS service_responses (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      responses TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS icare_requests (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      interest TEXT NOT NULL DEFAULT 'help',
      preferred_contact TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sermons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      speaker TEXT,
      summary TEXT,
      scriptures TEXT NOT NULL DEFAULT '[]',
      youtube_url TEXT,
      notes_url TEXT,
      date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prayer_wall (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      request TEXT NOT NULL,
      anonymous INTEGER NOT NULL DEFAULT 0,
      approved INTEGER NOT NULL DEFAULT 0,
      praying_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'The Rock Shopping Centre, Bury',
      type TEXT NOT NULL DEFAULT 'service',
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rsvps (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      guests INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bulletins (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      scripture TEXT,
      theme TEXT,
      announcements TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_prayer_status ON prayer_requests(status);
    CREATE INDEX IF NOT EXISTS idx_prayer_urgency ON prayer_requests(ai_urgency);
    CREATE INDEX IF NOT EXISTS idx_counselling_status ON counselling_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
    CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
    CREATE INDEX IF NOT EXISTS idx_prayer_wall_approved ON prayer_wall(approved);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_rsvps_event ON rsvps(event_id);
  `);

  // Seed default admin if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0) {
    const hash = bcrypt.hashSync('Admin@LHP2024!', 12);
    db.prepare(
      `INSERT INTO admin_users (id, email, password_hash, name, role)
       VALUES (?, ?, ?, ?, ?)`
    ).run('admin-001', 'admin@lighthouseparish.org', hash, 'LHP Admin', 'super_admin');
    console.log('✅ Default admin created: admin@lighthouseparish.org / Admin@LHP2024!');
    console.log('⚠️  Change this password immediately after first login!');
  }

  // Seed sermons from existing data
  const sermonCount = db.prepare('SELECT COUNT(*) as count FROM sermons').get() as { count: number };
  if (sermonCount.count === 0) {
    const sermons = [
      { id: 's1', title: 'Thanksgiving Service', topic: 'Gratitude', speaker: 'Pastor Paul Olujobi', summary: 'Call to thank God in every season and turn testimonies into worship', scriptures: JSON.stringify(['Psalm 100', '1 Thessalonians 5:18']), youtube_url: 'https://www.youtube.com/embed/EHLL_d1hzX4', date: '2024-11-24' },
      { id: 's2', title: 'Walking in Faith', topic: 'Faith', speaker: 'Pastor Paul Olujobi', summary: 'Understanding the nature of faith and how to walk in it daily', scriptures: JSON.stringify(['Hebrews 11:1', 'Romans 10:17']), youtube_url: '', date: '2024-11-17' },
      { id: 's3', title: 'The Power of Prayer', topic: 'Prayer', speaker: 'Pastor Paul Olujobi', summary: 'Discovering the transformative power of persistent, faith-filled prayer', scriptures: JSON.stringify(['Matthew 7:7-8', 'James 5:16']), youtube_url: '', date: '2024-11-10' },
      { id: 's4', title: 'Family: God\'s Blueprint', topic: 'Family', speaker: 'Pastor Paul Olujobi', summary: 'Exploring God\'s design for family and relationships in modern times', scriptures: JSON.stringify(['Genesis 2:24', 'Ephesians 5:25']), youtube_url: '', date: '2024-11-03' },
    ];
    const insert = db.prepare(`INSERT INTO sermons (id, title, topic, speaker, summary, scriptures, youtube_url, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    sermons.forEach(s => insert.run(s.id, s.title, s.topic, s.speaker, s.summary, s.scriptures, s.youtube_url, s.date));
  }

  // Seed admin from environment if configured
  seedAdmin(db);

  console.log('✅ Database initialized');
}

function seedAdmin(db: Database.Database) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return; // nothing to seed
  const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);
  if (existing) return;
  const { v4: uuidv4 } = require('uuid');
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), email, hash, 'Church Admin', 'admin');
  console.log(`[seed] created admin user ${email}`);
}
