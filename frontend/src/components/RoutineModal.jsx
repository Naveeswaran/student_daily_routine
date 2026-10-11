import React, { useState, useEffect } from 'react';
import { routineAPI } from '../services/api';
import { useToast } from './Toast';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Study', 'Health', 'College', 'Coding', 'Personal', 'Leisure'];
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-400 bg-slate-800' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400 bg-amber-500/10' },
  { value: 'high', label: 'High', color: 'text-rose-400 bg-rose-500/10' },
];
const WEEKDAYS = [
  { id: 'MONDAY', label: 'Mon' },
  { id: 'TUESDAY', label: 'Tue' },
  { id: 'WEDNESDAY', label: 'Wed' },
  { id: 'THURSDAY', label: 'Thu' },
  { id: 'FRIDAY', label: 'Fri' },
  { id: 'SATURDAY', label: 'Sat' },
  { id: 'SUNDAY', label: 'Sun' },
];

export const RoutineModal = ({ isOpen, onClose, routineToEdit, onSaved }) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Study');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [repeatType, setRepeatType] = useState('daily');
  const [priority, setPriority] = useState('medium');
  const [reminderTimeMinutes, setReminderTimeMinutes] = useState(0);
  const [recurringDays, setRecurringDays] = useState(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (routineToEdit) {
      setTitle(routineToEdit.title || '');
      setDescription(routineToEdit.description || '');
      setCategory(routineToEdit.category || 'Study');
      setStartTime(routineToEdit.startTime || '09:00');
      setEndTime(routineToEdit.endTime || '');
      setStartDate(routineToEdit.startDate || new Date().toISOString().split('T')[0]);
      setRepeatType(routineToEdit.repeatType || 'daily');
      setPriority(routineToEdit.priority || 'medium');
      setReminderTimeMinutes(routineToEdit.reminderTimeMinutes || 0);
      setRecurringDays(routineToEdit.recurringDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Study');
      setStartTime('09:00');
      setEndTime('10:00');
      setStartDate(new Date().toISOString().split('T')[0]);
      setRepeatType('daily');
      setPriority('medium');
      setReminderTimeMinutes(0);
      setRecurringDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
    }
    setErrors({});
  }, [routineToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayId) => {
    setRecurringDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!startTime) errs.startTime = 'Start time is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (repeatType === 'weekdays' && recurringDays.length === 0) {
      errs.recurringDays = 'Please select at least one day';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      startTime,
      endTime: endTime || null,
      startDate,
      repeatType,
      priority,
      reminderTimeMinutes: parseInt(reminderTimeMinutes, 10),
      recurringDays: repeatType === 'weekdays' ? recurringDays : []
    };

    try {
      if (routineToEdit) {
        await routineAPI.update(routineToEdit.id, payload);
        showToast('Routine updated successfully!');
      } else {
        await routineAPI.create(payload);
        showToast('Routine created successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {routineToEdit ? 'Edit Routine' : 'Add New Daily Routine'}
            </h3>
            <p className="text-xs text-slate-400">Set schedule and automatic reminder notifications</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Routine Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Study Java & DSA"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.title ? 'border-rose-500' : 'border-slate-700'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Time *</label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.startTime ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Time (Optional)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Start Date & Repeat Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Scheduled Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Repeat Type</label>
              <select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="once">Once (Date only)</option>
                <option value="daily">Daily (Every day)</option>
                <option value="weekdays">Selected Weekdays</option>
              </select>
            </div>
          </div>

          {/* Weekday selection if repeatType is 'weekdays' */}
          {repeatType === 'weekdays' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Days</label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map(d => {
                  const isSelected = recurringDays.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {errors.recurringDays && (
                <p className="text-xs text-rose-400 mt-1">{errors.recurringDays}</p>
              )}
            </div>
          )}

          {/* Reminder Offset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notification Reminder
            </label>
            <select
              value={reminderTimeMinutes}
              onChange={(e) => setReminderTimeMinutes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value={0}>At scheduled start time</option>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Focus on Binary Search Trees and DP problems."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : routineToEdit ? 'Update Routine' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
