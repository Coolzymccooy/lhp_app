import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { site } from '../content/site';
import { useGalleryImages, coverForAlbum, type GalleryImage } from '../hooks/useGalleryImages';
import PraiseShowcase from '../components/ui/PraiseShowcase';

const PRAISE_ALBUM = 'Lighthouse Praise';
/** How many photos the showcase ring holds before it starts to feel crowded. */
const MAX_SHOWCASE = 12;

export default function LighthousePraisePage() {
  const { images, loading } = useGalleryImages();
  const praise = site.lighthousePraise;

  const praisePhotos = useMemo(
    () => images.filter(image => image.album === PRAISE_ALBUM),
    [images]
  );

  // Until the church uploads Lighthouse Praise photos, show one cover per album
  // so the showcase has something real in it — the church's own pictures, just
  // not this event's. The heading below says which of the two is on screen.
  const fallbackPhotos = useMemo(() => {
    const albums = [...new Set(images.map(image => image.album))];
    return albums
      .map(album => coverForAlbum(images, album))
      .filter((photo): photo is GalleryImage => photo !== null);
  }, [images]);

  const showingEventPhotos = praisePhotos.length > 0;
  // Memoised so the showcase is not handed a new array identity every render.
  const showcasePhotos = useMemo(
    () => (showingEventPhotos ? praisePhotos : fallbackPhotos).slice(0, MAX_SHOWCASE),
    [showingEventPhotos, praisePhotos, fallbackPhotos]
  );

  const hasDetails = Boolean(praise.when || praise.where || praise.description);

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-gray-900 to-gray-900" />
        <div className="relative container-max px-6 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-3">
              Our biggest event of the year
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Lighthouse Praise</h1>
            {praise.tagline && (
              <p className="text-white/70 text-lg max-w-2xl mx-auto">{praise.tagline}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Showcase */}
      <section className="bg-gray-900 pb-16">
        <div className="container-max px-6">
          <h2 className="text-center text-white/80 text-sm font-semibold uppercase tracking-widest mb-6">
            {showingEventPhotos ? 'Moments from Lighthouse Praise' : 'From our church family'}
          </h2>

          {loading ? (
            <div className="h-[320px] md:h-[440px] flex items-center justify-center text-white/40 text-sm">
              Loading photos…
            </div>
          ) : showcasePhotos.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/40 text-sm">
              Photos will appear here once they are uploaded.
            </div>
          ) : (
            <PraiseShowcase images={showcasePhotos} />
          )}

          {!showingEventPhotos && showcasePhotos.length > 0 && (
            <p className="text-center text-white/40 text-xs mt-3">
              Photos from this year&rsquo;s Lighthouse Praise will show here once they are added to
              the gallery.
            </p>
          )}
        </div>
      </section>

      {/* Details */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto">
          {hasDetails ? (
            <>
              {praise.description && (
                <p className="text-gray-600 leading-relaxed text-center mb-8">{praise.description}</p>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {praise.when && (
                  <div className="flex items-start gap-3 p-5 rounded-xl border border-gray-200">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900 text-sm mb-1">When</div>
                      <div className="text-gray-600 text-sm">{praise.when}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-5 rounded-xl border border-gray-200">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900 text-sm mb-1">Where</div>
                    <div className="text-gray-600 text-sm">{praise.where ?? site.address}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-6 rounded-xl border border-gray-200 bg-gray-50">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-gray-900 mb-1">Details to be confirmed</div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This year&rsquo;s date and programme are being finalised. Get in touch and we will
                  let you know as soon as they are announced.
                </p>
              </div>
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to={praise.bookingUrl ?? '/contact'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full text-sm hover:bg-pink-700 transition-colors"
            >
              {praise.bookingUrl ? 'Book your place' : 'Keep me posted'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
