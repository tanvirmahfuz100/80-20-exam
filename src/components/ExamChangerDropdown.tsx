import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ChevronDown, ChevronLeft,
  ShieldCheck, X, ArrowRight, Globe
} from 'lucide-react';
import {
  EXAMS, GROUPS, CLASSES, MEDIA,
  EXAM_LABELS, GROUP_LABELS, MEDIUM_LABELS,
  requiresGroup, requiresClass, requiresMedium,
  getPathLabel,
} from '../config/examPaths';

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

export default function ExamChangerDropdown({ currentExamPath, onExamChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('exam');
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();

  const currentLabel = currentExamPath
    ? getPathLabel(currentExamPath.exam, currentExamPath.group, currentExamPath.class, currentExamPath.medium)
    : '';

  const handleOpen = () => {
    setStep('exam');
    setSelectedExam(null);
    setSelectedGroup(null);
    setSelectedClass(null);
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const finishAndClose = (path) => {
    onExamChange(path);
    handleClose();
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    setSelectedGroup(null);
    setSelectedClass(null);
    if (requiresGroup(exam)) {
      setStep('group');
    } else if (requiresClass(exam)) {
      setStep('class');
    } else if (requiresMedium(exam)) {
      setStep('medium');
    } else {
      finishAndClose({ exam, group: null, class: null, medium: null });
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (requiresMedium(selectedExam)) {
      setStep('medium');
    } else {
      finishAndClose({ exam: selectedExam, group, class: null, medium: null });
    }
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    if (requiresMedium(selectedExam)) {
      setStep('medium');
    } else {
      finishAndClose({ exam: selectedExam, group: null, class: cls, medium: null });
    }
  };

  const handleMediumSelect = (medium) => {
    finishAndClose({
      exam: selectedExam,
      group: selectedGroup,
      class: selectedClass,
      medium,
    });
  };

  const handleBack = () => {
    if (step === 'group' || step === 'class') {
      setStep('exam');
      setSelectedExam(null);
    } else if (step === 'medium') {
      if (requiresGroup(selectedExam)) setStep('group');
      else if (requiresClass(selectedExam)) setStep('class');
      else setStep('exam');
    }
  };

  const isCurrentExam = (exam) => currentExamPath?.exam === exam;

  return (
    <div className="mt-2">
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 w-full px-4 py-2.5 bg-surface border border rounded-xl hover:border-primary/40 transition-all active:scale-[0.98] text-left"
      >
        <GraduationCap className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-sm font-bold text-text min-w-0 truncate">
          {currentLabel}
        </span>
        <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {step !== 'exam' && (
                    <button
                      onClick={handleBack}
                      className="p-1 -ml-1 text-text-muted hover:text-text transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <h2 className="text-sm font-black text-text bn-text">
                    {step === 'exam' && 'পরীক্ষা নির্বাচন করো'}
                    {step === 'group' && 'গ্রুপ নির্বাচন করো'}
                    {step === 'class' && 'শ্রেণী নির্বাচন করো'}
                    {step === 'medium' && 'মিডিয়াম নির্বাচন করো'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 text-text-muted hover:text-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step: Exam selection */}
              {step === 'exam' && (
                <div className="space-y-2">
                  {EXAMS.map((exam) => (
                    <button
                      key={exam}
                      onClick={() => handleExamSelect(exam)}
                      className="w-full flex items-center gap-3 rounded-xl border border bg-surface p-3.5 text-left transition-all hover:border-primary/40 hover:bg-surface-hover active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-black text-text">{EXAM_LABELS[exam]}</span>
                        <p className="text-2xs font-medium text-text-dim mt-0.5">{examDescriptions[exam] || ''}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isCurrentExam(exam) && (
                          <span className="text-2xs font-bold text-text bg-surface px-2 py-0.5 rounded-full bn-text">
                            চলছে
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-text-dim shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Group selection */}
              {step === 'group' && (
                <div className="space-y-2">
                  {GROUPS.map((group) => (
                    <button
                      key={group}
                      onClick={() => handleGroupSelect(group)}
                      className="w-full flex items-center gap-3 rounded-xl border border bg-surface p-3.5 text-left transition-all hover:border-primary/40 hover:bg-surface-hover active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-black text-text">{GROUP_LABELS[group]}</span>
                        <p className="text-2xs font-medium text-text-dim mt-0.5">{groupSubtitle[group]}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-dim shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Class selection */}
              {step === 'class' && (
                <div className="grid grid-cols-4 gap-2">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => handleClassSelect(cls)}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl border border bg-surface py-4 transition-all hover:border-primary/40 hover:bg-surface-hover active:scale-[0.95]"
                    >
                      <span className="text-base font-black text-text">{cls}</span>
                      <span className="text-3xs font-medium text-text-dim bn-text">শ্রেণী</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Medium selection */}
              {step === 'medium' && (
                <div className="space-y-2">
                  {MEDIA.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleMediumSelect(m)}
                      className="w-full flex items-center gap-3 rounded-xl border border bg-surface p-3.5 text-left transition-all hover:border-primary/40 hover:bg-surface-hover active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-black text-text">{MEDIUM_LABELS[m]}</span>
                        <p className="text-2xs font-medium text-text-dim mt-0.5 bn-text">
                          {m === 'Bangla' ? 'বাংলা মিডিয়াম' : 'ইংলিশ মিডিয়াম'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-dim shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Reassurance footer */}
              <div className="mt-5 pt-4 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-text shrink-0" />
                  <span className="text-xs font-medium text-text-muted leading-relaxed bn-text">
                    পরীক্ষা পরিবর্তন করলেও তোমার সব অগ্রগতি (এক্সপি, স্টার, স্ট্রিক) ঠিক থাকবে! 🎉
                  </span>
                </div>
                <button
                  onClick={() => { handleClose(); navigate('/analytics'); }}
                  className="text-xs font-bold text-primary hover:text-primary-hover transition-colors bn-text"
                >
                  প্রোগ্রেস দেখুন →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
