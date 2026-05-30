import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  age_group: string;
  how_heard: string;
  visit_date: string;
  interests: string;
  prayer_request: string;
  wants_followup: boolean;
}

export default function ConnectPage() {
  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    age_group: '',
    how_heard: '',
    visit_date: '',
    interests: '',
    prayer_request: '',
    wants_followup: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm(f => ({ ...f, visit_date: today }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/forms/first-timer', form);
      toast.success(data.message ?? 'Welcome! We\'ll be in touch soon.');
      setSubmitted(true);
      setForm({
        full_name: '',
        email: '',
        phone: '',
        age_group: '',
        how_heard: '',
        visit_date: new Date().toISOString().split('T')[0],
        interests: '',
        prayer_request: '',
        wants_followup: true,
      });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error('Something went wrong. Please try again or speak to someone at church.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="pt-20 pb-20">
        <div className="section-pad bg-gradient-to-b from-pink-50 to-white">
          <div className="container-max max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to The Lighthouse Church!</h1>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Thank you for visiting us. We're so glad you came, and we can't wait to meet you in person.
            </p>
            <p className="text-gray-500 mb-8">
              A member of our team will reach out to you soon using the contact details you provided.
            </p>
            <div className="bg-white border-2 border-pink-200 rounded-2xl p-8">
              <p className="text-sm text-gray-600 mb-4">
                In the meantime, feel free to explore our website, watch our latest sermon, or connect with us on social media.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="/" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-pink-700 transition-colors">
                  Back to Home
                </a>
                <a href="/watch-live" className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:border-primary hover:text-primary transition-colors">
                  Watch a Sermon
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/welcome.webp" alt="Welcome" className="img-cover" style={{ objectPosition: 'center 40%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">First-Time Guest</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Welcome to The Lighthouse Church</h1>
            <p className="text-white/80 mt-2 max-w-lg">We're so glad you decided to visit — let us know a bit about you!</p>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">It's Great to Meet You!</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We're The Lighthouse Church RCCG — a vibrant community dedicated to reaching out, saving souls, and making disciples through love. Fill out this short form so we can get to know you better and help you feel at home here.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-pad bg-gray-50">
        <div className="container-max max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="grid gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Age Group (optional)</label>
                <select
                  value={form.age_group}
                  onChange={e => setForm({ ...form, age_group: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Under 12">Under 12</option>
                  <option value="13-17">13–17</option>
                  <option value="18-35">18–35</option>
                  <option value="36-50">36–50</option>
                  <option value="51+">51+</option>
                </select>
              </div>

              {/* How Did You Hear */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">How did you hear about us? (optional)</label>
                <select
                  value={form.how_heard}
                  onChange={e => setForm({ ...form, how_heard: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Friend/Family">Friend or Family Member</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Walked past">Walked Past Our Building</option>
                  <option value="Online">Found Us Online</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Date of Visit (optional)</label>
                <input
                  type="date"
                  value={form.visit_date}
                  onChange={e => setForm({ ...form, visit_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Areas of Interest */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Areas of Interest (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Worship, Prayer, Teaching, Youth Group"
                  value={form.interests}
                  onChange={e => setForm({ ...form, interests: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Prayer Request */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Prayer Request (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Is there anything you'd like us to pray about for you?"
                  value={form.prayer_request}
                  onChange={e => setForm({ ...form, prayer_request: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Follow-up Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="followup"
                  checked={form.wants_followup}
                  onChange={e => setForm({ ...form, wants_followup: e.target.checked })}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="followup" className="text-sm text-gray-700 cursor-pointer font-medium">
                  I'd like someone from the church to follow up with me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-pink-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-4"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                We respect your privacy. Your information will only be used to help connect you with our church community.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* What to Expect */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">What to Expect Next</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-pink-50 rounded-2xl p-8 border border-pink-100">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">We'll Get in Touch</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A member of our team will reach out to you via email or phone within the next few days to welcome you personally.
              </p>
            </div>
            <div className="bg-pink-50 rounded-2xl p-8 border border-pink-100">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Join Our Community</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We'll help you explore ministry groups, worship opportunities, and how to get more involved in our church family.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
