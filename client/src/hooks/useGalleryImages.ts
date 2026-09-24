import { useState, useEffect } from 'react';
import api from '../api/client';

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  album: string;
  /** 1 when this image represents its album on the public site. */
  is_cover?: number;
  created_at: string;
}

/**
 * Public gallery photos, newest first. Failures resolve to an empty list rather
 * than throwing: callers fall back to their built-in artwork, so a gallery
 * outage degrades the page instead of breaking it.
 */
export function useGalleryImages(): { images: GalleryImage[]; loading: boolean } {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await api.get('/forms/gallery');
        if (!cancelled) setImages(data.data ?? []);
      } catch {
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { images, loading };
}

/**
 * The photo that should represent `album` on the public site: the one an admin
 * marked as cover, otherwise the newest upload (the API returns newest-first).
 * Null when the church has not supplied a photo for that album yet.
 *
 * Falling back to "newest" alone picked whatever happened to be uploaded last,
 * which is rarely the best picture — hence the explicit cover.
 */
export function coverForAlbum(images: readonly GalleryImage[], album: string): GalleryImage | null {
  const inAlbum = images.filter(image => image.album === album);
  return inAlbum.find(image => image.is_cover === 1) ?? inAlbum[0] ?? null;
}

/**
 * Every photo in `album`, cover first and the rest newest-first behind it.
 *
 * Capped because a card slideshow mounts all of its slides at once: an album
 * with fifty photos would otherwise pull fifty images down for a card the
 * visitor may never even scroll past.
 */
export function photosForAlbum(
  images: readonly GalleryImage[],
  album: string,
  limit = 8
): GalleryImage[] {
  const inAlbum = images.filter(image => image.album === album);
  const cover = inAlbum.find(image => image.is_cover === 1);
  const rest = inAlbum.filter(image => image !== cover);
  return (cover ? [cover, ...rest] : rest).slice(0, limit);
}
