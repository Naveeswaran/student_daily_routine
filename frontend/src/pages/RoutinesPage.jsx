import React, { useState, useEffect } from 'react';
import { routineAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Clock, 
  Repeat, 
  AlertCircle,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = ['All', 'Study', 'Health', 'College', 'Coding', 'Personal', 'Leisure'];

export const RoutinesPage = ({ onOpenAddModal, onEditRoutine }) => {
  const { showToast } = useToast();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchRoutines = async () => {
    try {
      const data = await routineAPI.getAll();
      setRoutines(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleComplete = async (id) => {
    try {
      await routineAPI.markComplete(id);
      showToast('Routine marked as completed!');
      fetchRoutines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSkip = async (id) => {
    try {
      await routineAPI.markSkip(id);
      showToast('Routine marked as skipped', 'info');
      fetchRoutines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReset = async (id) => {
    try {
      await routineAPI.markPending(id);
      showToast('Routine reset to pending');
      fetchRoutines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) return;
    try {
      await routineAPI.delete(id);
      showToast('Routine deleted successfully');
      fetchRoutines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredRoutines = routines.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || r.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getPriorityBadge = (p) => {
    switch (p?.toLowerCase()) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'low':
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'DUE_SOON':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse';
      case 'OVERDUE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'SKIPPED':
        return 'bg-slate-700/40 text-slate-400 border-slate-700/60';
      case 'UPCOMING':
      default:
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">My Daily Routines</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Create, view, manage, and update your personal schedules
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-brand-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routines by title or keywords..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="DUE_SOON">Due Soon</option>
              <option value="OVERDUE">Overdue</option>
              <option value="SKIPPED">Skipped</option>
            </select>
          </div>
        </div>

        {/* Categories chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-200">No routines match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing your filters or create a new routine.</p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Routine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map(routine => {
            const isCompleted = routine.status === 'COMPLETED';
            const isSkipped = routine.status === 'SKIPPED';
            return (
              <div
                key={routine.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 backdrop-blur-md ${
                  isCompleted
                    ? 'bg-slate-900/40 border-emerald-950/40'
                    : routine.status === 'OVERDUE'
                    ? 'bg-rose-950/15 border-rose-900/30 hover:border-rose-800/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {routine.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getPriorityBadge(routine.priority)}`}>
                        {routine.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(routine.status)}`}>
                        {routine.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`font-bold text-base ${isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {routine.title}
                  </h3>
                  {routine.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {routine.description}
                    </p>
                  )}

                  {/* Schedule Details */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      <span className="font-mono text-slate-300 font-medium">
                        {routine.startTime} {routine.endTime ? `- ${routine.endTime}` : ''}
                      </span>
                      {routine.reminderTimeMinutes > 0 && (
                        <span className="text-[10px] text-slate-500">
                          ({routine.reminderTimeMinutes}m reminder)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Repeat className="w-3.5 h-3.5 text-slate-500" />
                      <span className="capitalize">{routine.repeatType}</span>
                      {routine.repeatType === 'weekdays' && routine.recurringDays?.length > 0 && (
                        <span className="text-[10px] text-slate-500 truncate">
                          ({routine.recurringDays.map(d => d.slice(0, 3)).join(', ')})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {!isCompleted ? (
                      <button
                        onClick={() => handleComplete(routine.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReset(routine.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Reset
                      </button>
                    )}

                    {!isSkipped && !isCompleted && (
                      <button
                        onClick={() => handleSkip(routine.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
                        title="Skip"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditRoutine(routine)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
