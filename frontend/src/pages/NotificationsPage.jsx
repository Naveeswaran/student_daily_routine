import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { setupWebPushSubscription } from '../services/notifications';
import { useToast } from '../components/Toast';
import { 
  BellRing, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  RefreshCw 
} from 'lucide-react';

export const NotificationsPage = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState('default');
  const [subscribing, setSubscribing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const handleEnablePush = async () => {
    setSubscribing(true);
    try {
      const result = await setupWebPushSubscription();
      if (result.success) {
        setPushStatus('granted');
        showToast(result.message);
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubscribing(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Notification History & Alerts</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Log of routine reminders, overdue alerts, and delivery confirmations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Check className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Push Notification Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-brand-900/40 via-indigo-900/30 to-slate-900 border border-brand-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Web Push Notifications</span>
              {pushStatus === 'granted' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Permission Required
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              RoutineMate delivers push alerts when routines are due and follows up if a task remains incomplete.
            </p>
          </div>
        </div>

        {pushStatus !== 'granted' && (
          <button
            onClick={handleEnablePush}
            disabled={subscribing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all shrink-0 disabled:opacity-50"
          >
            {subscribing ? 'Connecting...' : 'Enable Browser Push'}
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
          <BellRing className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-200">No notifications in history</h3>
          <p className="text-xs text-slate-500 mt-1">
            As routines become due or overdue, automatic notifications and delivery records will show here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !notif.isRead
                  ? 'bg-brand-950/20 border-brand-800/40 hover:border-brand-700/60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.notificationType === 'FOLLOWUP_REMINDER'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-brand-500/10 text-brand-400'
                }`}>
                  {notif.notificationType === 'FOLLOWUP_REMINDER' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                    <span className="font-mono">
                      {new Date(notif.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {notif.routineTitle && (
                      <span className="font-medium text-brand-300">
                        Routine: {notif.routineTitle}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                      Status: {notif.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif.id);
                  }}
                  className="self-end sm:self-center text-xs text-brand-400 hover:text-brand-300 font-medium px-2.5 py-1 rounded-lg bg-slate-800 shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
