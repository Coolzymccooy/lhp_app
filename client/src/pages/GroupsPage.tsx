import { ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const GROUPS = [
  {
    name: "Children's Ministry",
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
    name: 'Teen Fellowship (TF)',
    ageRange: 'Ages 13–17',
    img: '/assets/teenfellowship.webp',
    imgPos: 'center 30%',
    desc: 'A dynamic community where teenagers can ask real questions, find true friends, and build a personal faith that lasts. From Bible studies to outings, TF is the place for young people to grow together.',
    meetings: 'Sundays + Monthly hangouts',
    lead: 'Youth Ministry Team',
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-600',
  },
  {
    name: 'Young Adults',
    ageRange: 'Ages 18–35',
    img: '/assets/youngadults.webp',
    imgPos: 'center 25%',
    desc: 'A community for young adults navigating career, relationships, identity, and purpose — all through the lens of faith. We meet, connect, pray, and push each other to live God\'s best.',
    meetings: 'Monthly meetings + online community',
    lead: 'Young Adults Leadership',
    color: 'bg-purple-50 border-purple-200',
    accent: 'text-purple-600',
  },
  {
    name: "Men's Fellowship",
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
    ageRange: 'All ages',
    img: '/assets/counseling.webp',
    imgPos: 'center 35%',
    desc: 'Our pastoral care ministry that visits the sick, supports the bereaved, checks on the lonely, and ensures no one in our congregation walks through life\'s hardest moments alone.',
    meetings: 'Ongoing visitation & support',
    lead: 'Pastoral Care Team',
    color: 'bg-green-50 border-green-200',
    accent: 'text-green-600',
    to: '/icare',
  },
];

export default function GroupsPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/youngadults.webp" alt="Groups & Ministries" className="img-cover" style={{ objectPosition: 'center 20%' }} />
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
          {GROUPS.map((g, i) => (
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
                      <span>The Rock Shopping Centre, Bury BL9 0ND</span>
                    </div>
                  </div>
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
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">There's a place for everyone to serve. Join one of our teams.</p>
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
