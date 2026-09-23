// Mirror of the server's album list (server/src/lib/albums.ts) — keep the two
// in step. The server rejects any album outside this list, so a value added
// here without adding it there will fail on upload.
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
  'Membership Class',
  'Evangelism',
  'Outreach & Food Bank',
  'Church Life',
] as const;

export type GalleryAlbum = (typeof GALLERY_ALBUMS)[number];

/** Catch-all for photos uploaded without a chosen album. */
export const DEFAULT_ALBUM: GalleryAlbum = 'Church Life';

/** Label for photos whose album predates the fixed list (or was left blank). */
export const UNFILED_LABEL = 'Unfiled';

/**
 * Album order used for filter tabs: the fixed list first (so tabs stay in a
 * stable, meaningful order rather than jumping about as photos are added),
 * then any legacy album still present in the data.
 */
export function orderAlbums(present: readonly string[]): string[] {
  const seen = new Set(present);
  const known = GALLERY_ALBUMS.filter(album => seen.has(album));
  const legacy = present.filter(album => !(GALLERY_ALBUMS as readonly string[]).includes(album)).sort();
  return [...known, ...legacy];
}
