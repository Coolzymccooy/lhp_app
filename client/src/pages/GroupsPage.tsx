import { useMemo } from 'react';
import { ChevronRight, Clock, Heart, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGalleryImages, coverForAlbum } from '../hooks/useGalleryImages';

const SERVICE_TEAMS = [
  { name: 'Worship Team', desc: 'Lead the congregation in worship through music and song.' },
  { name: 'Media Team', desc: 'Handle sound, lighting, video, and live streaming.' },
  { name: 'Technical & Social Media', desc: 'Manage the website, online platforms, and our social media presence.' },
  { name: 'Ushering', desc: 'Welcome guests and ensure services run smoothly.' },
  { name: 'Prayer Team', desc: 'Intercede for the church and minister to those in need.' },
  { name: "Children's Workers", desc: 'Teach and care for children during services.' },
  { name: 'Parking Team', desc: 'Direct traffic and assist with parking.' },
  { name: 'Hospitality', desc: 'Provide refreshments and fellowship opportunities.' },
];

interface Group {
  name: string;
  /** Gallery album this group draws its photo from. */
  album: string;
  ageRange: string;
  /** Stock artwork, used only until the album has a real photo. */
  img: string;
  imgPos: string;
  desc: string;
  meetings: string;
  lead: string;
  color: string;
  accent: string;
  /** Overrides the church address for groups that meet elsewhere. */
  location?: string;
  to?: string;
  /** A ministry that runs within this group rather than alongside it. */
  subGroup?: { name: string; desc: string };
}

// `album` is spelled out rather than derived from `name`, so a group can be
// renamed on the page without silently losing its photos. See resolvedGroups.
const GROUPS: Group[] = [
  {
    name: "Children's Ministry",
    album: "Children's Ministry",
    ageRange: 'Ages 0–12',
    img: '/assets/family.webp',
    imgPos: 'center 30%',
    desc: 'A vibrant, safe, and Spirit-filled environment where children discover who Jesus is through fun, worship, and age-appropriate Bible teaching. We believe children are not the church of tomorrow — they are the church of today.',
    meetings: 'Every Sunday during Sunshine Service (10:30 AM)',
    lead: 'Children\'s Ministry Team',
    color: 'bg-yellow-50 border-yellow-200',
    accent: 'text-yellow-600',
  },
  {
    name: 'Faith Igniters',
    album: 'Faith Igniters',
    ageRange: 'Ages 13–35',
    img: '/assets/teenfellowship.webp',
    imgPos: 'center 30%',
    desc: 'Our teenagers and young adults, together. A community where you can ask real questions, find true friends, and build a personal faith that holds through school, university, career and everything after. From Bible study to outings, Faith Igniters is where young people grow side by side.',
    meetings: 'Sundays + monthly hangouts',
    lead: 'Faith Igniters Leadership',
    color: 'bg-purple-50 border-purple-200',
    accent: 'text-purple-600',
  },
  {
    name: 'Cell Groups',
    album: 'Cell Groups',
    ageRange: 'All ages',
    img: '/assets/bible.webp',
    imgPos: 'center',
    desc: 'Church close to home. Cell groups meet every weekend in homes near you — grouped by where you live — to pray together, share the Word, and look out for one another through the week.',
    meetings: 'Every weekend, in homes across the area',
    lead: 'Cell Group Leaders',
    location: 'Homes across the area — matched to where you live',
    color: 'bg-teal-50 border-teal-200',
    accent: 'text-teal-600',
  },
  {
    name: "Men's Fellowship",
    album: "Men's Fellowship",
    ageRange: 'Men 18+',
    img: '/assets/mensfellowship.webp',
    imgPos: 'center 25%',
    desc: 'Brotherhood built on prayer, accountability, and the Word. Men\'s Fellowship equips men to lead with integrity in the home, workplace, and church — iron sharpening iron.',
    meetings: 'Monthly meetings + prayer sessions',
    lead: 'Men\'s Ministry Team',
    color: 'bg-slate-50 border-slate-200',
    accent: 'text-slate-600',
  },
  {
    name: "Women's Fellowship",
    album: "Women's Fellowship",
    ageRange: 'Women 18+',
    img: '/assets/womenfellowship.webp',
    imgPos: 'center 25%',
    desc: 'A nurturing space for women to grow in faith, build deep friendships, and discover their God-given purpose. Through mentoring, events, and prayer, Women\'s Fellowship empowers every woman to flourish.',
    meetings: 'Monthly gatherings + special events',
    lead: 'Women\'s Ministry Team',
    color: 'bg-pink-50 border-pink-200',
    accent: 'text-pink-600',
  },
  {
    name: 'iCare Ministry',
    album: 'iCare Ministry',
    ageRange: 'All ages',
    img: '/assets/counseling.webp',
    imgPos: 'center 35%',
    desc: 'Our pastoral care ministry that visits the sick, supports the bereaved, checks on the lonely, and ensures no one in our congregation walks through life\'s hardest moments alone.',
    meetings: 'Ongoing visitation & support',
    lead: 'Pastoral Care Team',
    color: 'bg-green-50 border-green-200',
    accent: 'text-green-600',
    to: '/icare',
    // Sits inside iCare rather than standing alone: it is part of the same
    // pastoral care ministry, led by the Pastors.
    subGroup: {
      name: "Sarah's Heart",
      desc: "The Pastors' ministry for couples waiting on God for the fruit of the womb — prayer, spiritual and emotional support, and information on available medical options and signposting.",
    },
  },
];

// Albums worth showing in the wide hero banner, best first. A banner needs a
// broad congregation shot, so a whole-church gathering beats a single group.
const HERO_ALBUMS = [
  'Sunday Service',
  'Thanksgiving Service',
  'Church Life',
  'Membership Class',
  "Men's Fellowship",
  "Women's Fellowship",
];

export default function GroupsPage() {
  const { images: galleryImages } = useGalleryImages();

  // Prefer the church's own photo for each group, keeping the stock artwork for
  // any group not photographed yet. Real photos are already well framed, so
  // they use a plain centre crop rather than the stock images' tuned offsets.
  const resolvedGroups = useMemo(
    () => GROUPS.map(group => {
      const photo = coverForAlbum(galleryImages, group.album);
      return photo ? { ...group, img: photo.url, imgPos: 'center' } : group;
    }),
    [galleryImages]
  );

  // Prefer a hero photo no group card below is already using, so the page does
  // not show the same picture twice. Falls back to the best available (and then
  // to stock) when every candidate album is also a group's cover.
  const heroPhoto = useMemo(() => {
    const usedBelow = new Set(resolvedGroups.map(group => group.img));
    const candidates = HERO_ALBUMS
      .map(album => coverForAlbum(galleryImages, album))
      .filter((photo): photo is NonNullable<typeof photo> => photo !== null);
    return candidates.find(photo => !usedBelow.has(photo.url)) ?? candidates[0] ?? null;
  }, [galleryImages, resolvedGroups]);

  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={heroPhoto?.url ?? '/assets/youngadults.webp'}
          alt="Groups & Ministries"
          className="img-cover"
          style={{ objectPosition: heroPhoto ? 'center' : 'center 20%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Find Your Place</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Groups & Ministries</h1>
            <p className="text-white/80 mt-2 max-w-lg">Something for everyone, whatever your age or stage of life</p>
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto text-center">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Community</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">You Were Made for This</h2>
          <p className="text-gray-500 leading-relaxed">
            Life is better together. Our ministries and small groups are where real community happens — where you'll find people who share your season of life, who'll pray with you through the hard times, and celebrate the good ones. Find your group below and get connected today.
          </p>
        </div>
      </section>

      {/* Groups */}
      <section className="section-pad bg-gray-50">
        <div className="container-max space-y-8">
          {resolvedGroups.map((g, i) => (
            <div key={g.name} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all ${g.color}`}>
              <div className={`grid lg:grid-cols-2 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`relative h-64 lg:h-auto overflow-hidden ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img src={g.img} alt={g.name} className="img-cover" style={{ objectPosition: g.imgPos }} />
                </div>
                <div className={`p-8 flex flex-col justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${g.color} ${g.accent}`}>
                      {g.ageRange}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{g.name}</h3>
                  <p className="text-gray-600 mb-5 leading-relaxed text-sm">{g.desc}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{g.meetings}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{g.lead}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{g.location ?? 'The Rock Shopping Centre, Bury BL9 0ND'}</span>
                    </div>
                  </div>

                  {/* A ministry that runs within this one, rather than beside it */}
                  {g.subGroup && (
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white/70 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className={`w-4 h-4 flex-shrink-0 ${g.accent}`} />
                        <h4 className="font-bold text-gray-900 text-sm">{g.subGroup.name}</h4>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Part of {g.name}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{g.subGroup.desc}</p>
                    </div>
                  )}
                  <Link
                    to={g.to || '/contact'}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    Get Connected <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Teams */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Serve</p>
            <h2 className="text-3xl font-bold text-gray-900">Service Teams</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">There's a place for everyone to serve. Join one of our teams.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICE_TEAMS.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-gradient-brand text-center">
        <div className="container-max max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Not Sure Where to Start?</h2>
          <p className="text-white/80 mb-8">We're happy to help you find the right place to connect. Send us a message and we'll point you in the right direction.</p>
          <Link to="/contact" className="px-8 py-3.5 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-50 transition-colors shadow">
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
