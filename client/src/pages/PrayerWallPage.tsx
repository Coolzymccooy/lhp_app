import { useState, useEffect } from 'react';
import { Heart, Send, EyeOff } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

interface PrayerEntry {
  id: string;
  name: string;
  request: string;
  anonymous: number;
  praying_count: number;
  created_at: string;
}

export default function PrayerWallPage() {
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', request: '', anonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());

  async function load() {
    try {
      const { data } = await api.get('/forms/prayer-wall');
      setEntries(data.data ?? []);
    } catch {
      toast.error('Could not load prayer wall');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.request.trim().length < 10) {
      toast.error('Please enter your name and a request (at least 10 characters)');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/forms/prayer-wall', form);
      toast.success('Your request has been submitted and will appear once approved.');
      setForm({ name: '', request: '', anonymous: false });
    } catch {
      toast.error('Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePray(id: string) {
    if (prayedFor.has(id)) return;
    try {
      await api.patch(`/forms/prayer-wall/${id}/pray`);
      setPrayedFor(prev => new Set(prev).add(id));
      setEntries(prev => prev.map(e => e.id === id ? { ...e, praying_count: e.praying_count + 1 } : e));
    } catch {
      // silent
    }
  }

  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img src="/assets/womenfellowship.webp" alt="Prayer Wall" className="img-cover" style={{ objectPosition: 'center 30%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Community</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Prayer Wall</h1>
            <p className="text-white/80 mt-2">Stand together in prayer with your church family</p>
          </div>
        </div>
      </div>

      <div className="container-max px-6 py-12 grid lg:grid-cols-3 gap-10">
        {/* Submit form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Share a Prayer Request</h2>
            <p className="text-gray-500 text-sm mb-5">All requests are moderated before appearing on the wall.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="First name or initials"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prayer Request</label>
                <textarea
                  value={form.request}
                  onChange={e => setForm(f => ({ ...f, request: e.target.value }))}
                  rows={5}
                  maxLength={1000}
                  placeholder="Share what you'd like prayer for..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.request.length}/1000</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))}
                  className="rounded"
                />
                <EyeOff className="w-4 h-4 text-gray-400" />
                Post anonymously
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Wall */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Community Prayers</h2>
            <span className="text-sm text-gray-500">{entries.length} request{entries.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading…</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No approved requests yet. Be the first to share.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-pink-200 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm mb-1">{entry.name}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{entry.request}</p>
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePray(entry.id)}
                      disabled={prayedFor.has(entry.id)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${prayedFor.has(entry.id) ? 'bg-pink-50 border-pink-200 text-primary' : 'border-gray-200 text-gray-400 hover:border-pink-200 hover:text-primary hover:bg-pink-50'}`}
                    >
                      <Heart className={`w-5 h-5 ${prayedFor.has(entry.id) ? 'fill-current' : ''}`} />
                      <span className="text-xs font-bold">{entry.praying_count}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
