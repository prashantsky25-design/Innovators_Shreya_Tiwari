import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Compass, QrCode, Coins, User, PlusCircle, LayoutDashboard } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Link
          to="/events"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive('/events') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </Link>

        {user?.role === 'organizer' ? (
          <>
            <Link
              to="/organizer/dashboard"
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                isActive('/organizer/dashboard') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/organizer/scanner"
              className="flex flex-col items-center -mt-4 bg-emerald-600 text-white rounded-full p-2.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              <QrCode className="w-6 h-6" />
              <span className="text-[9px] font-bold mt-0.5">Scan</span>
            </Link>

            <Link
              to="/organizer/events/new"
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                isActive('/organizer/events/new') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <PlusCircle className="w-5 h-5 mb-0.5" />
              <span>Host</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/participant/tickets"
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                isActive('/participant/tickets') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <QrCode className="w-5 h-5 mb-0.5 text-emerald-500" />
              <span>Tickets</span>
            </Link>

            <Link
              to="/participant/rewards"
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
                isActive('/participant/rewards') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Coins className="w-5 h-5 mb-0.5 text-amber-500" />
              <span>Coins</span>
            </Link>
          </>
        )}

        <Link
          to={user ? (user.role === 'organizer' ? '/organizer/dashboard' : '/participant/profile') : '/login'}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive('/participant/profile') || isActive('/login') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </Link>
      </div>
    </div>
  );
};
