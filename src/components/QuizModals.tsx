import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, Flag, ChevronDown } from 'lucide-react';

interface ExitConfirmModalProps {
  show: boolean;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  message?: string;
  stayLabel?: string;
  leaveLabel?: string;
}

export const ExitConfirmModal = ({ show, onStay, onLeave, title, message, stayLabel, leaveLabel }: ExitConfirmModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onStay} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cardinal/10 shrink-0">
            <AlertTriangle className="w-5 h-5 text-cardinal" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-text">{title || 'Are you sure?'}</h3>
            <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
              {message || "You'll lose your progress on this lesson if you leave. Your answers so far are saved."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onStay}
            className="flex-1 py-3 bg-surface-alt hover:bg-surface-hover text-text rounded-full font-bold text-sm transition-all active:scale-[0.97] border"
          >
            {stayLabel || 'Stay'}
          </button>
          <button
            onClick={onLeave}
            className="flex-1 py-3 bg-cardinal text-white hover:bg-cardinal-dark rounded-full font-bold text-sm transition-all active:scale-[0.97]"
          >
            {leaveLabel || 'Leave'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const ReportModal = ({ show, reason, details, onReasonChange, onDetailsChange, onSubmit, onClose }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dropdownOpen]);

  if (!show) return null;

  const reasons = [
    { value: '', label: 'Select a reason...' },
    { value: 'wrong_answer', label: 'Wrong answer' },
    { value: 'typo', label: 'Typo / Grammar error' },
    { value: 'duplicate', label: 'Duplicate question' },
    { value: 'confusing', label: 'Confusing explanation' },
    { value: 'other', label: 'Other' },
  ];

  const selectedLabel = reasons.find(r => r.value === reason)?.label || 'Select a reason...';

  return (
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
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Flag className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-text">Report a Problem</h3>
            <p className="text-xs text-text-muted font-medium mt-1">Tell us what's wrong with this question.</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-surface text-text placeholder:text-hare text-base font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <span className={reason ? 'text-text' : 'text-hare'}>{selectedLabel}</span>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-surface border rounded-xl shadow-lg overflow-y-auto max-h-48">
                {reasons.slice(1).map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { onReasonChange(r.value); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-hover ${
                      reason === r.value ? 'bg-primary/10 text-primary' : 'text-text'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
