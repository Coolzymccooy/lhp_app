import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Heart, Users, MessageSquare, UserCheck, CalendarCheck, AlertTriangle } from 'lucide-react';

interface Stats {
  prayer: { total: number; new_count: number; urgent: number };
  counselling: { total: number; new_count: number };
  contact: { total: number; new_count: number };
  membership: { total: number; new_count: number };
  responses: { total: number };
}

const CARDS = [
  { key: 'prayer', label: 'Prayer Requests', icon: Heart, to: '/admin/prayer', color: 'text-red-500 bg-red-50' },
  { key: 'counselling', label: 'Counselling', icon: Users, to: '/admin/counselling', color: 'text-blue-500 bg-blue-50' },
  { key: 'contact', label: 'Contact Messages', icon: MessageSquare, to: '/admin/contact', color: 'text-green-500 bg-green-50' },
  { key: 'membership', label: 'Memberships', icon: UserCheck, to: '/admin/memberships', color: 'text-purple-500 bg-purple-50' },
  { key: 'responses', label: 'Service Responses', icon: CalendarCheck, to: '/admin/responses', color: 'text-orange-500 bg-orange-50' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats));
  }, []);

  const urgentPrayer = (stats?.prayer?.urgent ?? 0) > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">RCCG Lighthouse Parish — Pastoral Management</p>
      </div>

      {urgentPrayer && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-800 text-sm">Urgent Prayer Requests</div>
            <div className="text-red-600 text-xs">You have {stats?.prayer?.urgent} urgent prayer request(s) requiring immediate attention.</div>
          </div>
          <Link to="/admin/prayer" className="ml-auto text-sm font-semibold text-red-600 hover:text-red-800 transition-colors whitespace-nowrap">View Now →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {CARDS.map(({ key, label, icon: Icon, to, color }) => {
          const s = stats?.[key as keyof Stats] as { total: number; new_count?: number } | undefined;
          return (
            <Link key={key} to={to} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{s?.total ?? '—'}</div>
              <div className="text-sm text-gray-500 mb-3">{label}</div>
              {(s as { new_count?: number })?.new_count !== undefined && (
                <div className="text-xs font-semibold text-primary">{(s as { new_count: number }).new_count} new →</div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 text-sm">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/prayer" className="px-4 py-2 bg-pink-50 text-primary font-semibold text-sm rounded-xl hover:bg-pink-100 transition-colors">View Prayers</Link>
          <Link to="/admin/counselling" className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-100 transition-colors">View Counselling</Link>
          <Link to="/admin/sermons" className="px-4 py-2 bg-purple-50 text-purple-600 font-semibold text-sm rounded-xl hover:bg-purple-100 transition-colors">Manage Sermons</Link>
        </div>
      </div>
    </div>
  );
}
