import { useState, useEffect } from 'react';
import { Plus, Printer, X, FileText } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Bulletin {
  id: string;
  title: string;
  date: string;
  scripture: string;
  theme: string;
  content: string;
  created_at: string;
}

const EMPTY_FORM = {
  title: 'Sunday Service Bulletin',
  date: new Date().toISOString().slice(0, 10),
  scripture: '',
  theme: '',
  announcements: '',
};

export default function BulletinPage() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<Bulletin | null>(null);

  async function load() {
    try {
      const { data } = await api.get('/admin/bulletins');
      setBulletins(data.data ?? []);
    } catch {
      toast.error('Failed to load bulletins');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) { toast.error('Title and date required'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/admin/bulletins', form);
      toast.success('Bulletin generated!');
      setShowForm(false);
      setForm(EMPTY_FORM);
      await load();
      // Open the new one in preview
      const { data: all } = await api.get('/admin/bulletins');
      const newest = (all.data ?? []).find((b: Bulletin) => b.id === data.id);
      if (newest) setPreview(newest);
    } catch {
      toast.error('Failed to generate bulletin');
    } finally {
      setGenerating(false);
    }
  }

  function handlePrint() {
    if (!preview) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>${preview.title}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1a1a1a; }
        h1 { font-size: 2em; border-bottom: 3px solid #c026d3; padding-bottom: 0.5em; }
        h2 { font-size: 1.3em; color: #c026d3; margin-top: 1.5em; }
        blockquote { border-left: 4px solid #c026d3; padding-left: 1em; color: #555; font-style: italic; }
        hr { border-color: #eee; margin: 1.5em 0; }
        ul { padding-left: 1.5em; }
        li { margin-bottom: 0.3em; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      ${preview.content
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^> \*"(.+)"\*$/gm, '<blockquote>$1</blockquote>')
        .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/^---$/gm, '<hr>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^\n/, '<p>')
        + '</p>'
      }
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Bulletin</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and print Sunday service bulletins</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Generate Bulletin
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : bulletins.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No bulletins yet. Generate your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bulletins.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">{b.title}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(b.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {b.theme && <p className="text-xs text-primary mt-0.5">Theme: {b.theme}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setPreview(b)}
                  className="px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Generate Bulletin</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bulletin Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Service Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Theme / Series</label>
                <input value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))} placeholder="e.g. Walking in Faith" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Memory Scripture</label>
                <input value={form.scripture} onChange={e => setForm(f => ({ ...f, scripture: e.target.value }))} placeholder="e.g. John 3:16 — For God so loved the world…" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Announcements</label>
                <textarea value={form.announcements} onChange={e => setForm(f => ({ ...f, announcements: e.target.value }))} rows={4} placeholder="Enter announcements, one per line..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={generating} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-pink-700 transition-colors disabled:opacity-60">
                  {generating ? 'Generating…' : 'Generate Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{preview.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
                <button onClick={() => setPreview(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <pre className="whitespace-pre-wrap font-serif text-sm text-gray-700 leading-relaxed">{preview.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
