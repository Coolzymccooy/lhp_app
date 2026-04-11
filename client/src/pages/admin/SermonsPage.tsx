import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

function YoutubeSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Sermon {
  id: number;
  title: string;
  topic: string;
  speaker: string;
  summary: string;
  scriptures: string;
  youtube_url: string;
  notes_url: string;
  date: string;
}

const EMPTY: Partial<Sermon> = {
  title: '', topic: '', speaker: '', summary: '', scriptures: '', youtube_url: '', notes_url: '', date: '',
};

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Sermon>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    try {
      const { data } = await api.get('/admin/sermons');
      setSermons(data.data ?? []);
    } catch {
      toast.error('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(EMPTY);
    setModal('add');
  }

  function openEdit(s: Sermon) {
    setForm({ ...s, date: s.date ? s.date.split('T')[0] : '' });
    setModal('edit');
  }

  async function handleSave() {
    if (!form.title || !form.speaker) {
      toast.error('Title and speaker are required');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/admin/sermons', form);
        toast.success('Sermon added');
      } else {
        await api.put(`/admin/sermons/${form.id}`, form);
        toast.success('Sermon updated');
      }
      setModal(null);
      load();
    } catch {
      toast.error('Failed to save sermon');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/admin/sermons/${id}`);
      toast.success('Sermon deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete sermon');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sermons</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-pink-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Sermon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : sermons.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <YoutubeSvg className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No sermons yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {sermons.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              {s.youtube_url ? (
                <div className="aspect-video overflow-hidden bg-gray-900">
                  <iframe src={s.youtube_url} title={s.title} className="w-full h-full" allowFullScreen />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                  <YoutubeSvg className="w-10 h-10 text-white/50" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">{s.topic}</span>
                    <h3 className="font-bold text-gray-900 mt-0.5 text-sm leading-snug truncate">{s.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{s.speaker}</p>
                    {s.date && <p className="text-gray-400 text-xs mt-0.5">{new Date(s.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-pink-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {s.summary && <p className="text-gray-500 text-xs mt-2 line-clamp-2">{s.summary}</p>}
                {s.scriptures && <p className="text-xs text-gray-400 mt-2">{s.scriptures}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{modal === 'add' ? 'Add Sermon' : 'Edit Sermon'}</h2>
              <button onClick={() => setModal(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                <input value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Speaker *</label>
                  <input value={form.speaker ?? ''} onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Topic / Series</label>
                  <input value={form.topic ?? ''} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">YouTube Embed URL</label>
                <input value={form.youtube_url ?? ''} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://www.youtube.com/embed/..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sermon Notes URL</label>
                <input value={form.notes_url ?? ''} onChange={e => setForm(f => ({ ...f, notes_url: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Google Drive or PDF link…" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scriptures</label>
                <input value={form.scriptures ?? ''} onChange={e => setForm(f => ({ ...f, scriptures: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. John 3:16, Romans 8:28" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Summary / Notes</label>
                <textarea value={form.summary ?? ''} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-pink-700 transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Sermon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-2">Delete Sermon?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
