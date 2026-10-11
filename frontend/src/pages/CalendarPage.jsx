import React, { useState, useEffect } from 'react';
import { routineAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const CalendarPage = () => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [dateRoutines, setDateRoutines] = useState([]);
  const [weeklyRoutines, setWeeklyRoutines] = useState({});
  const [loading, setLoading] = useState(true);

  const formattedSelectedDate = selectedDate.toISOString().split('T')[0];

  const fetchDailyRoutines = async (dateStr) => {
    setLoading(true);
    try {
      const data = await routineAPI.getByDate(dateStr);
      setDateRoutines(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = (baseDate) => {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const fetchWeeklyRoutines = async () => {
    setLoading(true);
    try {
      const days = getWeekDays(selectedDate);
      const routinesMap = {};
      await Promise.all(
        days.map(async (d) => {
          const dateStr = d.toISOString().split('T')[0];
          const list = await routineAPI.getByDate(dateStr);
          routinesMap[dateStr] = list || [];
        })
      );
      setWeeklyRoutines(routinesMap);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDailyRoutines(formattedSelectedDate);
    } else {
      fetchWeeklyRoutines();
    }
  }, [formattedSelectedDate, viewMode]);

  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'daily') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setSelectedDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'daily') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleComplete = async (routineId, dateStr) => {
    try {
      await routineAPI.markComplete(routineId, dateStr);
      showToast('Marked as completed!');
      if (viewMode === 'daily') fetchDailyRoutines(dateStr);
      else fetchWeeklyRoutines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSkip = async (routineId, dateStr) => {
    try {
      await routineAPI.markSkip(routineId, dateStr);
      showToast('Marked as skipped', 'info');
      if (viewMode === 'daily') fetchDailyRoutines(dateStr);
      else fetchWeeklyRoutines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const weekDays = getWeekDays(selectedDate);

  const getStatusBadge = (s) => {
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'DUE_SOON':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'OVERDUE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'SKIPPED':
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
      default:
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Calendar & Schedule</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View your routine schedule by date and inspect upcoming recurring days
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'daily' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Day View
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'weekly' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Week View
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-400" />
          {viewMode === 'daily' ? (
            <span>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          ) : (
            <span>
              Week of {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        <div>
          <input
            type="date"
            value={formattedSelectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(new Date(e.target.value));
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : viewMode === 'daily' ? (
        /* Daily View */
        <div className="space-y-3">
          {dateRoutines.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
              <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-200">No routines on this date</h3>
              <p className="text-xs text-slate-500 mt-1">Enjoy your day or navigate to another scheduled date.</p>
            </div>
          ) : (
            dateRoutines.map(r => (
              <div
                key={r.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  r.status === 'COMPLETED'
                    ? 'bg-slate-900/40 border-emerald-950/40'
                    : r.status === 'OVERDUE'
                    ? 'bg-rose-950/15 border-rose-900/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded">
                      {r.startTime}
                    </span>
                    <h4 className={`text-sm font-bold ${r.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {r.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{r.category}</span>
                    <span>•</span>
                    <span className="capitalize">{r.repeatType}</span>
                    {r.description && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500 italic truncate max-w-md">{r.description}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {r.status !== 'COMPLETED' ? (
                    <button
                      onClick={() => handleComplete(r.id, formattedSelectedDate)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}

                  {r.status !== 'SKIPPED' && r.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleSkip(r.id, formattedSelectedDate)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                      title="Skip"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Weekly View Grid */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((d) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const routines = weeklyRoutines[dateStr] || [];

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-2xl border flex flex-col min-h-[300px] ${
                  isToday
                    ? 'bg-slate-900/90 border-brand-500/50 shadow-lg shadow-brand-500/10'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-bold ${isToday ? 'text-brand-400' : 'text-slate-400'}`}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-sm font-extrabold text-white">
                      {d.toLocaleDateString('en-US', { day: 'numeric' })}
                    </p>
                  </div>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {routines.length === 0 ? (
                    <p className="text-[11px] text-slate-600 text-center py-6">No routines</p>
                  ) : (
                    routines.map(r => (
                      <div
                        key={r.id}
                        className={`p-2 rounded-xl text-[11px] border leading-tight ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-950/20 text-slate-400 border-emerald-900/30'
                            : r.status === 'OVERDUE'
                            ? 'bg-rose-950/20 text-rose-300 border-rose-900/40'
                            : 'bg-slate-800/60 text-slate-200 border-slate-700/60'
                        }`}
                      >
                        <div className="font-semibold truncate">{r.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.startTime}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
