import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle } from 'lucide-react';

export const ExitConfirmModal = ({ show, onStay, onLeave }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onStay} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-sm bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-yellow-500/15 shrink-0">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Are you sure?</h3>
            <p className="text-[11px] text-white/50 font-medium mt-1 leading-relaxed">
              You'll lose your progress on this lesson if you leave. Your answers so far are saved.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onStay}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] border border-white/10"
          >
            Stay
          </button>
          <button
            onClick={onLeave}
            className="flex-1 py-3 bg-yellow-500 text-black hover:bg-yellow-400 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97]"
          >
            Leave
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const ReportModal = ({ show, reason, details, onReasonChange, onDetailsChange, onSubmit, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-sm bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Report a Problem</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-white/40 font-medium">What's wrong with this question?</p>
        <div className="space-y-1.5">
          {['Wrong answer', 'Typo', 'Confusing question', 'Other'].map(r => (
            <button
              key={r}
              onClick={() => onReasonChange(r)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                reason === r
                  ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={details}
          onChange={e => onDetailsChange(e.target.value)}
          placeholder="Optional details..."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 resize-none outline-none focus:border-primary/40 transition-colors"
        />
        <button
          onClick={onSubmit}
          disabled={!reason}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] ${
            reason
              ? 'bg-yellow-500 text-black hover:bg-yellow-400'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          Send via WhatsApp
        </button>
      </motion.div>
    </div>
  );
};
