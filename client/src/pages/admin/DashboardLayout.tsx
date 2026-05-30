import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Heart, Users, MessageSquare, UserCheck, CalendarCheck, BookOpen, LogOut, ChevronRight, TrendingUp, Calendar, Shield, FileText, Bell, UserPlus, BarChart3, Image } from 'lucide-react';

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Analytics', to: '/admin/analytics', icon: TrendingUp },
  { label: 'Attendance', to: '/admin/attendance', icon: BarChart3 },
  { label: 'Prayer Requests', to: '/admin/prayer', icon: Heart },
  { label: 'Counselling', to: '/admin/counselling', icon: Users },
  { label: 'Contact Messages', to: '/admin/contact', icon: MessageSquare },
  { label: 'Memberships', to: '/admin/memberships', icon: UserCheck },
  { label: 'Service Responses', to: '/admin/responses', icon: CalendarCheck },
  { label: 'First-Time Guests', to: '/admin/first-timers', icon: UserPlus },
  { label: 'Sermons', to: '/admin/sermons', icon: BookOpen },
  { label: 'Events', to: '/admin/events', icon: Calendar },
  { label: 'Gallery', to: '/admin/gallery', icon: Image },
  { label: 'Prayer Wall', to: '/admin/prayer-wall', icon: Shield },
  { label: 'Bulletins', to: '/admin/bulletins', icon: FileText },
  { label: 'Push Notifications', to: '/admin/push', icon: Bell },
];

export default function DashboardLayout() {
  const { admin, token, logout } = useAuthStore();
  const navigate = useNavigate();

  // App already validates the token via checkAuth() on load. Do NOT call
  // checkAuth() here — it flips `loading`, which unmounts/remounts this layout
  // through RequireAuth and creates an infinite render/request loop.
  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  if (!admin && !token) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-100 flex-shrink-0">
              <img src="/assets/lhp_logo1.png" alt="The Lighthouse Church RCCG" className="w-9 h-9 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 text-sm">LHP Admin</div>
              <div className="text-xs text-gray-500 truncate">{admin?.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-pink-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link to="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronRight className="w-4 h-4" /> View Website
          </Link>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
