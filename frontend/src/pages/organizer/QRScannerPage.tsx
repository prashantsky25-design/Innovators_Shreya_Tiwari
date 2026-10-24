import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { QRScannerModal } from '../../components/QRScannerModal.js';
import { EventItem } from '../../types/index.js';
import { QrCode, CheckCircle2, Users, ArrowLeft, RefreshCw } from 'lucide-react';

export const QRScannerPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [liveAttendanceData, setLiveAttendanceData] = useState<any | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.getOrganizerEvents();
        if (res.success && res.events.length > 0) {
          setEvents(res.events);
          setSelectedEventId(res.events[0]._id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchEvents();
  }, []);

  const fetchLiveStats = async () => {
    if (!selectedEventId) return;
    try {
      const res = await api.getLiveAttendance(selectedEventId);
      if (res.success) {
        setLiveAttendanceData(res);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLiveStats();
  }, [selectedEventId]);

  const handleSuccessCheckIn = (res: any) => {
    setRecentScans((prev) => [res, ...prev.slice(0, 9)]);
    fetchLiveStats();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            Live Check-in Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            QR Ticket Scanner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan attendee digital passes with high-frequency camera detection and atomic verification
          </p>
        </div>

        {/* Event Selector */}
        {events.length > 0 && (
          <div className="w-full sm:w-72">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
              Active Check-In Event:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Live Turnout Metrics */}
      {liveAttendanceData && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500">Registered</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {liveAttendanceData.totalRegistered}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500">Verified Attended</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {liveAttendanceData.totalAttended}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500">Live Turnout</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {liveAttendanceData.turnoutRate}%
            </div>
          </div>
        </div>
      )}

      {/* Embedded Scanner Component */}
      <QRScannerModal
        eventId={selectedEventId}
        onSuccessCheckIn={handleSuccessCheckIn}
      />

      {/* Recent Scans Live Feed */}
      {recentScans.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Recent Scans in This Session
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentScans.map((scan, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold">{scan.participant?.name || 'Attendee'}</span>
                  <span className="text-slate-400 ml-2 font-mono">{scan.ticketCode}</span>
                </div>
                <div className="text-emerald-600 font-semibold">
                  {new Date(scan.verifiedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
