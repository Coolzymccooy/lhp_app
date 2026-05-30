import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import logoUrl from '/assets/lhp_emblem.png';
import { site } from '../../content/site';

const NAV_LINKS = [
  { label: 'Watch Live', to: '/watch-live' },
  {
    label: 'Explore LHP',
    children: [
      { label: 'About Us', to: '/about' },
      { label: 'Groups & Ministries', to: '/groups' },
      { label: 'Events', to: '/events' },
      { label: 'Gallery', to: '/gallery' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Senior Pastors', to: '/senior-pastors' },
    ],
  },
  { label: 'E-Membership', to: '/membership' },
  { label: 'iCare', to: '/icare' },
  { label: 'Give', to: '/give' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
      <div className="container-max flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src={logoUrl} alt={site.name} className="h-12 md:h-16 w-auto object-contain" />
          <div className="hidden sm:block">
            <div className="font-bold text-base md:text-lg leading-tight text-gray-900">{site.shortName} RCCG</div>
            <div className="text-xs md:text-sm text-primary font-semibold">{site.locality}</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link =>
            link.children ? (
              <div key={link.label} className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-primary rounded-lg hover:bg-pink-50 transition-colors">
                  {link.label} <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {link.children.map(child => (
                    <NavLink key={child.to} to={child.to} className={({ isActive }) => `block px-4 py-3 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${isActive ? 'text-primary bg-pink-50' : 'text-gray-700 hover:text-primary hover:bg-pink-50'}`}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={link.to} to={link.to!} className={({ isActive }) => `px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'text-primary bg-pink-50' : 'text-gray-700 hover:text-primary hover:bg-pink-50'}`}>
                {link.label}
              </NavLink>
            )
          )}

          <Link to="/prayer" className="ml-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-pink-700 transition-colors shadow-sm">
            Prayer Request
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(o => !o)} className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100" aria-label="Toggle menu">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 ${menuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(link =>
            link.children ? (
              <div key={link.label}>
                <button onClick={() => setDropdownOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 rounded-lg hover:bg-pink-50">
                  {link.label} <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="ml-4 flex flex-col gap-1">
                    {link.children.map(child => (
                      <NavLink key={child.to} to={child.to} className={({ isActive }) => `px-4 py-2 text-sm font-medium rounded-lg ${isActive ? 'text-primary bg-pink-50' : 'text-gray-600 hover:text-primary hover:bg-pink-50'}`}>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={link.to} to={link.to!} className={({ isActive }) => `px-4 py-3 text-sm font-semibold rounded-lg ${isActive ? 'text-primary bg-pink-50' : 'text-gray-700 hover:text-primary hover:bg-pink-50'}`}>
                {link.label}
              </NavLink>
            )
          )}
          <Link to="/prayer" className="mt-2 px-4 py-3 bg-primary text-white text-sm font-bold rounded-full text-center hover:bg-pink-700 transition-colors">
            Prayer Request
          </Link>
        </div>
      </div>
    </header>
  );
}
