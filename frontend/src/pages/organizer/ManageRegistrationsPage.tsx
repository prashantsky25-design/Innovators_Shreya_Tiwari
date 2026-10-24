import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Mail,
  QrCode,
} from 'lucide-react';

export const ManageRegistrationsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    if (!eventId) return;
    try {
      const res = await api.getEventRegistrations(eventId);
      if (res.success) {
        setRegistrations(res.registrations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const filteredRegistrations = registrations.filter((reg) => {
    const term = search.toLowerCase();
    const name = reg.userId?.name?.toLowerCase() || '';
    const email = reg.userId?.email?.toLowerCase() || '';
    const code = reg.ticket?.ticketCode?.toLowerCase() || '';
    return name.includes(term) || email.includes(term) || code.includes(term);
  });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Organization', 'Ticket Code', 'Status', 'Registered At'];
    const rows = filteredRegistrations.map((r) => [
      r.userId?.name || '',
      r.userId?.email || '',
      r.userId?.organization || '',
      r.ticket?.ticketCode || '',
      r.status,
      new Date(r.registeredAt).toLocaleString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualCheckIn = async (ticketCode: string) => {
    if (!ticketCode) return;
    try {
      await api.scanTicket({ tokenOrCode: ticketCode, eventId });
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/organizer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendee Registrations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total {registrations.length} registered participants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/organizer/scanner"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-all"
          >
            <QrCode className="w-4 h-4" />
            Open Scanner
          </Link>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-indigo-500 text-slate-700 dark:text-slate-300"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter attendees by name, email, or ticket code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No attendees matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Participant</th>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Ticket Code</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registration Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRegistrations.map((reg) => {
                  const isCheckedIn = reg.ticket?.status === 'checked_in';
                  return (
                    <tr key={reg._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {reg.userId?.name}
                        <div className="text-[11px] text-slate-400 font-normal">{reg.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{reg.userId?.organization || '—'}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                        {reg.ticket?.ticketCode || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isCheckedIn
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {isCheckedIn ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isCheckedIn ? 'Attended' : 'Registered'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(reg.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCheckedIn && reg.ticket?.ticketCode && (
                          <button
                            onClick={() => handleManualCheckIn(reg.ticket.ticketCode)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-[11px]"
                          >
                            Verify Check-in
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
