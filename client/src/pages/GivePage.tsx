import { useState } from 'react';
import { Heart, Shield, TrendingUp, Gift, CreditCard } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const GIVING_METHODS = [
  {
    title: 'Online Bank Transfer',
    desc: 'The easiest way to give regularly. Set up a standing order or one-off transfer directly to our church account.',
    details: [
      { label: 'Bank', value: 'Barclays Bank' },
      { label: 'Account Name', value: 'The Redeemed Christian Church of God The Lighthouse Parish, Bury' },
      { label: 'Sort Code', value: '20-55-41' },
      { label: 'Account Number', value: '23061337' },
      { label: 'Reference', value: 'TITHE / OFFERING / MISSIONS' },
    ],
    icon: TrendingUp,
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600 bg-blue-100',
  },
  {
    title: 'Give in Person',
    desc: 'Offering envelopes are available at the welcome desk. Give during any of our Sunday services or weekday meetings.',
    details: [
      { label: 'Sunday Services', value: '7:30 AM & 10:30 AM' },
      { label: 'Thursday Open Heavens', value: '6:00 PM' },
      { label: 'Location', value: 'The Rock Shopping Centre, Bury BL9 0ND' },
    ],
    icon: Gift,
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600 bg-green-100',
  },
  {
    title: 'Gift Aid',
    desc: 'UK taxpayers can increase their giving by 25% at no extra cost through Gift Aid. Ask our finance team for a Gift Aid declaration form.',
    details: [
      { label: 'Eligibility', value: 'UK taxpayers' },
      { label: 'Boost', value: '+25% on your gift' },
      { label: 'How', value: 'Complete a one-off declaration' },
    ],
    icon: Heart,
    color: 'bg-pink-50 border-pink-200',
    iconColor: 'text-pink-600 bg-pink-100',
  },
];

const FUND_CATEGORIES = [
  { name: 'Tithes', desc: 'The biblical tithe (10%) supports the church\'s general operations, staff, and ministry.' },
  { name: 'Offerings', desc: 'Freewill offerings given in worship to God above and beyond the tithe.' },
  { name: 'Missions', desc: 'Supports our global missions work and partner churches around the world.' },
  { name: 'Building Fund', desc: 'Dedicated fund for the future development and ownership of our church building.' },
  { name: 'iCare Fund', desc: 'Pastoral care fund that supports members and community members in need.' },
  { name: 'Children & Youth', desc: 'Resources, events, and programmes for our next generation ministries.' },
];

const AMOUNTS = [10, 25, 50, 100, 250];
const FUNDS = ['Tithes', 'Offerings', 'Missions', 'Building Fund', 'iCare Fund', 'Children & Youth'];

function OnlineGiveSection() {
  const [amount, setAmount] = useState<number | ''>(50);
  const [custom, setCustom] = useState('');
  const [fund, setFund] = useState('Offerings');
  const [loading, setLoading] = useState(false);

  async function handleGive() {
    const finalAmount = custom ? parseFloat(custom) : Number(amount);
    if (!finalAmount || finalAmount < 1) { toast.error('Please enter an amount of at least £1'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/forms/create-checkout', { amount: Math.round(finalAmount * 100), fund });
      window.location.href = data.url;
    } catch {
      toast.error('Failed to start payment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-pad bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container-max max-w-md mx-auto">
        <div className="text-center mb-8">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Secure Online Giving</p>
          <h2 className="text-3xl font-bold text-gray-900">Give Online</h2>
          <p className="text-gray-500 text-sm mt-2">Safe & secure payments via Stripe</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          {/* Amount presets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Amount</label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setCustom(''); }}
                  className={`py-2 text-sm font-bold rounded-xl border transition-colors ${amount === a && !custom ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'}`}
                >
                  £{a}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              placeholder="Custom amount (£)"
              value={custom}
              onChange={e => { setCustom(e.target.value); setAmount(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Fund picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Designate to</label>
            <select
              value={fund}
              onChange={e => setFund(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              {FUNDS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <button
            onClick={handleGive}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60 text-sm"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? 'Redirecting…' : `Give ${custom ? `£${custom}` : amount ? `£${amount}` : ''} Securely`}
          </button>
          <p className="text-center text-xs text-gray-400">Powered by Stripe · Your card details are never stored</p>
        </div>
      </div>
    </section>
  );
}

export default function GivePage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/hands_giving.webp" alt="Give" className="img-cover" style={{ objectPosition: 'center 50%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Generosity</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Give</h1>
            <p className="text-white/80 mt-2 max-w-lg">Your giving makes Kingdom work possible</p>
          </div>
        </div>
      </div>

      {/* Why Give */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto text-center">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Why We Give</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Giving is an Act of Worship</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            At Lighthouse Parish, we believe that generosity is a spiritual discipline — a tangible expression of our trust in God as our provider. When we give, we partner with God in building His Kingdom and making a difference in our community.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <em className="text-gray-800">"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."</em> — 2 Corinthians 9:7
          </p>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="bg-gray-50 py-12">
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Shield, title: 'Accountable', desc: 'All funds are managed transparently by elected trustees with annual reporting.' },
              { icon: Heart, title: 'Purpose-Driven', desc: 'Every pound given is directed to ministry, people, and community impact.' },
              { icon: TrendingUp, title: 'Kingdom Impact', desc: 'Your gift reaches locally in Bury and globally through our missions network.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Give */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Ways to Give</p>
            <h2 className="text-3xl font-bold text-gray-900">How to Give</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {GIVING_METHODS.map(m => {
              const Icon = m.icon;
              return (
                <div key={m.title} className={`rounded-2xl border p-8 ${m.color}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${m.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{m.title}</h3>
                  <p className="text-gray-600 text-sm mb-5">{m.desc}</p>
                  <div className="bg-white rounded-xl p-4 space-y-2">
                    {m.details.map(d => (
                      <div key={d.label} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-gray-500 flex-shrink-0">{d.label}</span>
                        <span className="font-semibold text-gray-900 text-right">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fund Categories */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Designate Your Gift</p>
            <h2 className="text-3xl font-bold text-gray-900">Where Your Giving Goes</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">You can specify how you'd like your gift to be used by including a reference when transferring or choosing a designated envelope.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {FUND_CATEGORIES.map(f => (
              <div key={f.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-pink-200 hover:shadow-md transition-all">
                <h3 className="font-bold text-gray-900 mb-2">{f.name}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OnlineGiveSection />

      {/* Questions */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Have Questions About Giving?</h2>
          <p className="text-gray-500 mb-6 text-sm">We're happy to help. Reach out to our finance team and we'll respond within 2 business days.</p>
          <a href="mailto:finance@lighthouseparish.org" className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-pink-700 transition-colors shadow inline-block">
            Email the Finance Team
          </a>
        </div>
      </section>
    </main>
  );
}
