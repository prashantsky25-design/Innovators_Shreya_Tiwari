import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import {
  Shield,
  Users,
  Calendar,
  Award,
  Coins,
  CheckCircle2,
  Lock,
  PlusCircle,
  FileText,
  Mail,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'domains' | 'audit' | 'emails'>('users');
  const [loading, setLoading] = useState(true);

  // New domain form
  const [domainName, setDomainName] = useState('');
  const [domainDesc, setDomainDesc] = useState('');
  const [domainIcon, setDomainIcon] = useState('Globe');
  const [domainColor, setDomainColor] = useState('#6366f1');

  const fetchAdminData = async () => {
    try {
      const [mRes, uRes, aRes, eRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getAuditLogs(),
        api.getEmailLogs(),
      ]);
      if (mRes.success) setMetrics(mRes.metrics);
      if (uRes.success) setUsers(uRes.users || []);
      if (aRes.success) setAuditLogs(aRes.logs || []);
      if (eRes.success) setEmailLogs(eRes.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (e: any) {
      alert(e.message || 'Failed to update role');
    }
  };

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName) return;
    try {
      await api.createDomain({
        name: domainName,
        description: domainDesc,
        icon: domainIcon,
        color: domainColor,
      });
      alert('Domain created successfully!');
      setDomainName('');
      setDomainDesc('');
    } catch (e: any) {
      alert(e.message || 'Failed to create domain');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Governance & System Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Platform Control Center</h1>
          <p className="text-xs text-purple-200">
            RBAC permissions, event moderation, audit trails, and economy telemetry
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500">Total Users</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics?.totalUsers || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500">Organizers</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics?.totalOrganizers || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500">Events</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics?.totalEvents || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500">Verified Check-Ins</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics?.totalAttendances || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500">Certificates</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {metrics?.totalCertificates || 0}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500">Coins Issued</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {metrics?.totalCoinsIssued || 0}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          User RBAC Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('domains')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'domains'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Domain Creator
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'emails'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Transactional Email Logs ({emailLogs.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Events Attended</th>
                  <th className="px-6 py-3.5">EventCoins</th>
                  <th className="px-6 py-3.5 text-right">Role Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {u.name}
                      <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{u.eventsAttendedCount || 0}</td>
                    <td className="px-6 py-4 font-bold text-amber-500">{u.eventCoinsBalance || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      >
                        <option value="participant">Participant</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'domains' && (
        <form
          onSubmit={handleCreateDomain}
          className="max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add New Event Domain</h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Domain Name</label>
            <input
              type="text"
              required
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="e.g. Quantum Computing"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Description</label>
            <input
              type="text"
              value={domainDesc}
              onChange={(e) => setDomainDesc(e.target.value)}
              placeholder="Brief summary of this domain category"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Create Domain
          </button>
        </form>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.action}</span>
                  <span className="text-slate-400 ml-2">by {log.actorEmail || 'System'}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Target: {log.targetType} ({log.targetId}) • IP: {log.ip}
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'emails' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {emailLogs.map((log) => (
              <div key={log._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{log.subject}</div>
                  <div className="text-[11px] text-slate-500">
                    To: {log.recipient} • Type: {log.type}
                  </div>
                  {log.previewUrl && (
                    <a
                      href={log.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-500 hover:underline"
                    >
                      View Ethereal Preview ↗
                    </a>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
