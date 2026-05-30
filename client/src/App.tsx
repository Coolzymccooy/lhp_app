import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AIChat from './components/ui/AIChat';
import ServiceCountdown from './components/ui/ServiceCountdown';
import WhatsAppButton from './components/ui/WhatsAppButton';
import PushPrompt from './components/ui/PushPrompt';

// Public pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import SeniorPastorsPage from './pages/SeniorPastorsPage';
import GroupsPage from './pages/GroupsPage';
import WatchLivePage from './pages/WatchLivePage';
import GivePage from './pages/GivePage';
import CounsellingPage from './pages/CounsellingPage';
import PrayerPage from './pages/PrayerPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import MembershipPage from './pages/MembershipPage';
import ICarePage from './pages/iCarePage';
import ConnectPage from './pages/ConnectPage';
import RespondPage from './pages/RespondPage';
import EventsPage from './pages/EventsPage';
import PrayerWallPage from './pages/PrayerWallPage';
import GalleryPage from './pages/GalleryPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import DashboardLayout from './pages/admin/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import SermonsAdminPage from './pages/admin/SermonsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AttendancePage from './pages/admin/AttendancePage';
import EventsAdminPage from './pages/admin/EventsAdminPage';
import GalleryAdminPage from './pages/admin/GalleryAdminPage';
import QRCodesPage from './pages/admin/QRCodesPage';
import PrayerWallAdminPage from './pages/admin/PrayerWallAdminPage';
import BulletinPage from './pages/admin/BulletinPage';
import PushNotificationsPage from './pages/admin/PushNotificationsPage';
import {
  SubmissionsPage,
  PRAYER_CONFIG,
  COUNSELLING_CONFIG,
  CONTACT_CONFIG,
  MEMBERSHIP_CONFIG,
  RESPONSES_CONFIG,
  FIRST_TIMERS_CONFIG,
} from './pages/admin/SubmissionsPage';

// Auth store
import { useAuthStore } from './store/authStore';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceCountdown />
      <Header />
      <div className="min-h-screen">{children}</div>
      <Footer />
      <AIChat />
      <WhatsAppButton />
      <PushPrompt />
    </>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ className: 'text-sm font-medium', duration: 4000 }}
      />
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/pastors" element={<PublicLayout><SeniorPastorsPage /></PublicLayout>} />
        <Route path="/senior-pastors" element={<PublicLayout><SeniorPastorsPage /></PublicLayout>} />
        <Route path="/groups" element={<PublicLayout><GroupsPage /></PublicLayout>} />
        <Route path="/watch-live" element={<PublicLayout><WatchLivePage /></PublicLayout>} />
        <Route path="/give" element={<PublicLayout><GivePage /></PublicLayout>} />
        <Route path="/counselling" element={<PublicLayout><CounsellingPage /></PublicLayout>} />
        <Route path="/prayer" element={<PublicLayout><PrayerPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
        <Route path="/membership" element={<PublicLayout><MembershipPage /></PublicLayout>} />
        <Route path="/icare" element={<PublicLayout><ICarePage /></PublicLayout>} />
        <Route path="/connect" element={<PublicLayout><ConnectPage /></PublicLayout>} />
        <Route path="/welcome" element={<PublicLayout><ConnectPage /></PublicLayout>} />
        <Route path="/first-time" element={<PublicLayout><ConnectPage /></PublicLayout>} />
        <Route path="/respond" element={<PublicLayout><RespondPage /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path="/prayer-wall" element={<PublicLayout><PrayerWallPage /></PublicLayout>} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin dashboard — protected */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="sermons" element={<SermonsAdminPage />} />
          <Route path="prayer" element={<SubmissionsPage config={PRAYER_CONFIG} />} />
          <Route path="counselling" element={<SubmissionsPage config={COUNSELLING_CONFIG} />} />
          <Route path="contact" element={<SubmissionsPage config={CONTACT_CONFIG} />} />
          <Route path="memberships" element={<SubmissionsPage config={MEMBERSHIP_CONFIG} />} />
          <Route path="responses" element={<SubmissionsPage config={RESPONSES_CONFIG} />} />
          <Route path="first-timers" element={<SubmissionsPage config={FIRST_TIMERS_CONFIG} />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="events" element={<EventsAdminPage />} />
          <Route path="gallery" element={<GalleryAdminPage />} />
          <Route path="qr" element={<QRCodesPage />} />
          <Route path="prayer-wall" element={<PrayerWallAdminPage />} />
          <Route path="bulletins" element={<BulletinPage />} />
          <Route path="push" element={<PushNotificationsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
