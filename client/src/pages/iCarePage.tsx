import { Heart, Home, Users, Phone, HandHelping, Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES = [
  { icon: Heart, title: 'Hospital & Home Visits', desc: 'Our iCare team visits members who are sick in hospital or recovering at home, bringing prayer, encouragement, and the presence of God.' },
  { icon: Flower2, title: 'Bereavement Support', desc: 'We walk alongside families who have lost loved ones — from the moment of loss through the grief journey — with practical help and pastoral care.' },
  { icon: Home, title: 'New Baby Visits', desc: 'We celebrate new arrivals! Our team visits families with newborns to pray over the child, support the parents, and welcome the newest members of our family.' },
  { icon: Users, title: 'Life Transitions', desc: 'Whether you\'re going through a divorce, redundancy, house move, or other major life change, iCare is here to support you practically and spiritually.' },
  { icon: HandHelping, title: 'Crisis Support', desc: 'If you or someone you know is in crisis — financial, relational, or emotional — iCare can connect you with resources and walk with you through it.' },
  { icon: Phone, title: 'Telephone Pastoral Care', desc: 'For those unable to receive visits, our team offers regular phone and video pastoral check-ins to ensure no one in our congregation feels alone.' },
];

const STEPS = [
  { step: '01', title: 'Submit a Request', desc: 'Let us know who needs support using our counselling or contact form — or speak to any pastor after a service.' },
  { step: '02', title: 'We Reach Out', desc: 'A member of our iCare team will contact you within 48 hours to understand the need and arrange support.' },
  { step: '03', title: 'We Show Up', desc: 'Our trained pastoral workers visit, pray, listen, and connect you with whatever resources or referrals are needed.' },
];

export default function iCarePage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/counseling.webp" alt="iCare Ministry" className="img-cover" style={{ objectPosition: 'center 35%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Pastoral Care</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">iCare Ministry</h1>
            <p className="text-white/80 mt-2 max-w-lg">Because nobody should go through life alone</p>
          </div>
        </div>
      </div>

      {/* What is iCare */}
      <section className="section-pad bg-white">
        <div className="container-max grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">About iCare</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">We Care, So You're Never Alone</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              iCare is Lighthouse Parish's pastoral care ministry — a dedicated team of trained believers whose calling is to ensure that every member of our church family is seen, known, and cared for, especially during life's most challenging moments.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Whether you're in hospital, grieving a loss, welcoming a new baby, or simply going through a difficult season, iCare exists to bring the love and presence of Christ directly to you — wherever you are.
            </p>
            <p className="text-gray-600 leading-relaxed">
              All iCare support is completely free, confidential, and available to all members of Lighthouse Parish regardless of how long you've attended.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-80">
            <img src="/assets/family.webp" alt="iCare team" className="img-cover" style={{ objectPosition: 'center 30%' }} />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">How We Help</p>
            <h2 className="text-3xl font-bold text-gray-900">iCare Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-pink-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-3xl font-bold text-gray-900">How to Access iCare</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map(s => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{s.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counselling link */}
      <section className="section-pad bg-pink-50">
        <div className="container-max max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Also Available: Professional Counselling</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            In addition to pastoral care visits, we offer free, confidential, Christ-centred counselling sessions for individuals, couples, and families through our Counselling Service — covering pre-marital, marriage, family, individual, spiritual guidance, and grief support.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/counselling" className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-pink-700 transition-colors shadow">
              Book a Counselling Session
            </Link>
            <Link to="/contact" className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:border-primary hover:text-primary transition-colors">
              Request iCare Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
