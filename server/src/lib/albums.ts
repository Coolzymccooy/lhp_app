// The fixed set of gallery albums (the "sessions" the social media unit sorts
// photos into). Deliberately a closed list: when `album` was free text every
// contributor typed a different spelling, so the albums never grouped anything.
// Mirrored in client/src/constants/albums.ts — keep the two in step.
export const GALLERY_ALBUMS = [
  'Sunday Service',
  'Thanksgiving Service',
  'Lighthouse Praise',
  'Digging Deep',
  'Virtual Prayer Night',
  'Virtual Vigil',
  'Cell Groups',
  "Children's Ministry",
  'Faith Igniters',
  'Youth Church',
  "Men's Fellowship",
  "Women's Fellowship",
  "Sarah's Heart",
  'iCare Ministry',
  'Membership Class',
  'Evangelism',
  'Outreach & Food Bank',
  'Church Life',
] as const;

/**
 * Albums that were renamed after photos had already been filed under the old
 * name. `initDb` rewrites existing rows so nothing is orphaned, and uploads to
 * a retired name are rejected like any other unknown album.
 */
export const RETIRED_ALBUMS: Readonly<Record<string, GalleryAlbum>> = {
  // The church addresses teens and young adults together as Faith Igniters.
  'Teen Fellowship': 'Faith Igniters',
  'Young Adults': 'Faith Igniters',
};

export type GalleryAlbum = (typeof GALLERY_ALBUMS)[number];

/** Catch-all for photos uploaded without a chosen album. */
export const DEFAULT_ALBUM: GalleryAlbum = 'Church Life';

export function isGalleryAlbum(value: unknown): value is GalleryAlbum {
  return typeof value === 'string' && (GALLERY_ALBUMS as readonly string[]).includes(value);
}

/**
 * Album to persist for an upload.
 * - missing/blank → the default album
 * - a known album → itself (trimmed)
 * - anything else → null, so the caller rejects the request rather than
 *   silently filing the photo somewhere the uploader did not choose.
 */
export function resolveAlbum(value: unknown): GalleryAlbum | null {
  if (value === undefined || value === null) return DEFAULT_ALBUM;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return DEFAULT_ALBUM;
  return isGalleryAlbum(trimmed) ? trimmed : null;
}
