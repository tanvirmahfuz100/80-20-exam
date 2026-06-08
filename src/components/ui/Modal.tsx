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
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${maxWidth} bg-surface rounded-t-2xl sm:rounded-2xl p-5 space-y-4 ${className}`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text">{title}</h3>
                {showClose && (
                  <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1">
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
