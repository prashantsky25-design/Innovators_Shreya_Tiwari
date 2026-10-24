import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  Compass,
  Calendar,
  Award,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  PlusCircle,
  QrCode,
  Shield,
  Coins,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" strokeDasharray="4 2" />
                  <circle cx="24" cy="24" r="14" fill="#6366f1" />
                  <path d="M24 16C21.79 16 20 17.79 20 20C20 23 24 28 24 28C24 28 28 23 28 20C28 17.79 26.21 16 24 16Z" fill="#ffffff"/>
                </svg>
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
                EventSphere
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                Hyperlocal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/events"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Events
            </Link>

            <Link
              to="/leaderboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/leaderboard')
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              Leaderboard
            </Link>

            {user?.role === 'organizer' && (
              <>
                <Link
                  to="/organizer/dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    isActive('/organizer/dashboard')
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/organizer/scanner"
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    isActive('/organizer/scanner')
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  QR Scanner
                </Link>
                <Link
                  to="/organizer/events/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Host Event
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* EventCoins Pill */}
                <Link
                  to="/participant/rewards"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-sm"
                  title="EventCoins Balance"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{user.eventCoinsBalance}</span>
                </Link>

                {/* Notifications Bell */}
                <Link
                  to="/participant/notifications"
                  aria-label="Notifications"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                </Link>

                {/* User Dropdown / Profile pill */}
                <Link
                  to={user.role === 'organizer' ? '/organizer/dashboard' : '/participant/dashboard'}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-400 transition-colors"
                >
                  <div className="text-left hidden lg:block pr-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{user.name}</div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 capitalize">{user.role}</div>
                  </div>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign out"
                  className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Compass className="w-5 h-5 text-indigo-500" />
            Explore Hyperlocal Events
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Award className="w-5 h-5 text-amber-500" />
            Community Leaderboard
          </Link>

          {user && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                to={user.role === 'organizer' ? '/organizer/dashboard' : '/participant/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
              >
                <UserIcon className="w-5 h-5" />
                My Dashboard ({user.role})
              </Link>

              {user.role === 'participant' && (
                <>
                  <Link
                    to="/participant/tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <QrCode className="w-5 h-5 text-emerald-500" />
                    My QR Tickets
                  </Link>
                  <Link
                    to="/participant/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Attendance History
                  </Link>
                  <Link
                    to="/participant/certificates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Award className="w-5 h-5 text-amber-500" />
                    Certificates
                  </Link>
                  <Link
                    to="/participant/rewards"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Coins className="w-5 h-5 text-amber-500" />
                    EventCoins & Badges ({user.eventCoinsBalance} Coins)
                  </Link>
                </>
              )}

              {user.role === 'organizer' && (
                <>
                  <Link
                    to="/organizer/events/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <PlusCircle className="w-5 h-5 text-indigo-500" />
                    Host New Event
                  </Link>
                  <Link
                    to="/organizer/scanner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <QrCode className="w-5 h-5 text-emerald-500" />
                    QR Ticket Scanner
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800"
                >
                  <Shield className="w-5 h-5" />
                  Admin Governance
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
