import { useMemo } from 'react';
import { ChevronRight, Clock, Heart, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGalleryImages, coverForAlbum, photosForAlbum, type GalleryImage } from '../hooks/useGalleryImages';
import AlbumSlideshow from '../components/ui/AlbumSlideshow';

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
  /** Gallery album this group draws its photos from. */
  album: string;
  ageRange: string;
  /** Stock artwork, used only until the album has a real photo. */
  img: string;
  imgPos: string;
  desc: string;
  /** Omitted where the church has not confirmed a schedule. */
  meetings?: string;
  /** Omitted where there is no named lead to publish. */
  lead?: string;
  color: string;
  accent: string;
  /** Overrides the church address for groups that meet elsewhere. */
  location?: string;
  to?: string;
  /** A ministry that runs within this group rather than alongside it. */
  subGroup?: { name: string; desc: string };
}

// `album` is spelled out rather than derived from `name`, so a group can be
// renamed on the page without silently losing its photos. See resolveGroup.
const GROUPS: Group[] = [
  {
    name: "Children's Ministry",
    album: "Children's Ministry",
    ageRange: 'Ages 0–12',
    img: '/assets/family.webp',
    imgPos: 'center 30%',
    desc: 'A vibrant, safe, and Spirit-filled environment where children discover who Jesus is through fun, worship, and age-appropriate Bible teaching. We believe children are not the church of tomorrow — they are the church of today.',
    meetings: 'Every Sunday during Sunshine Service (10:30 AM)',
    lead: "Children's Ministry Team",
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
    name: "Men's Fellowship",
    album: "Men's Fellowship",
    ageRange: 'Men 18+',
    img: '/assets/mensfellowship.webp',
    imgPos: 'center 25%',
    desc: "Brotherhood built on prayer, accountability, and the Word. Men's Fellowship equips men to lead with integrity in the home, workplace, and church — iron sharpening iron.",
    meetings: 'Monthly meetings + prayer sessions',
    lead: "Men's Ministry Team",
    color: 'bg-slate-50 border-slate-200',
    accent: 'text-slate-600',
  },
  {
    name: "Women's Fellowship",
    album: "Women's Fellowship",
    ageRange: 'Women 18+',
    img: '/assets/womenfellowship.webp',
    imgPos: 'center 25%',
    desc: "A nurturing space for women to grow in faith, build deep friendships, and discover their God-given purpose. Through mentoring, events, and prayer, Women's Fellowship empowers every woman to flourish.",
    meetings: 'Monthly gatherings + special events',
    lead: "Women's Ministry Team",
    color: 'bg-pink-50 border-pink-200',
    accent: 'text-pink-600',
  },
];

// Ministries the whole church takes part in, whatever age or stage: they are
// not somewhere you belong instead of a group above, they are things everyone
// is invited into. Grouping them separately keeps the list above answering the
// one question a newcomer actually has — "where do I fit?"
const CHURCH_WIDE: Group[] = [
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
    name: 'iCare Ministry',
    album: 'iCare Ministry',
    ageRange: 'All ages',
    img: '/assets/counseling.webp',
    imgPos: 'center 35%',
    desc: "Our pastoral care ministry that visits the sick, supports the bereaved, checks on the lonely, and ensures no one in our congregation walks through life's hardest moments alone.",
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
  {
    name: 'Lighthouse Praise',
    album: 'Lighthouse Praise',
    ageRange: 'Everyone welcome',
    img: '/assets/auditoriumpic1.webp',
    imgPos: 'center',
    desc: 'Our biggest event of the year — the whole church family together in praise, and the night we most love to invite friends, neighbours and family into.',
    // No meeting time or lead here on purpose: this year's date is not
    // confirmed, and an invented one on the page is worse than none.
    color: 'bg-indigo-50 border-indigo-200',
    accent: 'text-indigo-600',
    to: '/lighthouse-praise',
  },
  {
    name: 'Evangelism',
    album: 'Evangelism',
    ageRange: 'Everyone welcome',
    img: '/assets/hands_giving.webp',
    imgPos: 'center',
    desc: 'Taking the good news out beyond our walls — onto the streets of Bury, into our workplaces, and to the people God has already placed around each of us.',
    lead: 'Evangelism Team',
    color: 'bg-orange-50 border-orange-200',
    accent: 'text-orange-600',
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

interface GroupCardProps {
  group: Group;
  photos: readonly GalleryImage[];
  /** Mirrors the row the card sits on, so images alternate sides down the page. */
  flipped: boolean;
}

function GroupCard({ group, photos, flipped }: GroupCardProps) {
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all ${group.color}`}>
      <div className="grid lg:grid-cols-2">
        <AlbumSlideshow
          photos={photos}
          fallbackSrc={group.img}
          fallbackPos={group.imgPos}
          alt={group.name}
          className={`h-64 lg:h-auto ${flipped ? 'lg:order-2' : ''}`}
        />
        <div className={`p-8 flex flex-col justify-center ${flipped ? 'lg:order-1' : ''}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${group.color} ${group.accent}`}>
              {group.ageRange}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{group.name}</h3>
          <p className="text-gray-600 mb-5 leading-relaxed text-sm">{group.desc}</p>
          <div className="space-y-2">
            {group.meetings && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{group.meetings}</span>
              </div>
            )}
            {group.lead && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{group.lead}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{group.location ?? 'The Rock Shopping Centre, Bury BL9 0ND'}</span>
            </div>
          </div>

          {/* A ministry that runs within this one, rather than beside it */}
          {group.subGroup && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white/70 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 flex-shrink-0 ${group.accent}`} />
                <h4 className="font-bold text-gray-900 text-sm">{group.subGroup.name}</h4>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Part of {group.name}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{group.subGroup.desc}</p>
            </div>
          )}

          {/* Only pages with more to say link onward. Getting in touch is one
              invitation at the foot of the page, not six identical ones. */}
          {group.to && (
            <Link
              to={group.to}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              More about {group.name} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { images: galleryImages } = useGalleryImages();

  // Each card gets its album's photos for the slideshow, keeping the stock
  // artwork as a fallback for any group not photographed yet.
  const withPhotos = useMemo(
    () => [...GROUPS, ...CHURCH_WIDE].map(group => ({
      group,
      photos: photosForAlbum(galleryImages, group.album),
    })),
    [galleryImages]
  );
  const groupCards = withPhotos.slice(0, GROUPS.length);
  const ministryCards = withPhotos.slice(GROUPS.length);

  // Prefer a hero photo no card below is already leading with, so the page does
  // not open with the same picture twice. Falls back to the best available (and
  // then to stock) when every candidate album is also a card's first slide.
  const heroPhoto = useMemo(() => {
    const usedBelow = new Set(withPhotos.map(({ photos }) => photos[0]?.url).filter(Boolean));
    const candidates = HERO_ALBUMS
      .map(album => coverForAlbum(galleryImages, album))
      .filter((photo): photo is GalleryImage => photo !== null);
    return candidates.find(photo => !usedBelow.has(photo.url)) ?? candidates[0] ?? null;
  }, [galleryImages, withPhotos]);

  return (
    <main className="pt-20">
      {/* Hero. Taller on wide screens than the fixed-artwork heroes elsewhere,
          because this photo comes from the gallery and changes whenever the
          covers do: at 320px on a 1500px screen a band only ~30% of the photo
          survives `cover`, and whoever happens to be standing at the top of
          that month's picture loses their head. */}
      <div className="relative h-64 md:h-80 lg:h-[24rem] overflow-hidden">
        <img
          src={heroPhoto?.url ?? '/assets/youngadults.webp'}
          alt="Groups & Ministries"
          className="img-cover"
          // A hero band is far wider than it is tall, so `cover` keeps only a
          // narrow horizontal slice of the photo. Centring that slice cuts
          // people's heads off, because faces sit above the middle of a group
          // shot — hence the upward bias. Stock artwork keeps its own hand-
          // tuned offset.
          style={{ objectPosition: heroPhoto ? 'center 25%' : 'center 20%' }}
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
            Life is better together. Our ministries and small groups are where real community happens — where you'll find people who share your season of life, who'll pray with you through the hard times, and celebrate the good ones. Find your group below.
          </p>
        </div>
      </section>

      {/* Groups by age and stage */}
      <section className="section-pad bg-gray-50">
        <div className="container-max space-y-8">
          {groupCards.map(({ group, photos }, i) => (
            <GroupCard key={group.name} group={group} photos={photos} flipped={i % 2 === 1} />
          ))}
        </div>
      </section>

      {/* Church-wide ministries */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">For the Whole Church</p>
            <h2 className="text-3xl font-bold text-gray-900">Ministries &amp; Gatherings</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
              Whatever group you call home, these are for everyone.
            </p>
          </div>
          <div className="space-y-8">
            {ministryCards.map(({ group, photos }, i) => (
              <GroupCard key={group.name} group={group} photos={photos} flipped={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Service Teams */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Serve</p>
            <h2 className="text-3xl font-bold text-gray-900">Service Teams</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">There's a place for everyone to serve. Join one of our teams.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICE_TEAMS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The one invitation to get connected, for every group above */}
      <section className="section-pad bg-gradient-brand text-center">
        <div className="container-max max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Connected?</h2>
          <p className="text-white/80 mb-8">
            Tell us which group caught your eye — or that you're not sure yet — and we'll introduce you to the right people.
          </p>
          <Link to="/contact" className="px-8 py-3.5 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-50 transition-colors shadow inline-block">
            Get Connected
          </Link>
        </div>
      </section>
    </main>
  );
}
