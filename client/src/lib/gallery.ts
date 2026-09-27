import { UNFILED_LABEL } from '../constants/albums';

/** Shape shared by everything that displays a gallery photo. */
interface AlbumBearing {
  album: string;
}

/**
 * The album to show for a photo. Photos uploaded before the fixed album list
 * existed — or with the field left blank — collapse into one "Unfiled" label
 * rather than showing an empty badge.
 */
export function albumOf(image: AlbumBearing): string {
  return image.album?.trim() ? image.album : UNFILED_LABEL;
}

/**
 * A photo's date in British long form. SQLite hands back "YYYY-MM-DD HH:MM:SS"
 * in UTC, which Safari will not parse as-is, hence the reshaping.
 */
export function formatDate(value: string): string {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
