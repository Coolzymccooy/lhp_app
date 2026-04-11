import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, X } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  image_url: string;
}

const TYPE_COLORS: Record<string, string> = {
  service: 'bg-pink-100 text-pink-700',
  conference: 'bg-purple-100 text-purple-700',
  youth: 'bg-blue-100 text-blue-700',
  outreach: 'bg-green-100 text-green-700',
  special: 'bg-amber-100 text-amber-700',
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpEvent, setRsvpEvent] = useState<Event | null>(null);
  const [rsvpForm, setRsvpForm] = useState({ name: '', email: '', phone: '', guests: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/forms/events')
      .then(r => setEvents(r.data.data ?? []))
      .catch(() => toast.error('Could not load events'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!rsvpEvent) return;
    if (!rsvpForm.name || !rsvpForm.email) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/forms/events/${rsvpEvent.id}/rsvp`, rsvpForm);
      toast.success('RSVP confirmed! We look forward to seeing you.');
      setRsvpEvent(null);
      setRsvpForm({ name: '', email: '', phone: '', guests: 1 });
    } catch {
      toast.error('Could not submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img src="/assets/auditoriumpic1.webp" alt="Events" className="img-cover" style={{ objectPosition: 'center 40%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">What's On</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Upcoming Events</h1>
            <p className="text-white/80 mt-2">Join us for worship, community, and more</p>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-max">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-bold text-gray-500 mb-2">No Upcoming Events</h2>
              <p className="text-gray-400 text-sm">Check back soon — new events are added regularly.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="h-48 bg-gradient-brand flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize mb-3 ${TYPE_COLORS[event.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {event.type}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg mb-3 leading-snug">{event.title}</h3>
                    {event.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>}
                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setRsvpEvent(event)}
                      className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-pink-700 transition-colors"
                    >
                      RSVP Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RSVP Modal */}
      {rsvpEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">RSVP</h2>
                <p className="text-sm text-gray-500 mt-0.5">{rsvpEvent.title}</p>
              </div>
              <button onClick={() => setRsvpEvent(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRsvp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  value={rsvpForm.name}
                  onChange={e => setRsvpForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={rsvpForm.email}
                  onChange={e => setRsvpForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={rsvpForm.phone}
                  onChange={e => setRsvpForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Number of Guests</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rsvpForm.guests}
                  onChange={e => setRsvpForm(f => ({ ...f, guests: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRsvpEvent(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-pink-700 transition-colors disabled:opacity-60">
                  {submitting ? 'Confirming…' : 'Confirm RSVP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
