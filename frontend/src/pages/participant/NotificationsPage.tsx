import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { NotificationItem } from '../../types/index.js';
import { Bell, CheckCheck, QrCode, Award, Coins, Calendar, Image as ImageIcon } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return <QrCode className="w-4 h-4 text-emerald-500" />;
      case 'certificate':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'coins':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'gallery':
        return <ImageIcon className="w-4 h-4 text-sky-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">In-App Notifications</h1>
          <p className="text-xs text-slate-500">Real-time alerts for registrations, tickets, check-ins, and certificates</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-indigo-500 text-slate-700 dark:text-slate-300"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          No notifications yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                !notif.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{notif.message}</p>
                {notif.link && (
                  <Link
                    to={notif.link}
                    className="inline-block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
