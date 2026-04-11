import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Shield } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface PrayerEntry {
  id: string;
  name: string;
  request: string;
  anonymous: number;
  approved: number;
  praying_count: number;
  created_at: string;
}

export default function PrayerWallAdminPage() {
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  async function load() {
    try {
      const { data } = await api.get('/admin/prayer-wall');
      setEntries(data.data ?? []);
    } catch {
      toast.error('Failed to load prayer wall');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id: string, approved: boolean) {
    try {
      await api.patch(`/admin/prayer-wall/${id}`, { approved });
      toast.success(approved ? 'Request approved' : 'Request hidden');
      load();
    } catch {
      toast.error('Failed to update');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this prayer request?')) return;
    try {
      await api.delete(`/admin/prayer-wall/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  }

  const filtered = entries.filter(e => {
    if (filter === 'pending') return e.approved === 0;
    if (filter === 'approved') return e.approved === 1;
    return true;
  });

  const pendingCount = entries.filter(e => e.approved === 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prayer Wall</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-1 font-semibold">{pendingCount} request{pendingCount !== 1 ? 's' : ''} awaiting approval</p>
          )}
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['pending', 'approved', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}{f === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No {filter} requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <div key={entry.id} className={`bg-white rounded-2xl border p-5 ${entry.approved ? 'border-green-200' : 'border-amber-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm">{entry.anonymous ? 'Anonymous' : entry.name}</p>
                    {entry.anonymous ? (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Anonymous</span>
                    ) : null}
                    {entry.approved ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mt-1">{entry.request}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {entry.praying_count > 0 && (
                      <span className="text-xs text-pink-600 font-semibold">{entry.praying_count} praying</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!entry.approved ? (
                    <button
                      onClick={() => handleApprove(entry.id, true)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(entry.id, false)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
