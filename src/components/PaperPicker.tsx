import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';

const paperOptions = {
  ssc: {
    'বাংলা': [
      { id: 'bangla_1st', label: 'বাংলা ১ম পত্র', desc: 'Bangla 1st Paper' },
      { id: 'bangla_2nd', label: 'বাংলা ২য় পত্র', desc: 'Bangla 2nd Paper' },
    ],
  },
};

const PaperPicker = ({ isOpen, onClose, onSelect, exam, subjectName }) => {
  if (!isOpen) return null;
  const papers = paperOptions[exam]?.[subjectName] || [];
  if (papers.length === 0) {
    onClose();
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            className="relative w-full max-w-sm bg-surface border rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-surface-alt rounded-xl text-text-muted hover:text-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <h2 className="text-xl font-black text-text tracking-tighter">{subjectName}</h2>
              <p className="text-sm text-text-muted font-medium">কোন পত্রে প্রাক্টিস করতে চাও?</p>
            </div>

            <div className="space-y-3">
              {papers.map((paper) => (
                <motion.button
                  key={paper.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect(paper.id, paper.label)}
                  className="w-full flex items-center gap-4 p-4 bg-surface-alt rounded-2xl border hover:border-primary/50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-text">{paper.label}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{paper.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaperPicker;
