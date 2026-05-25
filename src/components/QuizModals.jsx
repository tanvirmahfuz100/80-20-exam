import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, Flag } from 'lucide-react';

export const ExitConfirmModal = ({ show, onStay, onLeave }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onStay} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cardinal/10 shrink-0">
            <AlertTriangle className="w-5 h-5 text-cardinal" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-charcoal">Are you sure?</h3>
            <p className="text-xs text-hare font-medium mt-1 leading-relaxed">
              You'll lose your progress on this lesson if you leave. Your answers so far are saved.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onStay}
            className="flex-1 py-3 bg-eel hover:bg-wolf text-charcoal rounded-full font-bold text-sm transition-all active:scale-[0.97] border border-wolf"
          >
            Stay
          </button>
          <button
            onClick={onLeave}
            className="flex-1 py-3 bg-cardinal text-white hover:bg-cardinal-dark rounded-full font-bold text-sm transition-all active:scale-[0.97]"
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Flag className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-charcoal">Report a Problem</h3>
            <p className="text-xs text-hare font-medium mt-1">Tell us what's wrong with this question.</p>
          </div>
          <button onClick={onClose} className="text-hare hover:text-charcoal p-1">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <select
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="duo-input"
          >
            <option value="">Select a reason...</option>
            <option value="wrong_answer">Wrong answer</option>
            <option value="typo">Typo / Grammar error</option>
            <option value="duplicate">Duplicate question</option>
            <option value="confusing">Confusing explanation</option>
            <option value="other">Other</option>
          </select>
          <textarea
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="More details..."
            rows={3}
            className="duo-input resize-none"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={!reason}
          className="w-full py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-hover disabled:opacity-50 transition-all active:scale-[0.97]"
        >
          Submit Report
        </button>
      </motion.div>
    </div>
  );
};
