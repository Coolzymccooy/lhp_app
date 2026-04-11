import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    category: 'Visiting for the First Time',
    items: [
      { q: 'What should I expect on my first visit?', a: 'You\'ll be warmly welcomed by our hospitality team. Services include contemporary worship, prayer, and a Bible-based message. The atmosphere is friendly and relaxed — come exactly as you are. Services typically last about 90 minutes.' },
      { q: 'What should I wear?', a: 'There\'s no dress code. Some people dress formally, others casually. What matters most is that you come. We want you to feel comfortable and at home.' },
      { q: 'Is there parking?', a: 'Yes! We meet at The Rock Shopping Centre in Bury, which has a large free car park available on Sundays.' },
      { q: 'How do I find the church?', a: 'We\'re located at The Rock Shopping Centre, Vue Cinema, The Rock, Bury, BL9 0ND. We\'re inside the complex — follow the signs to the Vue Cinema and we\'re right there.' },
    ],
  },
  {
    category: 'Services & Meetings',
    items: [
      { q: 'What services do you have?', a: 'We have a Sunrise Service on Sundays at 7:30 AM and our main Sunshine Service at 10:30 AM. During the week: Carpe Diem (Wednesday, 6:30 AM), Open Heavens prayer (Thursday, 6:00 PM), and Praise Hour (Friday, 12:00 PM).' },
      { q: 'Can I watch services online?', a: 'Yes! We livestream our Sunday Sunshine Service on YouTube at 10:30 AM. You can also watch past sermons on our YouTube channel or right here on our website.' },
      { q: 'Are there services in other languages?', a: 'Our main services are in English. We do occasionally have multilingual elements in worship. Contact us for more details.' },
    ],
  },
  {
    category: 'Children & Families',
    items: [
      { q: 'Is there childcare during services?', a: 'Yes! Our Children\'s Ministry runs during the Sunday Sunshine Service (10:30 AM) for children ages 0–12. Children are registered at the welcome desk and looked after by our trained, DBS-checked team.' },
      { q: 'Is the children\'s team DBS-checked?', a: 'Absolutely. All our children\'s workers are DBS-checked and have undergone child safeguarding training in line with current UK guidelines.' },
      { q: 'Do you have programmes for teenagers?', a: 'Yes — Teen Fellowship (TF) is for ages 13–17 and runs during services and monthly events. It\'s a great space for young people to build faith and lasting friendships.' },
    ],
  },
  {
    category: 'Membership & Belonging',
    items: [
      { q: 'How do I become a member?', a: 'You can apply for membership through our website or speak to a pastor after any service. New members go through a short welcome process and foundation class to get connected and grounded.' },
      { q: 'Do I need to be a member to attend?', a: 'Not at all! Everyone is welcome at every service regardless of membership status. Membership is for those who feel called to commit to and serve in this local church family.' },
      { q: 'Is there a new members\' class?', a: 'Yes — we run regular Foundation Classes for new members covering the basics of our faith, vision, and how to get involved. Contact us to find out when the next one is running.' },
    ],
  },
  {
    category: 'Prayer & Pastoral Support',
    items: [
      { q: 'Can I request prayer for myself or someone else?', a: 'Yes. You can submit a prayer request via our website and our dedicated prayer team will pray for you daily. You can also approach any of our pastors or ministry leaders after a service.' },
      { q: 'Do you offer counselling?', a: 'Yes — our iCare Ministry offers free, confidential, Christ-centred counselling for individuals, couples, and families. You can book a session through the Counselling page on our website.' },
      { q: 'What if I\'m in crisis right now?', a: 'If you are in immediate danger, please call 999. For urgent pastoral support, call our pastoral line or submit a prayer request and tick "I\'d like someone to contact me." We will respond as quickly as possible.' },
    ],
  },
  {
    category: 'Giving',
    items: [
      { q: 'How can I give to the church?', a: 'You can give by bank transfer (details on our Give page), in person during services using offering envelopes, or set up a standing order. We accept tithes, offerings, and designated gifts for missions and specific funds.' },
      { q: 'Is my giving confidential?', a: 'Yes. All giving records are handled by our finance team and trustees only, in line with GDPR and charity regulations.' },
      { q: 'Are you a registered charity?', a: 'Yes, Lighthouse Parish is a UK-registered charity. Eligible UK taxpayers can also Gift Aid their donations, increasing the value of their gift at no extra cost.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4 bg-gray-50">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        <img src="/assets/auditoriumpic1.webp" alt="FAQ" className="img-cover" style={{ objectPosition: 'center 60%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h1>
            <p className="text-white/80 mt-2">Everything you need to know before you visit</p>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-max max-w-4xl mx-auto space-y-12">
          {FAQS.map(cat => (
            <div key={cat.category}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">{cat.category}</h2>
              <div className="space-y-3">
                {cat.items.map(item => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="section-pad bg-gray-50">
        <div className="container-max max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-500 mb-6">We'd love to help. Reach out and a member of our team will be in touch.</p>
          <Link to="/contact" className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-pink-700 transition-colors shadow inline-block">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
