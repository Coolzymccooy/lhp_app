import { useState, useEffect } from 'react';
import api from '../api/client';

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  album: string;
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
 * Newest real photo filed under `album`, or null when the church has not
 * supplied one yet. The API already returns newest-first, so the first match
 * is the newest.
 */
export function newestInAlbum(images: readonly GalleryImage[], album: string): GalleryImage | null {
  return images.find(image => image.album === album) ?? null;
}
