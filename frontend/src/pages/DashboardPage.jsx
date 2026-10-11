import React, { useState, useEffect } from 'react';
import { dashboardAPI, routineAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Check, 
  X, 
  BellRing,
  Award,
  Zap
} from 'lucide-react';

export const DashboardPage = ({ onOpenAddModal, onNavigateTab }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await dashboardAPI.getToday();
      setDashboard(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh dashboard every 15s to update live due/overdue status
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (routineId) => {
    try {
      await routineAPI.markComplete(routineId);
      showToast('Routine marked as completed!');
      fetchDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSkip = async (routineId) => {
    try {
      await routineAPI.markSkip(routineId);
      showToast('Routine marked as skipped', 'info');
      fetchDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completed', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'DUE_SOON':
        return { label: 'Due Soon', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse' };
      case 'OVERDUE':
        return { label: 'Overdue', bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'SKIPPED':
        return { label: 'Skipped', bg: 'bg-slate-700/40 text-slate-400 border-slate-700/60' };
      case 'UPCOMING':
      default:
        return { label: 'Upcoming', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    totalToday = 0,
    completedToday = 0,
    pendingToday = 0,
    overdueToday = 0,
    completionRate = 0,
    todaySchedule = [],
    upcomingRoutine,
    recentNotifications = [],
    weeklyProductivity = []
  } = dashboard || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900/40 via-indigo-900/30 to-slate-900/60 border border-brand-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Routine Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-brand-300 to-indigo-300 bg-clip-text text-transparent">{user?.name || 'Student'}</span>!
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Here is your routine for today. Stay focused, finish your goals on time, and keep your consistency streak going.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Add Routine</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Total Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Today</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalToday}</div>
          <p className="text-[11px] text-slate-500 mt-1">Configured for today</p>
        </div>

        {/* Completed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{completedToday}</div>
          <p className="text-[11px] text-slate-500 mt-1">{completionRate}% completion</p>
        </div>

        {/* Pending */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingToday}</div>
          <p className="text-[11px] text-slate-500 mt-1">Upcoming or due soon</p>
        </div>

        {/* Overdue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Overdue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">{overdueToday}</div>
          <p className="text-[11px] text-slate-500 mt-1">Requires your attention</p>
        </div>
      </div>

      {/* Progress & Upcoming Routine Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Completion Meter */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-200">Daily Completion Goal</h3>
              <span className="text-xs font-bold text-brand-400">{completionRate}%</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {completedToday} of {totalToday} routines finished
            </p>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Target: 100% daily</span>
            </span>
            <button 
              onClick={() => onNavigateTab('progress')}
              className="text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1"
            >
              Detailed Stats <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Routine Spotlight Card */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-indigo-950/40 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Next Scheduled Task
            </span>
            {upcomingRoutine && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(upcomingRoutine.status).bg}`}>
                {getStatusBadge(upcomingRoutine.status).label}
              </span>
            )}
          </div>

          {upcomingRoutine ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div>
                <h4 className="text-lg font-bold text-white">{upcomingRoutine.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-md">
                    {upcomingRoutine.category}
                  </span>
                  <span>{upcomingRoutine.startTime} {upcomingRoutine.endTime ? `- ${upcomingRoutine.endTime}` : ''}</span>
                  {upcomingRoutine.description && (
                    <span className="text-slate-500 italic max-w-sm truncate">{upcomingRoutine.description}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleComplete(upcomingRoutine.id)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark Done</span>
                </button>
                <button
                  onClick={() => handleSkip(upcomingRoutine.id)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-sm">
              <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-200">All routines for today are completed!</p>
              <p className="text-xs text-slate-500 mt-0.5">Great job staying on top of your daily goals.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid: Timeline vs Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Timeline (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100">Today's Schedule</h3>
              <p className="text-xs text-slate-400">Chronological timeline of all routines</p>
            </div>
            <button
              onClick={() => onNavigateTab('routines')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No routines scheduled for today</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Add your daily classes, study sessions, workouts, and habits.</p>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Routine
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {todaySchedule.map((routine) => {
                const badge = getStatusBadge(routine.status);
                const isDone = routine.status === 'COMPLETED';
                const isSkipped = routine.status === 'SKIPPED';

                return (
                  <div
                    key={routine.id}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 ${
                      isDone
                        ? 'bg-slate-900/40 border-emerald-950/50 opacity-80'
                        : routine.status === 'OVERDUE'
                        ? 'bg-rose-950/20 border-rose-900/40'
                        : routine.status === 'DUE_SOON'
                        ? 'bg-amber-950/20 border-amber-900/40'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    {/* Timeline Node Dot */}
                    <div className={`absolute -left-[21px] top-5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                      isDone ? 'bg-emerald-400' :
                      routine.status === 'OVERDUE' ? 'bg-rose-400' :
                      routine.status === 'DUE_SOON' ? 'bg-amber-400' :
                      'bg-sky-400'
                    }`}></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {routine.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="font-mono text-brand-300 font-semibold">{routine.startTime}</span>
                          {routine.endTime && <span className="font-mono text-slate-500">to {routine.endTime}</span>}
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-300">
                            {routine.category}
                          </span>
                        </div>
                        {routine.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">{routine.description}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {!isDone && (
                          <button
                            onClick={() => handleComplete(routine.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="Mark as Completed"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
                        {!isSkipped && !isDone && (
                          <button
                            onClick={() => handleSkip(routine.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                            title="Skip Routine"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {(isDone || isSkipped) && (
                          <button
                            onClick={() => routineAPI.markPending(routine.id).then(fetchDashboard)}
                            className="text-[11px] text-slate-400 hover:text-brand-300 font-medium px-2 py-1 rounded bg-slate-800"
                            title="Undo Status"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Weekly Productivity & Recent Alerts */}
        <div className="space-y-6">
          {/* Weekly Productivity Mini Bars */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <span>Last 7 Days</span>
              </h4>
              <button
                onClick={() => onNavigateTab('progress')}
                className="text-xs text-brand-400 hover:text-brand-300"
              >
                Trends
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 h-32 items-end pt-4 pb-1">
              {weeklyProductivity.map((day, idx) => {
                const heightPct = Math.max(day.percentage, 8);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-slate-400 font-mono">{Math.round(day.percentage)}%</span>
                    <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-20">
                      <div
                        className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 rounded-t-md transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{day.dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Notifications Feed */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-brand-400" />
                <span>Recent Reminders</span>
              </h4>
              <button
                onClick={() => onNavigateTab('notifications')}
                className="text-xs text-brand-400 hover:text-brand-300"
              >
                All
              </button>
            </div>

            <div className="space-y-2.5">
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No alerts recorded yet.</p>
              ) : (
                recentNotifications.slice(0, 4).map(notif => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-300">{notif.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
