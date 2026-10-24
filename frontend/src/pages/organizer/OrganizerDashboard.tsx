import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { EventItem } from '../../types/index.js';
import {
  Calendar,
  Users,
  QrCode,
  PlusCircle,
  TrendingUp,
  Image as ImageIcon,
  Award,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      try {
        const res = await api.getOrganizerEvents();
        if (res.success) {
          setEvents(res.events || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizerEvents();
  }, []);

  const totalRegistered = events.reduce((acc, ev) => acc + (ev.registeredCount || 0), 0);
  const totalVerified = events.reduce((acc, ev) => acc + (ev.verifiedAttendanceCount || 0), 0);
  const overallTurnout = totalRegistered > 0 ? Math.round((totalVerified / totalRegistered) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-xl">
        <div className="space-y-1">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Organizer Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Event Management Hub</h1>
          <p className="text-xs text-indigo-200">
            Monitor live event registrations, scan attendee QR passes, and publish certificates
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/organizer/scanner"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <QrCode className="w-4 h-4" />
            Launch Scanner
          </Link>
          <Link
            to="/organizer/events/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold shadow-md hover:bg-indigo-50 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Active Events Hosted</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{events.length}</div>
          <div className="text-[11px] text-slate-400">Total portfolio</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Total Registrations</div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalRegistered}</div>
          <div className="text-[11px] text-slate-400">Tickets generated</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Verified Check-Ins</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalVerified}</div>
          <div className="text-[11px] text-slate-400">On-site attendance verified</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Turnout Conversion</div>
          <div className="text-3xl font-extrabold text-amber-500">{overallTurnout}%</div>
          <div className="text-[11px] text-slate-400">Attendance to registration</div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">My Hosted Events</h2>
          <Link
            to="/organizer/certificates"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5" />
            Certificate Templates
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No events created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Host your first hyperlocal workshop, tech hackathon, or meetup with verified QR tickets.
            </p>
            <Link
              to="/organizer/events/new"
              className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
            >
              Host First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={ev.coverImage}
                    alt={ev.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {ev.domain}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500">{new Date(ev.startDate).toDateString()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        ev.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ev.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{ev.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Registrations: <strong>{ev.registeredCount} / {ev.capacity}</strong></span>
                      <span>•</span>
                      <span>Verified Attendees: <strong className="text-emerald-600">{ev.verifiedAttendanceCount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Organizer Shortcut Action Buttons */}
                <div className="w-full md:w-auto flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/organizer/events/${ev._id}/edit`}
                    className="flex-1 sm:flex-initial justify-center px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1 transition-colors border border-amber-200 dark:border-amber-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Link>

                  <Link
                    to={`/organizer/events/${ev._id}/registrations`}
                    className="flex-1 sm:flex-initial text-center px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    Attendees ({ev.registeredCount})
                  </Link>

                  <Link
                    to={`/organizer/events/${ev._id}/gallery`}
                    className="flex-1 sm:flex-initial justify-center px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                    Gallery
                  </Link>

                  <Link
                    to="/organizer/scanner"
                    className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Scan QR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
