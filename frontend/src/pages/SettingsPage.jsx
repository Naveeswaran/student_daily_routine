import React, { useState, useEffect } from 'react';
import { settingsAPI, pushAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { playAlertTone, triggerForegroundNotification } from '../services/notifications';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Lock, 
  Send, 
  ShieldCheck, 
  Check, 
  Clock, 
  Save 
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, setUser, theme, toggleTheme } = useAuth();
  const { showToast } = useToast();

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Notification Preferences State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(15);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [weekStartDay, setWeekStartDay] = useState('MONDAY');
  const [prefLoading, setPrefLoading] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Test Notification State
  const [testingPush, setTestingPush] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.getAll();
        if (data.profile) {
          setName(data.profile.name || '');
          setEmail(data.profile.email || '');
        }
        if (data.notifications) {
          setNotificationsEnabled(data.notifications.enabled ?? true);
          setReminderInterval(data.notifications.reminderIntervalMinutes || 15);
          setQuietStart(data.notifications.quietStart || '22:00');
          setQuietEnd(data.notifications.quietEnd || '07:00');
          setSoundEnabled(data.notifications.soundEnabled ?? true);
          setWeekStartDay(data.notifications.weekStartDay || 'MONDAY');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    fetchSettings();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updated = await settingsAPI.updateProfile({ name, email });
      setUser(prev => ({ ...prev, name: updated.name, email: updated.email }));
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefLoading(true);
    try {
      await settingsAPI.updateNotifications({
        enabled: notificationsEnabled,
        reminderIntervalMinutes: parseInt(reminderInterval, 10),
        quietStart,
        quietEnd,
        soundEnabled,
        theme,
        weekStartDay
      });
      showToast('Notification preferences saved!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPrefLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill in both password fields', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await settingsAPI.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    setTestingPush(true);
    try {
      const res = await pushAPI.sendTest();
      showToast(res.message || 'Test notification dispatched!');
      if (soundEnabled) playAlertTone();
      triggerForegroundNotification(
        'RoutineMate – Test Notification',
        'Smart alert system is online and ready for your routine schedule.'
      );
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setTestingPush(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Settings & Preferences</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Customize your profile, notification triggers, quiet hours, and app appearance
        </p>
      </div>

      {/* 1. Student Profile Settings */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Student Profile</h3>
            <p className="text-xs text-slate-400">Update your student name and email address</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Notification Preferences & Quiet Hours */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Smart Notification Preferences</h3>
              <p className="text-xs text-slate-400">Configure reminder intervals, quiet hours, and alerts</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTestNotification}
            disabled={testingPush}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testingPush ? 'Dispatching...' : 'Test Notification'}</span>
          </button>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          {/* Notification Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Enable Smart Notifications</h4>
              <p className="text-xs text-slate-400">Receive due and overdue alerts for scheduled routines</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                notificationsEnabled ? 'bg-brand-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Follow-up reminder delay */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Overdue Follow-Up Delay (Minutes)
              </label>
              <select
                value={reminderInterval}
                onChange={(e) => setReminderInterval(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes (Default)</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            {/* Week start day */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Week Start Day
              </label>
              <select
                value={weekStartDay}
                onChange={(e) => setWeekStartDay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="MONDAY">Monday (Default)</option>
                <option value="SUNDAY">Sunday</option>
              </select>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Quiet Hours</span>
              </h4>
              <p className="text-xs text-slate-400">Do not send notifications during your sleep or study silence hours</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quiet Start Time</label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quiet End Time</label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={prefLoading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{prefLoading ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Appearance & Theme */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Appearance Theme</h3>
            <p className="text-xs text-slate-400">Choose between dark aesthetic and light mode</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`p-4 rounded-2xl border flex items-center gap-3 text-left transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/90 border-brand-500 text-white ring-2 ring-brand-500/30'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-5 h-5 text-brand-400" />
            <div>
              <p className="text-sm font-bold">Dark Mode</p>
              <p className="text-xs text-slate-500">Sleek, low-light productivity</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`p-4 rounded-2xl border flex items-center gap-3 text-left transition-all ${
              theme === 'light'
                ? 'bg-slate-800/90 border-brand-500 text-white ring-2 ring-brand-500/30'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-bold">Light Mode</p>
              <p className="text-xs text-slate-500">High contrast daylight style</p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Security & Password Change */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Security & Password</h3>
            <p className="text-xs text-slate-400">Update your account password with BCrypt verification</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="•••••••• (Min 6 chars)"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? 'Changing...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
