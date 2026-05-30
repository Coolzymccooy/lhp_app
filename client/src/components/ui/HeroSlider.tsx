import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { site } from '../../content/site';

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
  position?: string;
  accent: string; // tailwind color for accent dot
}

const SLIDES: Slide[] = [
  {
    image: '/assets/arise.webp',
    eyebrow: `${site.name} · ${site.locality}`,
    title: 'Arise and Shine',
    subtitle: site.tagline,
    cta: { label: 'Join Us Sunday', to: '/watch-live' },
    ctaSecondary: { label: 'About Us', to: '/about' },
    position: 'center top',
    accent: '#e91e9a',
  },
  {
    image: '/assets/auditoriumpic1.webp',
    eyebrow: 'Sunday Service',
    title: 'Experience the\nPresence',
    subtitle: 'Join us every Sunday at 10:00am · The Rock Shopping Centre, Bury',
    cta: { label: 'Watch Live', to: '/watch-live' },
    ctaSecondary: { label: 'Get Directions', to: '/contact' },
    position: 'center center',
    accent: '#764ba2',
  },
  {
    image: '/assets/family.webp',
    eyebrow: 'Ministries for every age',
    title: 'Built for Every\nFamily',
    subtitle: 'Children, teens, young adults, and beyond — find your place in the Lighthouse Church family.',
    cta: { label: 'Explore Groups', to: '/groups' },
    ctaSecondary: { label: 'E-Membership', to: '/membership' },
    position: 'center center',
    accent: '#667eea',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  const go = useCallback((next: number, _dir: 'left' | 'right' = 'right') => {
    setPrev(current);
    setCurrent((next + SLIDES.length) % SLIDES.length);
  }, [current]);

  useEffect(() => {
    const t = setInterval(() => go(current + 1, 'right'), 6000);
    return () => clearInterval(t);
  }, [current, go]);

  // Clear prev after transition
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 800);
    return () => clearTimeout(t);
  }, [prev]);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden bg-black">
      {/* Background slides */}
      {SLIDES.map((s, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)',
              opacity: isActive ? 1 : isPrev ? 0 : 0,
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
            }}
          >
            <img
              src={s.image}
              alt={s.title}
              className="img-cover"
              style={{ objectPosition: s.position ?? 'center center' }}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Multi-layer gradient for depth */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(110deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%)',
            }} />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
            }} />
          </div>
        );
      })}

      {/* Glassmorphic content card */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-max px-6 md:px-12">
          <div className="max-w-2xl">
            {/* Glass card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '24px',
                padding: '2.5rem 2.5rem 2rem',
                boxShadow: '0 8px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {/* Eyebrow with accent line */}
              <div className="flex items-center gap-3 mb-5" key={`eye-${current}`} style={{ animation: 'fadeIn 0.5s ease 0.1s both' }}>
                <div style={{ width: 32, height: 3, borderRadius: 99, background: slide.accent }} />
                <p className="text-white/70 font-semibold text-xs uppercase tracking-widest">
                  {slide.eyebrow}
                </p>
              </div>

              {/* Title */}
              <h1
                key={`title-${current}`}
                className="font-bold text-white leading-[1.08] mb-5"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
                  whiteSpace: 'pre-line',
                  animation: 'fadeIn 0.6s ease 0.15s both',
                  textShadow: '0 2px 24px rgba(0,0,0,0.5)',
                }}
              >
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p
                key={`sub-${current}`}
                className="text-white/80 leading-relaxed mb-8"
                style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                  animation: 'fadeIn 0.6s ease 0.25s both',
                  maxWidth: '34rem',
                }}
              >
                {slide.subtitle}
              </p>

              {/* CTAs */}
              <div
                key={`cta-${current}`}
                className="flex flex-wrap gap-3"
                style={{ animation: 'fadeIn 0.6s ease 0.35s both' }}
              >
                <Link
                  to={slide.cta.to}
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-full text-white text-sm transition-all"
                  style={{
                    background: slide.accent,
                    boxShadow: `0 4px 24px ${slide.accent}55`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  {slide.cta.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {slide.ctaSecondary && (
                  <Link
                    to={slide.ctaSecondary.to}
                    className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-full text-white text-sm transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.28)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
                  >
                    {slide.ctaSecondary.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side nav arrows — glassmorphic */}
      <button
        onClick={() => go(current - 1, 'left')}
        aria-label="Previous slide"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all"
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.22)',
          color: '#fff',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(current + 1, 'right')}
        aria-label="Next slide"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all"
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.22)',
          color: '#fff',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom bar: dots + slide counter */}
      <div className="absolute bottom-7 left-0 right-0 z-20 flex items-center justify-center gap-6">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? 'right' : 'left')}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                height: 4,
                borderRadius: 99,
                transition: 'all 0.4s ease',
                width: i === current ? 36 : 10,
                background: i === current ? slide.accent : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-1.5"
        style={{ opacity: 0.5 }}
      >
        <div style={{
          width: 1, height: 40,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
          animation: 'slideUp 1.5s ease infinite',
        }} />
        <p className="text-white text-[10px] uppercase tracking-[0.2em] rotate-90 origin-center mt-2">Scroll</p>
      </div>
    </section>
  );
}
