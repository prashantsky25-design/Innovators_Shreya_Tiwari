import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import {
  Calendar,
  Award,
  Coins,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const ParticipantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [regRes, histRes] = await Promise.all([
          api.getMyRegistrations(),
          api.getAttendanceHistory(),
        ]);
        if (regRes.success) setRegistrations(regRes.registrations || []);
        if (histRes.success) setHistory(histRes.history || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const upcomingPasses = registrations.filter((r) => r.status === 'registered' && r.ticket);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-indigo-400 text-white font-extrabold text-2xl flex items-center justify-center">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">{user?.name}</h1>
            <p className="text-xs text-indigo-200">
              {user?.organization || 'Hyperlocal Community Member'} • {user?.email}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {user?.interests?.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-700/60 text-indigo-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Counter Button */}
        <Link
          to="/participant/history"
          className="w-full md:w-auto group px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-center sm:text-right"
        >
          <div className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
            Verified Events Attended
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 group-hover:scale-105 transition-transform">
            {user?.eventsAttendedCount || 0}
          </div>
          <div className="text-[10px] text-indigo-300 mt-0.5">Click to view complete history →</div>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Events Attended */}
        <Link
          to="/participant/history"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Attended Events</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.eventsAttendedCount || 0}
          </div>
          <div className="text-[11px] text-slate-400">Verified via on-site QR</div>
        </Link>

        {/* Upcoming Passes */}
        <Link
          to="/participant/tickets"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming Tickets</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {upcomingPasses.length}
          </div>
          <div className="text-[11px] text-slate-400">Ready for scan at gate</div>
        </Link>

        {/* EventCoins Wallet */}
        <Link
          to="/participant/rewards"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">EventCoins Balance</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {user?.eventCoinsBalance || 0}
          </div>
          <div className="text-[11px] text-slate-400">Total earned: {user?.totalCoinsEarned || 0}</div>
        </Link>

        {/* Badges */}
        <Link
          to="/participant/rewards"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Badges Unlocked</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {user?.badges?.length || 0}
          </div>
          <div className="text-[11px] text-slate-400">Milestones achieved</div>
        </Link>
      </div>

      {/* Next Upcoming Digital Ticket Pass */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            Active Digital Passes
          </h2>
          <Link
            to="/participant/tickets"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all tickets →
          </Link>
        </div>

        {upcomingPasses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-500">You don't have any upcoming registered events.</p>
            <Link
              to="/events"
              className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Discover Local Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingPasses.map((reg) => (
              <div
                key={reg._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {reg.eventId?.domain}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {reg.eventId?.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(reg.eventId?.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    ID: {reg.ticket?.ticketCode}
                  </div>
                </div>

                {reg.ticket?.qrDataUrl && (
                  <img
                    src={reg.ticket.qrDataUrl}
                    alt="Ticket QR"
                    className="w-24 h-24 rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attendance & Verified Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Recent Verified Attendance
          </h2>
          <Link
            to="/participant/history"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View full portfolio →
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No verified attendance recorded yet. Attend an event and get your QR code scanned!
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 3).map((rec) => (
              <div key={rec._id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {rec.eventId?.title}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Verified: {new Date(rec.verifiedAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">+10 Coins Credited</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rec.certificate && (
                    <a
                      href={rec.certificate.pdfPath}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      Certificate
                    </a>
                  )}
                  {rec.eventId?.slug && (
                    <Link
                      to={`/events/${rec.eventId.slug}/gallery`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Photos
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
