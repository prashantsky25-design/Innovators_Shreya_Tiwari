import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { TicketItem } from '../../types/index.js';
import { QrCode, Calendar, MapPin, Download, Printer, CheckCircle2 } from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.getMyRegistrations();
        if (res.success) {
          setRegistrations(res.registrations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const activeTickets = registrations.filter((r) => r.ticket);

  const printTicket = (ticketCode: string) => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Digital Passes & QR Tickets
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Present these QR passes at the event check-in gate for verified attendance
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      ) : activeTickets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <QrCode className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No active passes found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You haven’t registered for any upcoming events yet.
          </p>
          <Link
            to="/events"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTickets.map((reg) => {
            const ev = reg.eventId;
            const t = reg.ticket;
            const isCheckedIn = t?.status === 'checked_in';

            return (
              <div
                key={reg._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col justify-between"
              >
                {/* Header ribbon */}
                <div className={`p-4 text-white flex items-center justify-between ${
                  isCheckedIn ? 'bg-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-indigo-800'
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {ev?.domain || 'Community Event'}
                    </span>
                    <h3 className="font-extrabold text-sm line-clamp-1">{ev?.title}</h3>
                  </div>
                  <div className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
                    {isCheckedIn ? 'Verified In' : 'Active Pass'}
                  </div>
                </div>

                {/* Ticket Details & QR */}
                <div className="p-6 space-y-4 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                      Ticket Pass Token
                    </div>
                    <div className="font-mono font-bold text-base text-slate-900 dark:text-white mb-3">
                      {t.ticketCode}
                    </div>
                    {t.qrDataUrl && (
                      <img
                        src={t.qrDataUrl}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto rounded-xl bg-white p-2 border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    )}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Scan with official Elevate organizer terminal
                    </div>
                  </div>

                  <div className="text-left space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{new Date(ev?.startDate).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span className="line-clamp-1">{ev?.venueName} — {ev?.address}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <Link
                    to={`/events/${ev?.slug}`}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Event Details
                  </Link>
                  <button
                    onClick={() => printTicket(t.ticketCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold hover:border-indigo-500 text-slate-700 dark:text-slate-300"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Pass
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
