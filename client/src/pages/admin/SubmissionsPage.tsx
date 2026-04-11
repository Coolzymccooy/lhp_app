import { useEffect, useState } from 'react';
import api from '../../api/client';
import { AlertTriangle } from 'lucide-react';

interface Submission { [key: string]: unknown; id: string; status: string; created_at: string; }

interface Config {
  endpoint: string;
  title: string;
  columns: { key: string; label: string; render?: (v: unknown, row: Submission) => React.ReactNode }[];
  detailKeys?: string[];
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};
const URGENCY_BADGE = (u: unknown) => u === 'urgent'
  ? <span className="flex items-center gap-1 text-xs font-bold text-red-600"><AlertTriangle className="w-3 h-3" /> Urgent</span>
  : <span className="text-xs text-gray-400">Normal</span>;

export const PRAYER_CONFIG: Config = {
  endpoint: '/admin/prayer',
  title: 'Prayer Requests',
  columns: [
    { key: 'first_name', label: 'Name', render: (v, r) => `${v} ${r.last_name ?? ''}`.trim() },
    { key: 'email', label: 'Email' },
    { key: 'category', label: 'Category' },
    { key: 'ai_urgency', label: 'Urgency', render: URGENCY_BADGE },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date', render: (v) => new Date(String(v)).toLocaleDateString('en-GB') },
  ],
  detailKeys: ['prayer_request', 'contact_me', 'ai_category', 'notes'],
};

export const COUNSELLING_CONFIG: Config = {
  endpoint: '/admin/counselling',
  title: 'Counselling Sessions',
  columns: [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'counselling_type', label: 'Type' },
    { key: 'preferred_date', label: 'Preferred Date' },
    { key: 'ai_urgency', label: 'Urgency', render: URGENCY_BADGE },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date', render: (v) => new Date(String(v)).toLocaleDateString('en-GB') },
  ],
  detailKeys: ['description', 'ai_category', 'notes'],
};

export const CONTACT_CONFIG: Config = {
  endpoint: '/admin/contact',
  title: 'Contact Messages',
  columns: [
    { key: 'first_name', label: 'Name', render: (v, r) => `${v} ${r.last_name ?? ''}`.trim() },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date', render: (v) => new Date(String(v)).toLocaleDateString('en-GB') },
  ],
  detailKeys: ['message', 'phone', 'notes'],
};

export const MEMBERSHIP_CONFIG: Config = {
  endpoint: '/admin/memberships',
  title: 'Membership Registrations',
  columns: [
    { key: 'first_name', label: 'Name', render: (v, r) => `${v} ${r.last_name ?? ''}`.trim() },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'member_type', label: 'Type', render: (v) => String(v) === 'new' ? 'New Member' : 'Existing Member' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date', render: (v) => new Date(String(v)).toLocaleDateString('en-GB') },
  ],
};

export const RESPONSES_CONFIG: Config = {
  endpoint: '/admin/responses',
  title: 'Service Responses',
  columns: [
    { key: 'first_name', label: 'Name', render: (v, r) => `${v} ${r.last_name ?? ''}`.trim() },
    { key: 'email', label: 'Email' },
    { key: 'responses', label: 'Responses', render: (v) => { try { return (JSON.parse(String(v)) as string[]).join(', '); } catch { return String(v); } } },
    { key: 'created_at', label: 'Date', render: (v) => new Date(String(v)).toLocaleDateString('en-GB') },
  ],
  detailKeys: ['message'],
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? STATUS_COLORS.new;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>{status.replace('_', ' ')}</span>;
}

export function SubmissionsPage({ config }: { config: Config }) {
  const [rows, setRows] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(config.endpoint).then(r => setRows(r.data.data));
  }, [config.endpoint]);

  function openDetail(row: Submission) {
    setSelected(row);
    setStatus(String(row.status));
    setNotes(String(row.notes ?? ''));
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await api.patch(`${config.endpoint}/${selected.id}`, { status, notes });
      setRows(rs => rs.map(r => r.id === selected.id ? { ...r, status, notes } : r));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{config.title}</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {config.columns.map(c => (
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{c.label}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 && (
                <tr><td colSpan={config.columns.length + 1} className="px-4 py-12 text-center text-gray-400 text-sm">No submissions yet.</td></tr>
              )}
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {config.columns.map(c => (
                    <td key={c.key} className="px-4 py-3 text-gray-700">
                      {c.key === 'status'
                        ? <StatusBadge status={String(row[c.key])} />
                        : c.render
                          ? c.render(row[c.key], row)
                          : String(row[c.key] ?? '')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(row)} className="text-xs font-semibold text-primary hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Submission Detail</h2>
            </div>
            <div className="p-6 space-y-4">
              {config.columns.map(c => (
                <div key={c.key}>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">{c.label}</div>
                  <div className="text-sm text-gray-800">{c.render ? c.render(selected[c.key], selected) : String(selected[c.key] ?? '—')}</div>
                </div>
              ))}
              {config.detailKeys?.map(k => (
                <div key={k}>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">{k.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{String(selected[k] ?? '—')}</div>
                </div>
              ))}

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Update Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['new', 'in_progress', 'completed', 'closed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Add internal notes..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
