import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGalleryImages, type GalleryImage } from '../hooks/useGalleryImages';
import { UNFILED_LABEL, orderAlbums } from '../constants/albums';

const ALL_ALBUMS = 'All';

function albumOf(image: GalleryImage): string {
  return image.album?.trim() ? image.album : UNFILED_LABEL;
}

function formatDate(value: string): string {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function GalleryPage() {
  const { images, loading } = useGalleryImages();
  const [filter, setFilter] = useState<string>(ALL_ALBUMS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Only offer albums that actually hold photos, so the filter never leads to
  // an empty page. Legacy/blank albums collapse into one "Unfiled" tab.
  const albumTabs = useMemo(() => {
    const present = [...new Set(images.map(albumOf))];
    return [ALL_ALBUMS, ...orderAlbums(present)];
  }, [images]);

  const visibleImages = useMemo(
    () => (filter === ALL_ALBUMS ? images : images.filter(image => albumOf(image) === filter)),
    [images, filter]
  );

  const selected = selectedIndex === null ? null : visibleImages[selectedIndex] ?? null;

  const step = useCallback((delta: number) => {
    setSelectedIndex(current => {
      if (current === null || visibleImages.length === 0) return current;
      return (current + delta + visibleImages.length) % visibleImages.length;
    });
  }, [visibleImages.length]);

  useEffect(() => {
    if (selected === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selected, step]);

  // The lightbox covers the page: stop the page behind it from scrolling, and
  // flag the body so the fixed header and floating buttons hide (see the
  // .lightbox-open rules in index.css).
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('lightbox-open');
    return () => {
      document.body.style.overflow = previous;
      document.body.classList.remove('lightbox-open');
    };
  }, [selected]);

  function selectAlbum(album: string) {
    setSelectedIndex(null);
    setFilter(album);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-12">
      {/* Hero */}
      <div className="px-5 md:px-6 pt-6 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Gallery</h1>
          <p className="text-lg text-gray-600">
            Moments from our church family — worship, fellowship and the work God is doing among us.
          </p>
        </motion.div>
      </div>

      {/* Album filter */}
      {!loading && images.length > 0 && albumTabs.length > 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="px-5 md:px-6 pt-8 pb-2"
        >
          <div className="container-max flex flex-wrap justify-center gap-2">
            {albumTabs.map(album => (
              <button
                key={album}
                onClick={() => selectAlbum(album)}
                aria-pressed={filter === album}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filter === album
                    ? 'bg-primary text-white shadow-md shadow-pink-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {album}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grid */}
      <div className="px-5 md:px-6 pt-6">
        <div className="container-max">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-400">Loading gallery...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <Camera className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">No photos yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div
              key={filter}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
              style={{ columnGap: '1.25rem' }}
            >
              {visibleImages.map((image, index) => (
                <motion.button
                  key={image.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
                  }}
                  onClick={() => setSelectedIndex(index)}
                  className="mb-5 w-full break-inside-avoid text-left group focus:outline-none"
                  aria-label={image.caption || `Photo from ${albumOf(image)}`}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200 group-hover:ring-2 group-hover:ring-primary group-focus-visible:ring-2 group-focus-visible:ring-primary transition-all duration-300 shadow-sm group-hover:shadow-xl">
                    <img
                      src={image.url}
                      alt={image.caption || `${albumOf(image)} photo`}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    />

                    {/* Always-on caption bar — a hover-only caption is invisible
                        on touch devices, which is where most members read this. */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pt-10 pb-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                        {albumOf(image)}
                      </span>
                      {image.caption && (
                        <p className="text-white text-sm font-semibold leading-snug line-clamp-2">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Lightbox. z-[60] puts it above the z-50 header and the floating
          WhatsApp/AI buttons, which render after the page and would otherwise
          sit on top of the overlay. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selected.caption || 'Gallery photo'}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 text-white p-2 rounded-full transition-colors z-20"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {visibleImages.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); step(-1); }}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2 md:p-3 rounded-full transition-colors z-20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); step(1); }}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2 md:p-3 rounded-full transition-colors z-20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              className="relative max-w-5xl w-full flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              {/* Crossfade between photos rather than a hard swap. */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={selected.id}
                  src={selected.url}
                  alt={selected.caption || `${albumOf(selected)} photo`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                />
              </AnimatePresence>

              <motion.div
                key={`${selected.id}-meta`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-4 text-center px-4"
              >
                <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                  {albumOf(selected)}
                </span>
                {selected.caption && (
                  <p className="text-white text-base md:text-lg font-semibold mt-3">{selected.caption}</p>
                )}
                <p className="text-white/50 text-xs mt-2">
                  {formatDate(selected.created_at)}
                  {visibleImages.length > 1 && ` · ${(selectedIndex ?? 0) + 1} of ${visibleImages.length}`}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
