import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Clock, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';

const STAGE_LABELS = [
  { day: 'Day 1', label: 'Today' },
  { day: 'Day 3', label: '3 Days' },
  { day: 'Day 7', label: '7 Days' },
  { day: 'Day 14', label: '14 Days' },
  { day: 'Day 30', label: '30 Days' },
];

function truncate(text, len = 50) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
}

export default function StarPopup({ isOpen, onClose, mistakeGroups, recentMistakes, onViewDetails }) {
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
            className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">Star Rewards</h3>
              <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-surface border rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center">
                <Star className="w-6 h-6 text-text-muted" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted bn-text">স্পেসড রিভিশন</p>
                <p className="text-[11px] font-medium text-text-muted mt-0.5">আজকে থেকে ৩০ দিন পর্যন্ত</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {(mistakeGroups || []).slice(0, 5).map((group, idx) => {
                const isDue = group.dueNow > 0;
                const pct = group.total > 0 ? Math.round((group.dueNow / group.total) * 100) : 0;
                return (
                  <div
                    key={group.stage}
                    className={`rounded-xl p-2.5 text-center border transition-all ${
                      isDue
                        ? 'bg-surface-hover border'
                        : 'bg-surface border'
                    }`}
                  >
                    <p className={`text-lg font-black ${isDue ? 'text-text' : 'text-text-dim'}`}>
                      {group.dueNow}
                    </p>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${
                      isDue ? 'text-text-muted/70' : 'text-text-dim/70'
                    }`}>
                      {STAGE_LABELS[idx]?.day || `Day ${group.stage}`}
                    </p>
                    <p className="text-[7px] text-text-dim mt-0.5">/ {group.total}</p>
                  </div>
                );
              })}
            </div>

            {recentMistakes && recentMistakes.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted bn-text">সর্বশেষ স্টার পাওয়া প্রশ্ন</p>
                {recentMistakes.slice(0, 3).map((m, idx) => (
                  <div key={m.id || idx} className="flex items-start gap-2.5 bg-background border rounded-xl p-3">
                    <Star className="w-3.5 h-3.5 text-text-dim shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-text leading-relaxed line-clamp-2">
                        {truncate(m.question?.text || m.question?.question || 'Unknown question', 60)}
                      </p>
                      <p className="text-[9px] text-text-dim font-medium mt-1">
                        {STAGE_LABELS[m.stage]?.label || `Stage ${m.stage}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onViewDetails('/stars')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface-alt hover:bg-surface-hover text-text rounded-xl font-bold text-xs transition-all active:scale-[0.97] border"
            >
              View All in Stars
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
