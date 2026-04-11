import { useState, useEffect } from 'react';
import { TrendingUp, Heart, Users, MessageSquare, UserCheck, Calendar, BookOpen, Shield } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface DayRow {
  day: string;
  prayer: number;
  counselling: number;
  contact: number;
  membership: number;
}

interface Totals {
  prayer: number;
  counselling: number;
  contact: number;
  membership: number;
  responses: number;
  sermons: number;
  events: number;
  prayer_wall: number;
}

const STAT_CARDS = [
  { key: 'prayer' as const, label: 'Prayer Requests', icon: Heart, color: 'bg-red-50 text-red-600' },
  { key: 'counselling' as const, label: 'Counselling', icon: Users, color: 'bg-purple-50 text-purple-600' },
  { key: 'contact' as const, label: 'Contact Messages', icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
  { key: 'membership' as const, label: 'Memberships', icon: UserCheck, color: 'bg-green-50 text-green-600' },
  { key: 'responses' as const, label: 'Service Responses', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  { key: 'sermons' as const, label: 'Sermons', icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
  { key: 'events' as const, label: 'Events', icon: Calendar, color: 'bg-teal-50 text-teal-600' },
  { key: 'prayer_wall' as const, label: 'Prayer Wall', icon: Shield, color: 'bg-pink-50 text-pink-600' },
];

export default function AnalyticsPage() {
  const [last30, setLast30] = useState<DayRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [urgentPrayer, setUrgentPrayer] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => {
        setLast30(r.data.last30 ?? []);
        setTotals(r.data.totals);
        setUrgentPrayer(r.data.urgentPrayer ?? 0);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const CHART_TYPES: { key: keyof DayRow; color: string; label: string }[] = [
    { key: 'prayer', color: '#ef4444', label: 'Prayer' },
    { key: 'counselling', color: '#a855f7', label: 'Counselling' },
    { key: 'contact', color: '#3b82f6', label: 'Contact' },
    { key: 'membership', color: '#22c55e', label: 'Membership' },
  ];

  const maxVal = Math.max(
    ...last30.flatMap(d => CHART_TYPES.map(t => Number(d[t.key]) || 0)),
    1
  );

  if (loading) return <div className="text-center py-20 text-gray-400">Loading analytics…</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all church engagement data</p>
      </div>

      {urgentPrayer > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-semibold">
            {urgentPrayer} urgent prayer request{urgentPrayer !== 1 ? 's' : ''} need{urgentPrayer === 1 ? 's' : ''} attention
          </p>
          <a href="/admin/prayer" className="ml-auto text-red-600 text-xs font-bold hover:underline">Review →</a>
        </div>
      )}

      {/* Totals grid */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totals[key] ?? 0}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* 30-day chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Last 30 Days</h2>
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          {CHART_TYPES.map(t => (
            <div key={t.key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <span className="text-xs text-gray-600">{t.label}</span>
            </div>
          ))}
        </div>

        {last30.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No activity in the last 30 days yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-48 min-w-max">
              {last30.map(row => (
                <div key={row.day} className="flex flex-col items-center gap-0.5 w-8">
                  <div className="flex flex-col-reverse items-center gap-px w-full" style={{ height: '10rem' }}>
                    {CHART_TYPES.map(t => {
                      const val = Number(row[t.key]) || 0;
                      if (!val) return null;
                      const h = Math.max((val / maxVal) * 160, 4);
                      return (
                        <div
                          key={t.key}
                          title={`${t.label}: ${val}`}
                          style={{ height: h, background: t.color, width: '100%', borderRadius: 2 }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-gray-400 text-xs leading-none" style={{ fontSize: 9 }}>
                    {row.day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
