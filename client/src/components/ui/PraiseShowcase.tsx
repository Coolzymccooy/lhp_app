import { useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '../../hooks/useGalleryImages';

interface PraiseShowcaseProps {
  images: readonly GalleryImage[];
  /** Shown as a plain grid when WebGL is unavailable or motion is reduced. */
  className?: string;
}

type Status = 'waiting' | 'loading' | 'running' | 'fallback';

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * A WebGL ring of photographs, loaded only when it scrolls into view.
 *
 * three.js is a large dependency, so it is dynamically imported: visitors who
 * never reach this section never download it. Anything that cannot run WebGL —
 * older phones, locked-down browsers — gets a plain image grid instead, which
 * is also what search engines and screen readers see.
 */
export default function PraiseShowcase({ images, className = '' }: PraiseShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>('waiting');

  // The set of photos, as a value that only changes when the photos do. The
  // caller may hand us a fresh array on every render; depending on the array
  // itself would tear down and rebuild the scene each time.
  const urlKey = images.map(image => image.url).join('|');
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Hold off until the section is near the viewport.
  useEffect(() => {
    if (images.length === 0) {
      setStatus('fallback');
      return;
    }
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [images.length]);

  // Deliberately keyed on `visible` and `urlKey` only. Including `status` here
  // would re-run this effect the moment it sets status to 'running', and the
  // cleanup would dispose the carousel it had just created.
  useEffect(() => {
    if (!visible) return;
    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    let carousel: { dispose(): void } | null = null;
    setStatus('loading');

    (async () => {
      try {
        const { createPraiseCarousel, supportsWebGL } = await import('./praiseCarousel');
        if (cancelled) return;
        if (!supportsWebGL()) {
          setStatus('fallback');
          return;
        }
        carousel = createPraiseCarousel(
          node,
          imagesRef.current.map(image => image.url),
          { autoSpin: !prefersReducedMotion() }
        );
        setStatus('running');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    })();

    return () => {
      cancelled = true;
      carousel?.dispose();
    };
  }, [visible, urlKey]);

  if (status === 'fallback') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
        {images.slice(0, 8).map(image => (
          <img
            key={image.id}
            src={image.url}
            alt={image.caption || 'Lighthouse Praise'}
            loading="lazy"
            className="w-full h-40 object-cover rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-[320px] md:h-[440px]" />

      {status !== 'running' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/50 text-sm">Loading showcase…</span>
        </div>
      )}

      {status === 'running' && (
        <p className="text-center text-white/40 text-xs mt-2">Drag to spin</p>
      )}

      {/* Real markup for search engines and screen readers, which cannot see
          anything drawn inside a WebGL canvas. */}
      <ul className="sr-only">
        {images.map(image => (
          <li key={image.id}>{image.caption || `${image.album} photo`}</li>
        ))}
      </ul>
    </div>
  );
}
