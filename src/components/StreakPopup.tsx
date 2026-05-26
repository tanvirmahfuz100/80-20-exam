import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(d);
  }
  return days;
}

function getDateStr(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function isToday(year, month, day) {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

export default function StreakPopup({ isOpen, onClose, streak, streakHistory, onViewDetails }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const checkedInSet = new Set(
    streakHistory.filter(h => h.checkedIn).map(h => h.date)
  );

  const grid = getMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">Streak</h3>
              <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-orange-500">{streak}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted bn-text">দিনের স্ট্রিক</p>
              </div>
            </div>

            <div className="bg-background border rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-1 text-text-muted hover:text-text transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-text">{monthLabel}</span>
                <button onClick={nextMonth} className="p-1 text-text-muted hover:text-text transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-[9px] font-bold text-text-muted uppercase tracking-wider py-1">
                    {day}
                  </div>
                ))}
                {grid.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  const dateStr = getDateStr(viewYear, viewMonth, day);
                  const checked = checkedInSet.has(dateStr);
                  const today = isToday(viewYear, viewMonth, day);
                  return (
                    <div
                      key={dateStr}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${
                        checked
                          ? 'bg-primary text-white'
                          : today
                            ? 'border border-dashed border-text-muted text-text-dim'
                            : 'text-text-dim'
                      }`}
                    >
                      {checked ? <Check className="w-3 h-3" /> : day}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onViewDetails('/profile')}
              className="w-full py-3 bg-surface-alt hover:bg-surface-hover text-text rounded-xl font-bold text-xs transition-all active:scale-[0.97] border"
            >
              View in Details
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
