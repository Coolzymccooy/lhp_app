import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryImage } from '../../hooks/useGalleryImages';

/** How long each photo holds before the slideshow moves on. */
const ADVANCE_MS = 5000;

interface AlbumSlideshowProps {
  photos: readonly GalleryImage[];
  /** Stock artwork, shown only while the album has no photos of its own. */
  fallbackSrc: string;
  fallbackPos?: string;
  alt: string;
  className?: string;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * A crossfading slideshow of one album's photographs.
 *
 * It advances on its own so a card tells a story rather than showing a single
 * frozen picture, but only while it is actually on screen and nobody is
 * interacting with it — six cards each running a timer for photos nobody can
 * see is wasted work, and a slideshow that moves under the cursor as you reach
 * for the arrow is maddening. Visitors who have asked for reduced motion get a
 * still image they can page through by hand.
 */
export default function AlbumSlideshow({
  photos,
  fallbackSrc,
  fallbackPos = 'center',
  alt,
  className = '',
}: AlbumSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const count = photos.length;
  const animated = count > 1 && !prefersReducedMotion();

  // An album can shrink between renders — a photo deleted, a filter changed —
  // so the index is clamped where it is read rather than corrected afterwards
  // by an effect, which would render one frame pointing past the end first.
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);

  const go = useCallback(
    (delta: number) => setIndex(current => {
      const from = Math.min(current, count - 1);
      return (from + delta + count) % count;
    }),
    [count]
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => setOnScreen(entries.some(entry => entry.isIntersecting)),
      { rootMargin: '100px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animated || paused || !onScreen) return;
    const timer = window.setInterval(() => go(1), ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [animated, paused, onScreen, go]);

  if (count === 0) {
    return (
      <div ref={rootRef} className={`relative overflow-hidden ${className}`}>
        <img src={fallbackSrc} alt={alt} className="img-cover" style={{ objectPosition: fallbackPos }} />
      </div>
    );
  }

  const caption = photos[safeIndex]?.caption?.trim();

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden group/slides ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label={count > 1 ? `${alt} photos` : undefined}
    >
      {photos.map((photo, i) => (
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.caption || alt}
          // Only the first slide is worth blocking on; the rest can arrive as
          // the slideshow reaches them.
          loading={i === 0 ? 'eager' : 'lazy'}
          aria-hidden={i !== safeIndex}
          className={`img-cover absolute inset-0 ${
            animated ? 'transition-opacity duration-700 ease-in-out' : ''
          } ${i === safeIndex ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* Keeps the box at its intended height: the slides themselves are all
          absolutely positioned, so something has to occupy the flow. */}
      <div className="invisible h-full w-full" aria-hidden="true" />

      {caption && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pt-8 ${
            count > 1 ? 'pb-7' : 'pb-3'
          }`}
        >
          <p className="text-white text-xs leading-snug line-clamp-2">{caption}</p>
        </div>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={`Previous ${alt} photo`}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/slides:opacity-100 focus-visible:opacity-100 hover:bg-black/60 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={`Next ${alt} photo`}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/slides:opacity-100 focus-visible:opacity-100 hover:bg-black/60 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1} of ${count}`}
                aria-current={i === safeIndex}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
