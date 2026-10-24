import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Calendar,
  Award,
  Coins,
  MapPin,
  Clock,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export const AttendanceHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [totalAttended, setTotalAttended] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEventModal, setSelectedEventModal] = useState<any | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getAttendanceHistory();
        if (res.success) {
          setHistory(res.history || []);
          setTotalAttended(res.totalVerifiedAttended || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Verified Attendance Counter */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Verified Attendance Portfolio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Attendance History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click on any verified event to review its timestamp, certificate, photos, and coins earned.
          </p>
        </div>

        {/* Counter Display */}
        <div className="px-6 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center shrink-0">
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Events Attended
          </div>
          <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalAttended}
          </div>
          <div className="text-[10px] text-emerald-600/80">Verified Records</div>
        </div>
      </div>

      {/* Attendance List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No verified attendances yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Attend events and have your QR code scanned at the venue to build your verifiable community portfolio.
          </p>
          <Link
            to="/events"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
          >
            Find Local Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => {
            const ev = record.eventId;
            return (
              <div
                key={record._id}
                onClick={() => setSelectedEventModal(record)}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {ev?.coverImage && (
                    <img
                      src={ev.coverImage}
                      alt={ev.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {ev?.domain}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(ev?.startDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                      {ev?.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified: {new Date(record.verifiedAt).toLocaleTimeString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Coins className="w-3.5 h-3.5" />
                        +10 EventCoins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {record.certificate && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      🎓 Certificate
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Detail Modal for Clicked Event */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Verified Event Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {selectedEventModal.eventId?.domain}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedEventModal.eventId?.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  📍 {selectedEventModal.eventId?.venueName} — {selectedEventModal.eventId?.address}
                </p>
              </div>

              {/* Exact Timestamp Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Official Server Check-in:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {new Date(selectedEventModal.verifiedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Verification Mode:</span>
                  <span className="font-medium capitalize">{selectedEventModal.checkInMethod || 'QR Scan'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">EventCoins Earned:</span>
                  <span className="font-bold text-amber-500">+10 EventCoins</span>
                </div>
              </div>

              {/* Action Buttons: Certificate, Photos, Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedEventModal.certificate ? (
                  <a
                    href={selectedEventModal.certificate.pdfPath}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center inline-flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Certificate
                  </a>
                ) : (
                  <button
                    disabled
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold text-center"
                  >
                    Certificate Pending
                  </button>
                )}

                {selectedEventModal.eventId?.slug && (
                  <Link
                    to={`/events/${selectedEventModal.eventId.slug}/gallery`}
                    className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs text-center inline-flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-sky-500" />
                    View Website Photo Gallery
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
