import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OFFERINGS = [
  { title: 'Food Bank', desc: 'Non-perishable food for members and anyone in the community who needs it.' },
  { title: 'Pastoral & Welfare Support', desc: 'Face-to-face and telephone support for practical and spiritual needs.' },
  { title: 'Parenting & Marriage Support', desc: 'Free parenting classes and advice on marital and family issues.' },
  { title: 'Summer Mentoring', desc: 'Mentoring classes for girls, running in August.' },
  { title: 'Youth Church', desc: 'A vibrant space for our young people to grow in faith and community.' },
  { title: "Sarah's Heart ❤️", desc: 'For couples waiting on God for the fruit of the womb — spiritual and emotional support, plus information on available medical options and signposting.' },
];

const VALUES = [
  { title: 'Faith', desc: 'We believe in the power of God\'s Word and trust Him in every circumstance.' },
  { title: 'Family', desc: 'We are a Christ-centred family where everyone belongs and is loved unconditionally.' },
  { title: 'Freedom', desc: 'We preach and live the liberating truth of the Gospel of Jesus Christ.' },
  { title: 'Fruitfulness', desc: 'We are committed to bearing fruit in every area of life — spiritual, personal, and communal.' },
];

const BELIEFS = [
  'The Bible is the inspired, infallible Word of God',
  'One God eternally existing in three persons — Father, Son, and Holy Spirit',
  'The virgin birth, sinless life, atoning death, and bodily resurrection of Jesus Christ',
  'Salvation by grace through faith in Jesus Christ alone',
  'The present ministry of the Holy Spirit who indwells every believer',
  'The second coming of Jesus Christ in power and glory',
  'The resurrection of both the saved and the lost',
  'The spiritual unity of all believers in the Lord Jesus Christ',
];

const MILESTONES = [
  { year: '2011', event: 'RCCG Lighthouse Parish founded in Bury by two families — the Agbeses and the Olujobis' },
  { year: '2013', event: 'Pastor Yemi & Paul Olujobi take over main leadership; congregation continues to grow' },
  { year: '2015', event: 'Children\'s and Teen ministries formally established; iCare pastoral care ministry launched' },
  { year: '2018', event: 'Moved to current home at The Rock Shopping Centre, Bury' },
  { year: '2021', event: 'Online services launched; YouTube channel launched at @rccgtlp1' },
  { year: '2024', event: 'New website, expanded missions programme, and community outreach initiative' },
];

export default function AboutPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/seniorpsts.webp" alt="About Us" className="img-cover" style={{ objectPosition: 'center 30%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Our Story</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">About Lighthouse Parish</h1>
            <p className="text-white/80 mt-2 max-w-lg">A beacon of hope in the heart of Bury, Manchester</p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="section-pad bg-white">
        <div className="container-max grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Who We Are</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">More Than a Church — A Family</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              RCCG LIGHTHOUSE PARISH is a place where people can meet Jesus, engage in life-giving community, and find their purpose. We are a family of believers in the heart of Bury, Greater Manchester — part of the Redeemed Christian Church of God (RCCG), a global network spanning over 190 nations.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our vision is to be a lighthouse in our community — shining the light of Christ to everyone around us, guiding the lost, strengthening believers, and serving our city with love and excellence.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every service, every ministry, every programme is designed with one purpose: to help people encounter God, grow in faith, and make a difference in the world.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-80">
            <img src="/assets/family.webp" alt="Church Community" className="img-cover" />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">What Drives Us</p>
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all text-center">
                <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{['F', 'F', 'F', 'F'][i]}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="section-pad bg-white">
        <div className="container-max grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Our Foundation</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Believe</h2>
            <ul className="space-y-3">
              {BELIEFS.map(b => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Timeline */}
          <div>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Our Journey</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Church History</h2>
            <div className="relative pl-6 border-l-2 border-pink-200 space-y-6">
              {MILESTONES.map(m => (
                <div key={m.year} className="relative">
                  <div className="absolute -left-[1.65rem] top-0.5 w-5 h-5 bg-primary rounded-full border-2 border-white shadow" />
                  <div className="text-primary font-bold text-sm mb-0.5">{m.year}</div>
                  <p className="text-gray-600 text-sm">{m.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Our Community</p>
            <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERINGS.map(o => (
              <div key={o.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <h3 className="font-bold text-gray-900 mb-2">{o.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-gradient-brand text-center">
        <div className="container-max max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Come Experience It Yourself</h2>
          <p className="text-white/80 mb-8">We'd love to welcome you to Lighthouse Parish. Join us this Sunday!</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/watch-live" className="px-8 py-3.5 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-50 transition-colors shadow">
              Watch Live
            </Link>
            <Link to="/contact" className="px-8 py-3.5 border-2 border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
