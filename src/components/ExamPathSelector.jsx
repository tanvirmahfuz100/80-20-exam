import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronLeft, ArrowRight } from 'lucide-react';
import {
  EXAMS, GROUPS, CLASSES,
  EXAM_LABELS, GROUP_LABELS,
  requiresGroup, requiresClass,
} from '../config/examPaths';

const pageVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, type: 'spring', stiffness: 260, damping: 24 },
  }),
};

const examDescriptions = {
  SSC: 'মাধ্যমিক',
  HSC: 'উচ্চ মাধ্যমিক',
  BCS: 'বিসিএস প্রস্তুতি',
  IBA: 'আইবিএ এডমিশন',
  'Class1-8': 'প্রাথমিক ও মাধ্যমিক',
};

const groupSubtitle = {
  Science: 'বিজ্ঞান বিভাগ',
  Business: 'বাণিজ্য বিভাগ',
  Arts: 'মানবিক বিভাগ',
};

export default function ExamPathSelector({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [selectedExam, setSelectedExam] = useState(null);

  const advanceStep = (exam) => {
    if (requiresGroup(exam)) return 1;
    if (requiresClass(exam)) return 1;
    return null; // done
  };

  const handleExamPick = (exam) => {
    setSelectedExam(exam);
    const next = advanceStep(exam);
    if (next !== null) {
      setStep(next);
    } else {
      onComplete({ exam, group: null, class: null, medium: null });
    }
  };

  const handleGroupPick = (group) => {
    onComplete({ exam: selectedExam, group, class: null, medium: null });
  };

  const handleClassPick = (cls) => {
    onComplete({ exam: selectedExam, group: null, class: cls, medium: null });
  };

  const handleBack = () => {
    if (step === 1) {
      setSelectedExam(null);
      setStep(0);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col safe-top safe-bottom"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border shrink-0">
        {step > 0 ? (
          <button onClick={handleBack} className="p-2 -ml-2 text-text-muted hover:text-text transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex-1 text-center">
          <span className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim">
            {step === 0 ? 'পরীক্ষা নির্বাচন' : selectedExam && requiresGroup(selectedExam) ? 'গ্রুপ নির্বাচন' : 'শ্রেণী নির্বাচন'}
          </span>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-2xs font-bold text-text-dim hover:text-text transition-colors">
            বাতিল
          </button>
        )}
        {!onCancel && <div className="w-14" />}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="exam"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2">
                  তোমার পরীক্ষা বাছাই করো
                </h1>
                <p className="text-sm text-text-muted font-medium">
                  সাবজেক্ট অনুযায়ী প্রাক্টিস করতে একটি পরীক্ষা নির্বাচন করো
                </p>
              </div>
              <div className="space-y-3">
                {EXAMS.map((exam, i) => (
                  <motion.button
                    key={exam}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleExamPick(exam)}
                    className="w-full flex items-center gap-4 rounded-2xl border border bg-surface p-5 text-left transition-all hover:border-primary/40 hover:bg-surface-hover"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-black text-text">{EXAM_LABELS[exam]}</span>
                      <p className="text-2xs font-medium text-text-dim mt-0.5">{examDescriptions[exam] || ''}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-dim shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : step === 1 && requiresGroup(selectedExam) ? (
            <motion.div
              key="group"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2">
                  {EXAM_LABELS[selectedExam]} · গ্রুপ নির্বাচন করো
                </h1>
                <p className="text-sm text-text-muted font-medium">তোমার গ্রুপ অনুযায়ী সাবজেক্ট সেট করো</p>
              </div>
              <div className="space-y-3">
                {GROUPS.map((group, i) => (
                  <motion.button
                    key={group}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleGroupPick(group)}
                    className="w-full flex items-center gap-4 rounded-2xl border border bg-surface p-5 text-left transition-all hover:border-primary/40 hover:bg-surface-hover"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-black text-text">{GROUP_LABELS[group]}</span>
                      <p className="text-2xs font-medium text-text-dim mt-0.5">{groupSubtitle[group]}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-dim shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="class"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2">তোমার শ্রেণী নির্বাচন করো</h1>
                <p className="text-sm text-text-muted font-medium">তুমি কোন শ্রেণীতে পড়ো?</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {CLASSES.map((cls, i) => (
                  <motion.button
                    key={cls}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClassPick(cls)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border bg-surface py-5 transition-all hover:border-primary/40 hover:bg-surface-hover"
                  >
                    <span className="text-lg font-black text-text">{cls}</span>
                    <span className="text-3xs font-medium text-text-dim">শ্রেণী</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-4 border-t border shrink-0">
        <p className="text-center text-3xs font-medium text-text-dim">
          {step === 0 && 'বিসিএস ও আইবিএ এর জন্য গ্রুপ লাগবে না'}
          {step === 1 && requiresGroup(selectedExam) && 'তোমার গ্রুপ অনুযায়ী সাবজেক্ট দেখানো হবে'}
          {step === 1 && requiresClass(selectedExam) && 'তোমার শ্রেণী অনুযায়ী কন্টেন্ট সেট হবে'}
        </p>
      </div>
    </motion.div>
  );
}
