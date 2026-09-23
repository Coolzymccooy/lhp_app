#!/usr/bin/env node
/**
 * Bulk-import a folder of church photos into the gallery, one folder per album.
 *
 * The source folders came off a phone, so most files carry a .PNG extension
 * while actually being JPEG. Uploading them as-is would store the wrong
 * Content-Type, so every file is sniffed and given its real extension/MIME
 * before upload. Videos are skipped — the gallery is images only.
 *
 * Usage:
 *   node scripts/import-gallery.mjs --base http://localhost:5055 \
 *     --email admin@example.org --password 'secret' [--dry-run] [--limit N]
 *
 * Folder → album mapping lives in FOLDERS below.
 */

import fs from 'node:fs';
import path from 'node:path';

// `cover` is the file that should represent the album on the public site
// (the ministry cards on the landing page). Chosen for being a well-lit,
// landscape group shot rather than a close-up or a social-media graphic —
// admins can change it any time with "Use on website" in the gallery admin.
const FOLDERS = [
  {
    dir: 'LH_children_images',
    album: "Children's Ministry",
    caption: 'Our children leading and learning together',
    cover: 'IMG_2699.PNG',
  },
  {
    dir: 'lh_images_grad',
    album: 'Membership Class',
    caption: 'Membership class graduation',
    cover: 'IMG_2760.PNG',
  },
  {
    dir: 'LH_images_men',
    album: "Men's Fellowship",
    caption: "Father's Day celebration",
    cover: 'fathersday1.PNG',
  },
  {
    dir: 'LH_teens_images',
    album: 'Teen Fellowship',
    caption: 'Teens in worship',
    cover: 'IMG_2691.PNG',
  },
  {
    dir: 'lh_images_women',
    album: "Women's Fellowship",
    caption: 'Women of the Lighthouse in celebration',
    cover: 'IMG_2764.PNG',
  },
];

const DEFAULT_ROOT = 'C:/Users/segun/OneDrive/lighthouse media';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const name = key.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[name] = true;
    } else {
      args[name] = next;
      i += 1;
    }
  }
  return args;
}

/** Real image type from magic bytes — the file extension is not trustworthy. */
function sniffImage(file) {
  const fd = fs.openSync(file, 'r');
  const head = Buffer.alloc(16);
  fs.readSync(fd, head, 0, 16, 0);
  fs.closeSync(fd);

  if (head[0] === 0x89 && head.slice(1, 4).toString('latin1') === 'PNG') {
    return { ext: '.png', mime: 'image/png' };
  }
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }
  if (head.slice(0, 4).toString('latin1') === 'RIFF' && head.slice(8, 12).toString('latin1') === 'WEBP') {
    return { ext: '.webp', mime: 'image/webp' };
  }
  if (head.slice(0, 3).toString('latin1') === 'GIF') {
    return { ext: '.gif', mime: 'image/gif' };
  }
  return null;
}

async function login(base, email, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed (${res.status}): ${await res.text()}`);
  }
  const body = await res.json();
  const token = body.token ?? body.data?.token;
  if (!token) throw new Error(`Login succeeded but no token in response: ${JSON.stringify(body)}`);
  return token;
}

async function setCover(base, token, id) {
  const res = await fetch(`${base}/api/admin/gallery/${id}/cover`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`cover ${res.status}: ${await res.text()}`);
}

async function uploadOne(base, token, file, kind, album, caption) {
  const form = new FormData();
  const bytes = fs.readFileSync(file);
  const name = path.basename(file, path.extname(file)) + kind.ext;
  form.append('image', new Blob([bytes], { type: kind.mime }), name);
  form.append('album', album);
  form.append('caption', caption);

  const res = await fetch(`${base}/api/admin/gallery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  const args = parseArgs(process.argv);
  const base = (args.base ?? 'http://localhost:5055').replace(/\/$/, '');
  const root = args.root ?? DEFAULT_ROOT;
  const dryRun = Boolean(args['dry-run']);
  const limit = args.limit ? Number(args.limit) : Infinity;

  // Collect first so a bad path fails before anything is uploaded.
  const planned = [];
  const skipped = [];
  for (const { dir, album, caption, cover } of FOLDERS) {
    const folder = path.join(root, dir);
    if (!fs.existsSync(folder)) throw new Error(`Folder not found: ${folder}`);
    for (const entry of fs.readdirSync(folder).sort()) {
      const file = path.join(folder, entry);
      if (!fs.statSync(file).isFile()) continue;
      const kind = sniffImage(file);
      if (!kind) {
        skipped.push({ file: `${dir}/${entry}`, reason: 'not an image (video or unsupported)' });
        continue;
      }
      planned.push({ file, kind, album, caption, isCover: entry === cover, label: `${dir}/${entry}` });
    }
  }

  const toUpload = planned.slice(0, limit);
  console.log(`Found ${planned.length} images across ${FOLDERS.length} folders; skipping ${skipped.length} non-images.`);
  for (const s of skipped) console.log(`  skip  ${s.file} — ${s.reason}`);

  const byAlbum = {};
  for (const p of toUpload) byAlbum[p.album] = (byAlbum[p.album] ?? 0) + 1;
  console.log('\nPlanned uploads by album:');
  for (const [album, n] of Object.entries(byAlbum)) console.log(`  ${album}: ${n}`);

  if (dryRun) {
    console.log('\n--dry-run: nothing uploaded.');
    return;
  }

  if (!args.email || !args.password) throw new Error('--email and --password are required (or use --dry-run)');
  const token = await login(base, args.email, String(args.password));
  console.log(`\nLogged in to ${base}. Uploading ${toUpload.length}…`);

  let ok = 0;
  const failed = [];
  for (const [index, item] of toUpload.entries()) {
    try {
      const created = await uploadOne(base, token, item.file, item.kind, item.album, item.caption);
      ok += 1;
      if (item.isCover) await setCover(base, token, created.id);
      console.log(`  [${index + 1}/${toUpload.length}] ${item.label} → ${item.album}${item.isCover ? "  [cover]" : ""}`);
    } catch (err) {
      failed.push({ label: item.label, reason: err.message });
      console.log(`  [${index + 1}/${toUpload.length}] FAILED ${item.label}: ${err.message}`);
    }
  }

  console.log(`\nDone: ${ok} uploaded, ${failed.length} failed.`);
  if (failed.length > 0) process.exitCode = 1;
}

main().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
