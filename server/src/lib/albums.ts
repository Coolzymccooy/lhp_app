// The fixed set of gallery albums (the "sessions" the social media unit sorts
// photos into). Deliberately a closed list: when `album` was free text every
// contributor typed a different spelling, so the albums never grouped anything.
// Mirrored in client/src/constants/albums.ts — keep the two in step.
export const GALLERY_ALBUMS = [
  'Sunday Service',
  'Thanksgiving Service',
  'Digging Deep',
  'Virtual Prayer Night',
  'Virtual Vigil',
  "Children's Ministry",
  'Teen Fellowship',
  'Young Adults',
  'Youth Church',
  "Men's Fellowship",
  "Women's Fellowship",
  "Sarah's Heart",
  'iCare Ministry',
  'Evangelism',
  'Outreach & Food Bank',
  'Church Life',
] as const;

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
