import { motion } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-sm bg-surface border rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${danger ? 'bg-yellow-500/15' : 'bg-primary/15'}`}>
            {danger
              ? <AlertTriangle className="w-5 h-5 text-yellow-400" />
              : <Check className="w-5 h-5 text-primary" />
            }
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-text uppercase tracking-wider">{title}</h3>
            <p className="text-[11px] text-text-muted font-medium mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-surface-alt hover:bg-surface-alt text-text rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] border"
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] ${
              danger
                ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
