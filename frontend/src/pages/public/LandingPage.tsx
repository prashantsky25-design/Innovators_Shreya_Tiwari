import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { EventItem } from '../../types/index.js';
import { EventMap } from '../../components/EventMap.js';
import {
  Compass,
  QrCode,
  Award,
  Coins,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getEvents({ featured: 'true' });
        if (res.success) {
          setFeaturedEvents(res.events);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent dark:from-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Hyperlocal Node Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hyperlocal Discovery & Community Engagement Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Discover What’s Happening Around You.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              Engage, Attend, and Earn.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Real-time local meetups, tech hackathons, workshops, and summits. Receive tamper-proof QR tickets, verify attendance on-site, earn EventCoins, and collect official certificates.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Compass className="w-5 h-5" />
              Explore Hyperlocal Events
            </Link>

            <Link
              to="/organizer/events/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Host a Community Event
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Platform Trust KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified Attendances</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Instant</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">QR Check-in & Audio Sync</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl font-bold text-amber-500">+10 Coins</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Earned per Attendance</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">PDF</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deterministic Certificates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              Top Trending
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Featured Hyperlocal Gatherings
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((ev) => (
              <div
                key={ev._id}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={ev.coverImage}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold">
                    {ev.domain}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold">
                    {ev.price === 0 ? 'FREE' : `₹${ev.price}`}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span className="truncate">{ev.venueName}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className={ev.remainingSeats <= 5 ? 'text-red-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                        {ev.remainingSeats} seats
                      </span>{' '}
                      remaining
                    </div>

                    <Link
                      to={`/events/${ev.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white text-xs font-bold transition-all"
                    >
                      View Event
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            OpenStreetMap Integration
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Explore Events on the Live Map
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Discover community gatherings, workshops, and hackathons happening right near your neighborhood.
          </p>
        </div>

        <EventMap events={featuredEvents} height="420px" />
      </section>

      {/* How It Works 4-Step Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            End-to-End Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How EventSphere Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            From discovering events to unlocking milestone badges in 4 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Hyperlocal Discovery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Filter by domains like AI/ML, Web Dev, Cybersecurity, or Hackathons. Search within custom distance radius on OpenStreetMap.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Secure Digital Ticket</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Register instantly. An opaque cryptographic QR token is generated and emailed to your inbox and stored in your profile passbook.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Instant QR Check-In</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Event staff scan your pass on-site. Server records exact timestamp, prevents duplicate scans, and increments verified attendance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Coins & Certificates</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Get +10 EventCoins automatically credited, unlock milestone badges, and download your personalized PDF certificate.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Join the Hyperlocal Movement?
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              Create your participant profile in seconds or register as an organizer to host community events with verified QR attendance.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-md transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-sm border border-indigo-500/50 transition-all"
              >
                Browse All Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
