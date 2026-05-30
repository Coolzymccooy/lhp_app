import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Heart, Users, BookOpen, Phone, ChevronRight, Monitor, CreditCard, Film, Globe, Bot } from 'lucide-react';
import { site } from '../content/site';

function YoutubeSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
import HeroSlider from '../components/ui/HeroSlider';
import api from '../api/client';
import toast from 'react-hot-toast';

// NOTE: Replace these with a racially diverse photo set when the church supplies them — just drop files in /public/assets and update site.fellowshipImages.
const MINISTRIES = [
  { name: "Children's Ministry", img: '/assets/family.webp', desc: 'Fun, safe, Spirit-filled for ages 0–12', to: '/groups' },
  { name: 'Teen Fellowship', img: site.fellowshipImages.teens, desc: 'Discipleship & community for ages 13–17', to: '/groups' },
  { name: 'Young Adults', img: site.fellowshipImages.youngAdults, desc: 'Faith Igniters · for 18–35s', to: '/groups' },
  { name: "Men's Fellowship", img: site.fellowshipImages.men, desc: 'Brotherhood, prayer & accountability', to: '/groups' },
  { name: "Women's Fellowship", img: site.fellowshipImages.women, desc: 'Community, mentoring & sisterhood', to: '/groups' },
  { name: 'iCare Ministry', img: '/assets/counseling.webp', desc: 'Pastoral care & visitation', to: '/icare' },
];

const SERVICES = site.services;

const QUICK_RESOURCES = [
  { icon: Users, label: 'Meet Our Senior Pastors', to: '/about', external: false },
  { icon: Monitor, label: 'Online Church', to: '/watch-live', external: false },
  { icon: CreditCard, label: 'Give Online', to: '/give', external: false },
  { icon: Film, label: 'Vue Cinema', to: 'https://www.myvue.com/cinema/bury', external: true },
  { icon: BookOpen, label: 'Ministers & Groups', to: '/groups', external: false },
  { icon: Globe, label: 'E-Membership', to: '/membership', external: false },
  { icon: Bot, label: 'AI Copilot', to: '/chat', external: false },
  { icon: Heart, label: 'iCare Ministry', to: '/icare', external: false },
];

export default function HomePage() {
  const [lifeStage, setLifeStage] = useState('');
  const [need, setNeed] = useState('');
  const [nextStep, setNextStep] = useState<{ message: string; url: string } | null>(null);

  async function getNextStep() {
    if (!lifeStage || !need) return;
    try {
      const { data } = await api.post('/ai/next-step', { lifeStage, need });
      setNextStep(data);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <main>
      <HeroSlider />

      {/* Welcome Strip */}
      <section className="bg-gradient-brand py-8 px-4">
        <div className="container-max flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <h2 className="text-2xl font-bold">Welcome to {site.shortName}</h2>
            <p className="text-white/80 text-sm mt-1">{site.locality} · {site.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/watch-live" className="px-5 py-2.5 bg-white text-purple-700 font-bold rounded-full text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 shadow">
              <YoutubeSvg className="w-4 h-4" /> Watch Live
            </Link>
            <Link to="/membership" className="px-5 py-2.5 bg-white/15 border border-white/30 text-white font-bold rounded-full text-sm hover:bg-white/25 transition-colors">
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Join Us</p>
            <h2 className="text-4xl font-bold text-gray-900">Service Times</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {SERVICES.map(s => (
              <div key={`${s.day}-${s.name}`} className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="text-primary font-bold text-xs uppercase tracking-widest mb-1">{s.day}</div>
                <div className="font-bold text-gray-900 text-base mb-2">{s.name}</div>
                <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" /> {s.time}
                </div>
                {('note' in s && s.note) ? <div className="text-gray-400 text-xs mt-1">{s.note}</div> : null}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>The Rock Shopping Centre, Vue Cinema, Bury, BL9 0ND</span>
          </div>
        </div>
      </section>

      {/* AI Next-Step Guide */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto text-center">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Personalised for You</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Your Next Step</h2>
          <p className="text-gray-500 mb-8">Tell us a bit about yourself and we'll point you in the right direction.</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Where are you on your journey?</label>
              <select value={lifeStage} onChange={e => setLifeStage(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">Select...</option>
                <option value="new">I'm new to faith / exploring</option>
                <option value="growing">I'm a growing believer</option>
                <option value="serving">I want to serve / lead</option>
                <option value="family">I'm here for my family</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">What matters most to you right now?</label>
              <select value={need} onChange={e => setNeed(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">Select...</option>
                <option value="community">Finding community</option>
                <option value="prayer">Prayer support</option>
                <option value="counselling">Counselling / support</option>
                <option value="learning">Learning & growing</option>
              </select>
            </div>
          </div>

          <button onClick={getNextStep} disabled={!lifeStage || !need} className="px-8 py-3.5 bg-gradient-brand text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 mb-6">
            Show My Next Step
          </button>

          {nextStep && (
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 text-left">
              <p className="text-gray-800 font-medium mb-3">{nextStep.message}</p>
              <Link to={nextStep.url} className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
                Go There <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Connect</p>
            <h2 className="text-4xl font-bold text-gray-900">Our Ministries</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Something for everyone, whatever your age or stage of life.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MINISTRIES.map(m => (
              <Link key={m.name} to={m.to} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={m.img} alt={m.name} className="img-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{m.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{m.desc}</p>
                  <span className="text-primary font-semibold text-sm flex items-center gap-1">Learn more <ChevronRight className="w-4 h-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Resources */}
      <section className="section-pad bg-gray-950">
        <div className="container-max">
          <div className="text-center mb-10">
            <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-2">Helpful Links</p>
            <h2 className="text-4xl font-bold text-white">Quick Resources</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_RESOURCES.map(({ icon: Icon, label, to, external }) => (
              label === 'AI Copilot' ? (
                <button key={label} type="button" onClick={() => window.dispatchEvent(new Event('lhp:open-ai'))}
                  className="group flex flex-col items-center gap-3 p-5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-amber-500/50 hover:bg-gray-800 transition-all text-center cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors leading-tight">{label}</span>
                </button>
              ) : external ? (
                <a key={label} href={to} target="_blank" rel="noreferrer"
                  className="group flex flex-col items-center gap-3 p-5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-amber-500/50 hover:bg-gray-800 transition-all text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors leading-tight">{label}</span>
                </a>
              ) : (
                <Link key={label} to={to}
                  className="group flex flex-col items-center gap-3 p-5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-amber-500/50 hover:bg-gray-800 transition-all text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors leading-tight">{label}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Banner */}
      <section className="section-pad bg-gradient-brand">
        <div className="container-max">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white">How Can We Help?</h2>
            <p className="text-white/80 mt-3">Our pastoral team is here for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Heart, label: 'Prayer Request', sub: 'We pray for you daily', to: '/prayer', cta: 'Submit a Request' },
              { icon: Users, label: 'Counselling', sub: 'Free & confidential sessions', to: '/counselling', cta: 'Book a Session' },
              { icon: BookOpen, label: 'Watch Sermons', sub: 'Powerful messages anytime', to: '/watch-live', cta: 'Watch Now' },
            ].map(({ icon: Icon, label, sub, to, cta }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{label}</h3>
                <p className="text-white/70 text-sm mb-4">{sub}</p>
                <Link to={to} className="inline-block px-6 py-2.5 bg-white text-purple-700 font-bold rounded-full text-sm hover:bg-gray-50 transition-colors">
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container-max max-w-2xl mx-auto text-center relative">
          <InstagramSvg className="w-14 h-14 text-white mx-auto mb-5 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Follow Us on Instagram</h2>
          <p className="text-white/80 mb-6 text-sm">Stay connected — behind-the-scenes moments, service highlights & community stories.</p>
          <a
            href="https://instagram.com/rccgtlp1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-pink-600 font-bold rounded-full hover:bg-pink-50 transition-colors shadow-lg text-sm"
          >
            <InstagramSvg className="w-4 h-4" /> @rccgtlp1
          </a>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-2xl mx-auto text-center">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Get In Touch</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">We'd Love to Hear From You</h2>
          <p className="text-gray-500 mb-8">Have a question or want to find out more? Our team is happy to help.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-pink-700 transition-colors shadow">
              Contact Us
            </Link>
            <a href="tel:+44161XXXXXXX" className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
