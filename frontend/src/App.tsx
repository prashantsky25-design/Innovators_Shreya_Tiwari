import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/Navbar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { Footer } from './components/Footer.js';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.js';
import { ExploreEvents } from './pages/public/ExploreEvents.js';
import { EventDetail } from './pages/public/EventDetail.js';
import { EventGalleryPage } from './pages/public/EventGalleryPage.js';
import { LeaderboardPage } from './pages/public/LeaderboardPage.js';
import { VerifyCertificate } from './pages/public/VerifyCertificate.js';
import { Login } from './pages/public/Login.js';
import { Signup } from './pages/public/Signup.js';

// Participant Pages
import { ParticipantDashboard } from './pages/participant/ParticipantDashboard.js';
import { MyTicketsPage } from './pages/participant/MyTicketsPage.js';
import { AttendanceHistoryPage } from './pages/participant/AttendanceHistoryPage.js';
import { CertificatesPage } from './pages/participant/CertificatesPage.js';
import { RewardsPage } from './pages/participant/RewardsPage.js';
import { NotificationsPage } from './pages/participant/NotificationsPage.js';
import { ProfileSettingsPage } from './pages/participant/ProfileSettingsPage.js';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard.js';
import { CreateEditEventPage } from './pages/organizer/CreateEditEventPage.js';
import { ManageRegistrationsPage } from './pages/organizer/ManageRegistrationsPage.js';
import { QRScannerPage } from './pages/organizer/QRScannerPage.js';
import { CertificateEditorPage } from './pages/organizer/CertificateEditorPage.js';
import { GalleryManagerPage } from './pages/organizer/GalleryManagerPage.js';

// Admin Page
import { AdminDashboard } from './pages/admin/AdminDashboard.js';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/events" element={<ExploreEvents />} />
                <Route path="/events/:identifier" element={<EventDetail />} />
                <Route path="/events/:slug/gallery" element={<EventGalleryPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/certificates/verify/:certificateId" element={<VerifyCertificate />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Participant Protected Routes */}
                <Route
                  path="/participant/dashboard"
                  element={
                    <ProtectedRoute>
                      <ParticipantDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/participant/tickets"
                  element={
                    <ProtectedRoute>
                      <MyTicketsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/participant/history"
                  element={
                    <ProtectedRoute>
                      <AttendanceHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/participant/certificates"
                  element={
                    <ProtectedRoute>
                      <CertificatesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/participant/rewards"
                  element={
                    <ProtectedRoute>
                      <RewardsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/participant/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/participant/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileSettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Organizer Protected Routes */}
                <Route
                  path="/organizer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer/events/new"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <CreateEditEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer/events/:eventId/registrations"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <ManageRegistrationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer/scanner"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <QRScannerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer/certificates"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <CertificateEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer/events/:eventId/gallery"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <GalleryManagerPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Route */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <MobileBottomNav />
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
