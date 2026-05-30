import { Mail, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site } from '../content/site';

const PASTORS = [
  {
    name: 'Pastor Yemi Olujobi',
    title: 'Pastor in Charge',
    img: '/assets/seniorpsts.webp',
    imgPos: 'center 20%',
    bio: [
      'Pastor Yemi Olujobi is a Pastor in Charge of The Lighthouse Church RCCG, Bury. She is a woman of deep prayer, generous spirit, and extraordinary compassion — known for her approachable nature and her gift of encouraging others to discover and walk in their God-given potential.',
      'She is a social worker and public health professional with extensive experience at senior levels in corporate health, governance, and strategy. She brings this professional rigour into her pastoral leadership, ensuring the church serves its community with both spiritual and practical excellence.',
      'Together with her husband Pastor Paul, she co-founded RCCG Lighthouse Parish in 2011 alongside the Agbese family. In 2013, the Olujobis took on the full mantle of leadership. Under her guidance, the church has grown into a thriving, multi-generational congregation that is a genuine beacon of light in Bury and beyond.',
    ],
    quote: 'God is not just looking for talented people — He is looking for available hearts. When you make yourself available to Him, He does things in you and through you that you never imagined.',
  },
  {
    name: 'Pastor Paul Olujobi',
    title: 'Pastor in Charge',
    img: '/assets/pastor-olujobi.webp',
    imgPos: 'center 30%',
    bio: [
      'Pastor Paul Olujobi serves as a Pastor in Charge of The Lighthouse Church RCCG. He is a gifted preacher and teacher of the Word, whose sermons are marked by clarity, depth, and genuine pastoral warmth. The congregation\'s love for him is evident — "We love you sir ❤️" is a frequent refrain from those he has impacted.',
      'By profession, Pastor Paul is a medical nurse and public health professional, combining a heart for physical healing with a calling to minister spiritual wholeness. His background in healthcare shapes his pastoral approach — attentive, compassionate, and committed to the holistic wellbeing of every member.',
      'He co-founded Lighthouse Parish in 2011 and has been instrumental in shaping the church\'s culture of prayer, authentic worship, and community service. He leads Sunday services with energy and conviction, and his preaching consistently calls the church to a deeper walk with God.',
    ],
    quote: 'The Gospel is not complicated — it is simply the good news that God loves you, sent His Son for you, and has a future full of hope for you. Come and receive it.',
  },
];

const TEAM = [
  { name: 'Leadership Team', role: 'Serving faithfully together' },
  { name: 'Children\'s Ministry', role: 'Nurturing the next generation' },
  { name: 'Youth & Teen Fellowship', role: 'Empowering young people' },
  { name: 'Worship Team', role: 'Leading the church in praise' },
  { name: 'iCare Ministry', role: 'Pastoral care & counselling' },
  { name: 'Administration', role: 'Communications & operations' },
];

export default function SeniorPastorsPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/seniorpsts.webp" alt="Our Pastors" className="img-cover" style={{ objectPosition: 'center 25%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Leadership</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Our Pastors</h1>
            <p className="text-white/80 mt-2">Pastors in Charge · {site.designation}</p>
          </div>
        </div>
      </div>

      {/* Senior Pastors */}
      <section className="section-pad bg-white">
        <div className="container-max space-y-16">
          {PASTORS.map((p, i) => (
            <div key={p.name} className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={`relative rounded-2xl overflow-hidden h-96 shadow-lg ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <img src={p.img} alt={p.name} className="img-cover" style={{ objectPosition: p.imgPos }} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h2 className="text-xl font-bold text-white">{p.name}</h2>
                  <p className="text-primary font-semibold text-sm">{p.title}</p>
                </div>
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">{p.title}</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{p.name}</h2>
                <div className="space-y-3 mb-6">
                  {p.bio.map((para, j) => (
                    <p key={j} className="text-gray-600 text-sm leading-relaxed">{para}</p>
                  ))}
                </div>
                <blockquote className="bg-pink-50 border-l-4 border-primary rounded-r-xl p-5">
                  <Quote className="w-6 h-6 text-primary mb-2" />
                  <p className="text-gray-700 italic text-sm leading-relaxed">"{p.quote}"</p>
                </blockquote>
                <div className="mt-6">
                  <a href="mailto:pastor@lighthouseparish.org" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
                    <Mail className="w-4 h-4" /> Contact the Pastor
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">The Team</p>
            <h2 className="text-3xl font-bold text-gray-900">Ministry Leadership</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Our pastoral team and ministry leads who serve our church family with dedication.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {TEAM.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">{t.name.charAt(0)}</span>
                </div>
                <h3 className="font-bold text-gray-900">{t.name}</h3>
                <p className="text-primary text-sm font-medium mt-1">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-gradient-brand text-center">
        <div className="container-max max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Want to Talk with a Pastor?</h2>
          <p className="text-white/80 mb-8">Our pastoral team is available before and after every service, or you can get in touch through our contact page.</p>
          <Link to="/contact" className="px-8 py-3.5 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-50 transition-colors shadow inline-block">
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
