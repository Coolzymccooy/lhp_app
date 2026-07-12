import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { site } from '../../content/site';

function YoutubeSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

const EXPLORE_LINKS: [string, string][] = [
  ['Watch Live', '/watch-live'],
  ['About Us', '/about'],
  ['Groups & Ministries', '/groups'],
  ['Events', '/events'],
  ['Give', '/give'],
];

const CONNECT_LINKS: [string, string][] = [
  ['Prayer Request', '/prayer'],
  ['Counselling', '/counselling'],
  ['Contact', '/contact'],
  ['FAQ', '/faq'],
];

function LinkColumn({ heading, links }: { heading: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-white font-bold mb-3 uppercase text-xs tracking-widest">{heading}</h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-gray-400 hover:text-primary transition-colors">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-900 text-gray-300">
      {/* Signature: a lighthouse "beam" glow and an oversized brand wordmark bleeding
          off the bottom edge. Purely decorative, sits behind the content. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(65% 55% at 22% 115%, rgba(233,30,154,0.16), transparent 68%)' }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none select-none absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[28%] whitespace-nowrap text-[22vw] font-bold leading-none tracking-tight md:text-[15vw]"
        style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(255,255,255,0.045)' }}
        aria-hidden="true"
      >
        Lighthouse
      </span>

      {/* pb clears the fixed WhatsApp / AI-chat buttons at the viewport corners. */}
      <div className="relative z-10 container-max px-6 pt-12 pb-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-9 md:grid-cols-[1.3fr_1fr_1fr_1.6fr] md:gap-x-10">
          {/* Brand — full width on mobile, first column on desktop */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white text-lg font-bold leading-tight">{site.shortName}</h3>
            <p className="text-primary font-semibold text-sm mt-1">RCCG · {site.locality}</p>
            <p className="text-sm leading-relaxed text-gray-400 mt-3 max-w-xs">{site.tagline}.</p>
            <div className="flex gap-3 mt-5">
              <a href={site.social.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors" aria-label="YouTube">
                <YoutubeSvg className="w-4 h-4" />
              </a>
              <a href={site.social.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                <FacebookSvg className="w-4 h-4" />
              </a>
              <a href={site.social.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                <InstagramSvg className="w-4 h-4" />
              </a>
            </div>
          </div>

          <LinkColumn heading="Explore" links={EXPLORE_LINKS} />
          <LinkColumn heading="Connect" links={CONNECT_LINKS} />

          {/* Visit — full width on mobile, last column on desktop */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold mb-3 uppercase text-xs tracking-widest">Visit Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{site.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${site.email}`} className="hover:text-primary transition-colors break-all">{site.email}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">{site.phone}</a>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              Sundays 10:00 AM · midweek online.{' '}
              <Link to="/" className="text-primary hover:underline">Service times →</Link>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} {site.name}, Bury. All rights reserved.</p>
          <Link to="/admin/login" className="text-gray-600 hover:text-gray-400 transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
