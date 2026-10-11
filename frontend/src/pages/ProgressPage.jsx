import React, { useState, useEffect } from 'react';
import { progressAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Zap, 
  Target 
} from 'lucide-react';

export const ProgressPage = () => {
  const { showToast } = useToast();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await progressAPI.getWeekly();
        setProgress(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading && !progress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    dailyCompletionPercentage = 0,
    weeklyCompletionRate = 0,
    totalCompletedRoutines = 0,
    totalMissedRoutines = 0,
    mostConsistentRoutine = 'None yet',
    currentStreak = 0,
    longestStreak = 0,
    lastSevenDays = []
  } = progress || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Productivity & Progress</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Real-time analytics and habit consistency calculated from your database completions
        </p>
      </div>

      {/* Streak and Consistency Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900/80 to-slate-900 border border-amber-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Current Streak</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-400 animate-bounce" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{currentStreak}</span>
            <span className="text-sm font-semibold text-amber-300">Days Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Consecutive days completing your routines</p>
        </div>

        {/* Longest Streak */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-brand-500/20 via-slate-900/80 to-slate-900 border border-brand-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Best Record</span>
            <div className="w-9 h-9 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{longestStreak}</span>
            <span className="text-sm font-semibold text-brand-300">Days Max Streak</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Your historical peak routine discipline</p>
        </div>

        {/* Most Consistent Routine */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-slate-900/80 to-slate-900 border border-emerald-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Top Habit</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <h4 className="text-base font-extrabold text-white truncate max-w-full">
            {mostConsistentRoutine}
          </h4>
          <p className="text-xs text-slate-400 mt-2">Highest overall completion rate across all days</p>
        </div>
      </div>

      {/* Completion Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Weekly Success Rate</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-400 mt-2">
            {weeklyCompletionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Average over 7 days</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Today's Progress</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
            {dailyCompletionPercentage}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Completion rate today</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Total Completed</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
            <span>{totalCompletedRoutines}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Finished on schedule</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Total Missed / Skipped</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-2 flex items-center gap-2">
            <span>{totalMissedRoutines}</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Incomplete or skipped</p>
        </div>
      </div>

      {/* 7-Day Visual Productivity Chart */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span>7-Day Routine Performance Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">Completion percentage by day</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-brand-500"></span> Completed
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-slate-800"></span> Incomplete
            </span>
          </div>
        </div>

        {/* Bar Chart Area */}
        <div className="grid grid-cols-7 gap-3 sm:gap-4 h-56 items-end pt-6 pb-2 border-b border-slate-800">
          {lastSevenDays.map((day, idx) => {
            const heightPct = Math.max(day.percentage, 5);
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                {/* Tooltip on hover */}
                <span className="text-xs font-mono font-bold text-slate-300 opacity-80 group-hover:opacity-100 group-hover:text-brand-300 transition-opacity">
                  {Math.round(day.percentage)}%
                </span>
                <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-xl overflow-hidden flex flex-col justify-end h-40 border border-slate-700/40">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 via-indigo-500 to-emerald-400 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-slate-200">{day.dayName}</span>
                  <span className="block text-[10px] text-slate-500">{day.completed}/{day.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
