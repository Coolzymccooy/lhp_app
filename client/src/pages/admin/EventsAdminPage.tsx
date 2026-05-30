import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Calendar, Users, Pencil, Upload, Info } from 'lucide-react';
import api from '../../api/client';
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
  rsvp_count: number;
}

interface Rsvp {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  created_at: string;
}

const EMPTY_FORM = {
  title: '', description: '', date: '', time: '10:30',
  location: 'The Rock Shopping Centre, Bury BL9 0ND', type: 'service', image_url: '',
};

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rsvpEvent, setRsvpEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  async function load() {
    try {
      const { data } = await api.get('/admin/events');
      setEvents(data.data ?? []);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowAdd(true);
  }

  function openEdit(event: Event) {
    setEditingId(event.id);
    setForm({
      title: event.title ?? '',
      description: event.description ?? '',
      date: (event.date ?? '').slice(0, 10), // <input type="date"> needs YYYY-MM-DD
      time: event.time ?? '',
      location: event.location ?? '',
      type: event.type || 'service',
      image_url: event.image_url ?? '',
    });
    setShowAdd(true);
  }

  function closeModal() {
    setShowAdd(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      // Let axios set the multipart boundary automatically — don't override Content-Type.
      const { data } = await api.post('/admin/upload', fd);
      setForm(f => ({ ...f, image_url: data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed — use a JPG/PNG/WebP image under 8MB');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date || !form.time) {
      toast.error('Title, date and time are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/events/${editingId}`, form);
        toast.success('Event updated');
      } else {
        await api.post('/admin/events', form);
        toast.success('Event created');
      }
      closeModal();
      load();
    } catch {
      toast.error(editingId ? 'Failed to update event' : 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event and all its RSVPs?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      toast.success('Event deleted');
      load();
    } catch {
      toast.error('Failed to delete event');
    }
  }

  async function openRsvps(event: Event) {
    setRsvpEvent(event);
    setRsvpLoading(true);
    try {
      const { data } = await api.get(`/admin/events/${event.id}/rsvps`);
      setRsvps(data.data ?? []);
    } catch {
      toast.error('Failed to load RSVPs');
    } finally {
      setRsvpLoading(false);
    }
  }

  const totalGuests = rsvps.reduce((sum, r) => sum + (r.guests || 1), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-pink-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => openEdit(event)}
                title="Click to edit"
                className="flex-1 min-w-0 text-left group rounded-xl -m-1 p-1 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full capitalize">{event.type}</span>
                  {event.rsvp_count > 0 && (
                    <span className="text-xs text-gray-500">{event.rsvp_count} RSVP{event.rsvp_count !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{event.title}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {event.time}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{event.location}</p>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                {event.rsvp_count > 0 && (
                  <button
                    onClick={() => openRsvps(event)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Users className="w-4 h-4" /> RSVPs
                  </button>
                )}
                <button
                  onClick={() => openEdit(event)}
                  title="Edit event"
                  className="p-2 text-gray-400 hover:text-primary hover:bg-pink-50 rounded-xl transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  title="Delete event"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                  <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="10:30 AM" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                  {['service', 'conference', 'youth', 'outreach', 'special'].map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  Event Image
                  <span className="group relative inline-flex">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-72 rounded-lg bg-gray-900 text-white text-xs leading-relaxed p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      Easiest: tap <b>Upload image</b> and pick a photo from your phone or computer (JPG, PNG or WebP, up to 8MB). It’s saved automatically and resized to fit the card — you don’t need a link.<br /><br />
                      Advanced: if your photo is already online, paste its web address (URL) in the box below — it must end in .jpg, .png or .webp. Leave everything blank to use the default banner.
                    </span>
                  </span>
                </label>

                {/* Preview of the current image */}
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Event preview"
                    className="w-full h-32 object-cover rounded-xl border border-gray-200 mb-2"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}

                {/* Upload button (the easy path for non-technical admins) */}
                <label className={`flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed rounded-xl text-sm font-semibold cursor-pointer transition-colors ${uploading ? 'border-gray-200 text-gray-400' : 'border-primary/40 text-primary hover:bg-pink-50'}`}>
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading…' : form.image_url ? 'Replace image' : 'Upload image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>

                {/* Advanced: paste a URL instead */}
                <input
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="…or paste an image link (https://…)"
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-pink-700 transition-colors disabled:opacity-60">
                  {saving ? (editingId ? 'Saving…' : 'Creating…') : (editingId ? 'Save Changes' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RSVPs Modal */}
      {rsvpEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">RSVPs — {rsvpEvent.title}</h2>
                {!rsvpLoading && <p className="text-sm text-gray-500">{rsvps.length} response{rsvps.length !== 1 ? 's' : ''} · {totalGuests} total guest{totalGuests !== 1 ? 's' : ''}</p>}
              </div>
              <button onClick={() => setRsvpEvent(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {rsvpLoading ? (
                <div className="text-center py-10 text-gray-400">Loading…</div>
              ) : rsvps.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No RSVPs yet.</div>
              ) : (
                <div className="space-y-3">
                  {rsvps.map(r => (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                          <p className="text-gray-500 text-xs">{r.email}</p>
                          {r.phone && <p className="text-gray-500 text-xs">{r.phone}</p>}
                        </div>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{r.guests} guest{r.guests !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
