import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryImage } from '../../hooks/useGalleryImages';
import { albumOf, formatDate } from '../../lib/gallery';

/** How long a photo holds before the story moves on by itself. */
const ADVANCE_MS = 6000;

interface AlbumStoryProps {
  images: readonly GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Open this photo full screen in the lightbox. */
  onExpand: () => void;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * One album, shown as a story: a large photo at a time with its caption, and a
 * filmstrip of the rest underneath.
 *
 * The stage letterboxes rather than crops — a church photo is somebody's
 * daughter on a drum kit, and cropping her to fit a fixed frame is worse than
 * a band of blur down the sides. The backdrop is the same photo, blurred, so
 * any shape of picture sits in a frame that belongs to it.
 *
 * The filmstrip is not decoration. Without it a slideshow is a trap: a parent
 * looking for their own child's photo would have to click through the album
 * one picture at a time, which is exactly why the grid stays one tap away.
 */
export default function AlbumStory({ images, index, onIndexChange, onExpand }: AlbumStoryProps) {
  const count = images.length;
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  const current = images[safeIndex];

  const [paused, setPaused] = useState(false);
  // Autoplay is a gentle invitation, not a ride. The moment a visitor steers
  // it themselves, it stops for good rather than tugging them onwards.
  const [tookControl, setTookControl] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (delta: number, manual = true) => {
      if (count === 0) return;
      if (manual) setTookControl(true);
      onIndexChange((Math.min(index, count - 1) + delta + count) % count);
    },
    [count, index, onIndexChange]
  );

  const animated = count > 1 && !prefersReducedMotion();

  useEffect(() => {
    if (!animated || paused || tookControl) return;
    const timer = window.setInterval(() => go(1, false), ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [animated, paused, tookControl, go]);

  // Keep the active thumbnail in view as the story moves. This scrolls the
  // filmstrip itself rather than calling scrollIntoView, which also scrolls
  // every scrollable ancestor — including the page, which would yank the album
  // tabs and the view toggle off the top of the screen the moment an album was
  // opened.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.querySelector<HTMLElement>('[data-active="true"]');
    if (!strip || !thumb) return;
    strip.scrollTo({
      left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, [safeIndex]);

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [count, go]);

  if (!current) return null;

  const next = images[(safeIndex + 1) % count];
  const caption = current.caption?.trim();

  return (
    <div
      className="container-max"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-xl aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]"
        aria-roledescription={count > 1 ? 'carousel' : undefined}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animated ? 0.6 : 0, ease: 'easeOut' }}
          >
            {/* The photo again, blurred, so a portrait shot sits in a frame of
                its own colours instead of two black bars. */}
            <img
              src={current.url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
            />
            <img
              src={current.url}
              alt={caption || `${albumOf(current)} photo`}
              className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Fetched early so the crossfade has something to fade to. */}
        {next && next.id !== current.id && (
          <img src={next.url} alt="" aria-hidden="true" className="absolute w-px h-px opacity-0 pointer-events-none" />
        )}

        {/* Caption rail */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pt-14 pb-5 md:px-8 md:pb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">
            {albumOf(current)}
          </span>
          {caption && (
            <p className="text-white text-sm md:text-lg font-semibold leading-snug mt-2 max-w-3xl">
              {caption}
            </p>
          )}
          <p className="text-white/55 text-xs mt-1.5">
            {formatDate(current.created_at)}
            {count > 1 && ` · ${safeIndex + 1} of ${count}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onExpand}
          aria-label="View this photo full screen"
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors"
        >
          <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Filmstrip */}
      {count > 1 && (
        <div
          ref={stripRef}
          className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x"
          role="tablist"
          aria-label="Photos in this album"
        >
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              data-active={i === safeIndex}
              aria-label={image.caption || `Photo ${i + 1} of ${count}`}
              onClick={() => { setTookControl(true); onIndexChange(i); }}
              className={`relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden snap-center transition-all ${
                i === safeIndex
                  ? 'ring-2 ring-primary opacity-100'
                  : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={image.url} alt="" aria-hidden="true" loading="lazy" className="img-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
