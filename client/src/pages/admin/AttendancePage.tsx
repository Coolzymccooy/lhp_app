import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface AttendanceRecord {
  id: string;
  service_date: string;
  service_type: string;
  men: number;
  women: number;
  youth: number;
  teens: number;
  children: number;
  total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface AnalyticsData {
  success: boolean;
  services: AttendanceRecord[];
  monthly: Array<{
    month: string;
    men: number;
    women: number;
    youth: number;
    teens: number;
    children: number;
    total: number;
    services_count: number;
  }>;
  summary: {
    latestTotal: number;
    avg4: number;
    categoryTotalsAllTime: {
      men: number;
      women: number;
      youth: number;
      teens: number;
      children: number;
    };
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  men: '#2563eb',
  women: '#db2777',
  youth: '#16a34a',
  teens: '#f59e0b',
  children: '#8b5cf6',
};

const CATEGORY_LABELS: Record<string, string> = {
  men: 'Men',
  women: 'Women',
  youth: 'Youth',
  teens: 'Teens',
  children: 'Children',
};

const CATEGORIES = ['men', 'women', 'youth', 'teens', 'children'] as const;

const EMPTY_FORM: Partial<AttendanceRecord> = {
  service_date: '',
  service_type: 'Sunday Service',
  men: 0,
  women: 0,
  youth: 0,
  teens: 0,
  children: 0,
  notes: '',
};

const SERVICE_TYPES = [
  'Sunday Service',
  'Thanksgiving Service',
  'Virtual Prayer Night',
  'Digging Deep Word Study',
  'Virtual Vigil',
  'Other',
];

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<AttendanceRecord>>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [recordsRes, analyticsRes] = await Promise.all([
        api.get('/admin/attendance'),
        api.get('/admin/attendance/analytics'),
      ]);
      setRecords(recordsRes.data.data ?? []);
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function openEdit(record: AttendanceRecord) {
    setForm(record);
    setEditingId(record.id);
  }

  async function handleSave() {
    if (!form.service_date) {
      toast.error('Service date is required');
      return;
    }

    // Coerce numeric values
    const payload = {
      service_date: form.service_date,
      service_type: form.service_type || 'Sunday Service',
      men: Number(form.men) || 0,
      women: Number(form.women) || 0,
      youth: Number(form.youth) || 0,
      teens: Number(form.teens) || 0,
      children: Number(form.children) || 0,
      notes: form.notes || '',
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/admin/attendance/${editingId}`, payload);
        toast.success('Attendance updated');
      } else {
        await api.post('/admin/attendance', payload);
        toast.success('Attendance logged');
      }
      resetForm();
      loadData();
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/admin/attendance/${id}`);
      toast.success('Attendance deleted');
      setDeleteId(null);
      loadData();
    } catch {
      toast.error('Failed to delete attendance');
    }
  }

  const total = (form.men || 0) + (form.women || 0) + (form.youth || 0) + (form.teens || 0) + (form.children || 0);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  const summary = analytics?.summary;
  const changePercent = summary && summary.latestTotal > 0 && summary.avg4 > 0
    ? Math.round(((summary.latestTotal - summary.avg4) / summary.avg4) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Church Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Log weekly service attendance and track growth</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-600 font-medium">Latest Service</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.latestTotal}</p>
            <p className="text-xs text-gray-500 mt-1">Total attendance</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-600 font-medium">4-Service Average</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.avg4}</p>
            <p className="text-xs text-gray-500 mt-1">Average headcount</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-600 font-medium">Trend</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">{changePercent > 0 ? '▲' : '▼'}</p>
              <p className={`text-2xl font-bold ${changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(changePercent)}%
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs. 4-service avg</p>
          </div>
        </div>
      )}

      {/* Log Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">{editingId ? 'Edit Attendance' : 'Log Attendance'}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
              <input
                type="date"
                value={form.service_date || ''}
                onChange={e => setForm({ ...form, service_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={form.service_type || 'Sunday Service'}
                onChange={e => setForm({ ...form, service_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Inputs */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Attendance by Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {CATEGORIES.map(cat => (
                <div key={cat}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{CATEGORY_LABELS[cat]}</label>
                  <input
                    type="number"
                    min="0"
                    value={form[cat as keyof AttendanceRecord] || 0}
                    onChange={e => setForm({ ...form, [cat]: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Total Display */}
          <div className="bg-pink-50 border border-pink-100 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700">Total: <span className="text-lg font-bold text-primary">{total}</span></p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input
              type="text"
              placeholder="e.g., Special event, holiday…"
              value={form.notes || ''}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      {analytics && (
        <div className="space-y-8 mb-8">
          {/* Week-on-Week Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Week-on-Week Attendance</h2>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                  <span className="text-xs text-gray-600">{CATEGORY_LABELS[cat]}</span>
                </div>
              ))}
            </div>

            {analytics.services.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No attendance data yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1 h-48 min-w-max">
                  {analytics.services.map(service => {
                    const maxVal = Math.max(
                      ...analytics.services.flatMap(s =>
                        CATEGORIES.map(cat => Number(s[cat as keyof AttendanceRecord]) || 0)
                      ),
                      1
                    );
                    return (
                      <div key={service.id} className="flex flex-col items-center gap-0.5 w-10">
                        <div className="flex flex-col-reverse items-center gap-px w-full" style={{ height: '10rem' }}>
                          {CATEGORIES.map(cat => {
                            const val = Number(service[cat as keyof AttendanceRecord]) || 0;
                            if (!val) return null;
                            const h = Math.max((val / maxVal) * 160, 4);
                            return (
                              <div
                                key={cat}
                                title={`${CATEGORY_LABELS[cat]}: ${val}`}
                                style={{ height: h, background: CATEGORY_COLORS[cat], width: '100%', borderRadius: 2 }}
                              />
                            );
                          })}
                        </div>
                        <span className="text-gray-400 text-xs leading-none" style={{ fontSize: 9 }}>
                          {new Date(service.service_date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Month-on-Month Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Month-on-Month Total</h2>
            {analytics.monthly.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No monthly data yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-end gap-2 h-48 min-w-max">
                  {analytics.monthly.map(month => {
                    const maxVal = Math.max(...analytics.monthly.map(m => Number(m.total) || 0), 1);
                    const h = Math.max((Number(month.total) / maxVal) * 160, 4);
                    return (
                      <div key={month.month} className="flex flex-col items-center gap-1 w-12">
                        <div
                          title={`${month.month}: ${month.total} total across ${month.services_count} services`}
                          style={{ height: h, width: '100%', background: '#2563eb', borderRadius: 4 }}
                        />
                        <span className="text-gray-400 text-xs leading-none" style={{ fontSize: 9 }}>
                          {month.month.split('-')[1]}/{month.month.split('-')[0].slice(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Totals */}
      {summary && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">All-Time Category Totals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {CATEGORIES.map(cat => (
              <div key={cat} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: CATEGORY_COLORS[cat] + '20', color: CATEGORY_COLORS[cat] }}
                >
                  <span className="font-bold text-lg">{summary.categoryTotalsAllTime[cat as keyof typeof summary.categoryTotalsAllTime]}</span>
                </div>
                <p className="text-sm font-medium text-gray-700">{CATEGORY_LABELS[cat]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <h2 className="text-lg font-bold text-gray-900 p-6 pb-0">Recent Services</h2>
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No attendance records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-t border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Service Type</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Men</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Women</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Youth</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Teens</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Children</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {new Date(record.service_date + 'T00:00:00').toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{record.service_type}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{record.men}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{record.women}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{record.youth}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{record.teens}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{record.children}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">{record.total}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(record)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(record.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Attendance?</h3>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
