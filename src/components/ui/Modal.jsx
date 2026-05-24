import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  maxWidth = 'sm:max-w-sm',
  showClose = true,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${maxWidth} bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl ${className}`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
                {showClose && (
                  <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
