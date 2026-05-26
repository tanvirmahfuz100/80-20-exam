import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronLeft, ChevronRight, ArrowRight, BookOpen, Globe, User, Sun, Moon } from 'lucide-react';
import {
  EXAMS, GROUPS, CLASSES, MEDIA,
  EXAM_LABELS, GROUP_LABELS, MEDIUM_LABELS,
  requiresGroup, requiresClass, requiresMedium,
} from '../config/examPaths';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/localApi';

const pageVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 24 },
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

const stepTitles = {
  0: 'পরীক্ষা নির্বাচন',
  1: 'গ্রুপ / শ্রেণী নির্বাচন',
  2: 'মিডিয়াম নির্বাচন',
  3: 'নাম দিন',
};

const THEME_CHOSEN_KEY = 'fireman-mode-chosen';

export default function ExamOnboarding({ onComplete }) {
  const { user, updateProfileFields } = useAuth();
  const { theme, setTheme } = useTheme();
  const [themeChosen, setThemeChosen] = useState(() => {
    try { return !!localStorage.getItem(THEME_CHOSEN_KEY); } catch { return false; }
  });
  const [step, setStep] = useState(0);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [name, setName] = useState(user?.user_metadata?.username || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!themeChosen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [themeChosen]);

  const handleThemePick = (mode) => {
    setTheme(mode);
    try { localStorage.setItem(THEME_CHOSEN_KEY, '1'); } catch {}
    setThemeChosen(true);
  };

  // Determine next step number based on current step + exam
  const advanceStep = (exam) => {
    if (step === 0) {
      if (requiresGroup(exam)) setStep(1);
      else if (requiresClass(exam)) setStep(1);
      else if (requiresMedium(exam)) setStep(2);
      else setStep(3);
    } else if (step === 1) {
      if (requiresMedium(exam)) setStep(2);
      else setStep(3);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleExamPick = (exam) => {
    setSelectedExam(exam);
    advanceStep(exam);
  };

  const handleGroupPick = (group) => {
    setSelectedGroup(group);
    advanceStep(selectedExam);
  };

  const handleClassPick = (cls) => {
    setSelectedClass(cls);
    advanceStep(selectedExam);
  };

  const handleMediumPick = (medium) => {
    setSelectedMedium(medium);
    advanceStep(selectedExam);
  };

  const handleFinish = async () => {
    setSaving(true);
    const displayName = name.trim() || 'Student';

    // Save exam path to localStorage
    const path = { exam: selectedExam, group: selectedGroup, class: selectedClass, medium: selectedMedium };
    localStorage.setItem('user_exam_path', JSON.stringify(path));
    localStorage.setItem('user_name', displayName);

    // If logged in, also persist to Firebase profile
    if (user?.id) {
      updateProfileFields({
        username: displayName,
        target_exams: [selectedExam],
        question_version: selectedMedium?.toLowerCase() || 'bangla',
      });
      await api.updateProfile(user.id, {
        username: displayName,
        target_exams: [selectedExam],
        question_version: selectedMedium?.toLowerCase() || 'bangla',
      });
    }

    setSaving(false);
    onComplete(path);
  };

  const handleBack = () => {
    if (step === 1) {
      setSelectedExam(null);
      setStep(0);
    } else if (step === 2) {
      // Go back to group or class step depending on exam
      if (requiresGroup(selectedExam) || requiresClass(selectedExam)) {
        setStep(1);
      } else {
        setStep(0);
      }
    } else if (step === 3) {
      if (requiresMedium(selectedExam)) setStep(2);
      else if (requiresGroup(selectedExam) || requiresClass(selectedExam)) setStep(1);
      else setStep(0);
    }
  };

  const handleContinue = () => {
    advanceStep(selectedExam);
  };

  const showBack = step > 0;
  const canProceed = {
    0: selectedExam !== null,
    1: requiresGroup(selectedExam) ? selectedGroup !== null : selectedClass !== null,
    2: selectedMedium !== null,
    3: name.trim().length > 0,
  };

  if (!themeChosen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-background flex flex-col safe-top safe-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
          <div className="min-h-full flex items-center justify-center px-4 md:px-6">
          <div className="w-full max-w-2xl text-center space-y-4 md:space-y-8 py-4 md:py-0">
            <div className="space-y-1 md:space-y-2">
              <h2 className="text-lg md:text-3xl font-black tracking-tighter text-text bn-text">তোমার মোড বেছে নাও</h2>
              <p className="text-text-muted text-xs md:text-sm font-medium">প্রত্যেকটা অপশন দেখো — যেটা ভালো লাগে সেটা বাছাই করো</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
              {/* Light mode card */}
              <button
                onClick={() => handleThemePick('light')}
                className="group relative flex flex-col rounded-2xl overflow-hidden border-2 border-gray-200 bg-white text-left transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <div className="px-3 md:px-4 pt-3 pb-2 md:pt-4 md:pb-3 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Sun className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                    </div>
                    <span className="text-xs md:text-sm font-black text-gray-800">লাইট মোড</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-2 md:p-3 space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] md:text-[10px] font-black text-gray-600">🔥 ফায়ারম্যান</span>
                      <span className="text-[7px] md:text-[8px] text-gray-400">প্রোফাইল</span>
                    </div>
                    <div>
                      <p className="text-[11px] md:text-xs font-black text-gray-800">আজকের কুইজ</p>
                      <p className="text-[9px] md:text-[10px] text-gray-500 font-medium">৫টি প্রশ্ন</p>
                    </div>
                    <div className="bg-gray-900 text-white text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-lg py-1 md:py-1.5 text-center bn-text">শুরু করো</div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 md:pt-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-gray-300" />
                        <div className="w-1 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-gray-300" />
                        <div className="w-1 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-gray-300" />
                      </div>
                      <span className="text-[7px] md:text-[8px] text-gray-400 font-medium">সাবজেক্ট</span>
                    </div>
                  </div>
                  <div className="flex gap-1 md:gap-1.5 flex-wrap">
                    <span className="text-[7px] md:text-[8px] px-1.5 md:px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">সাদা ব্যাকগ্রাউন্ড</span>
                    <span className="text-[7px] md:text-[8px] px-1.5 md:px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">গাঢ় টেক্সট</span>
                  </div>
                </div>
              </button>

              {/* Dark mode card */}
              <button
                onClick={() => handleThemePick('dark')}
                className="group relative flex flex-col rounded-2xl overflow-hidden border-2 border-gray-800 bg-gray-950 text-left transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <div className="relative px-3 md:px-4 pt-3 pb-2 md:pt-4 md:pb-3 space-y-2 md:space-y-3">
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-primary text-white text-[7px] md:text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Recommended
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center">
                      <Moon className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />
                    </div>
                    <span className="text-xs md:text-sm font-black text-white">ডার্ক মোড</span>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-2 md:p-3 space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] md:text-[10px] font-black text-gray-300">🔥 ফায়ারম্যান</span>
                      <span className="text-[7px] md:text-[8px] text-gray-500">প্রোফাইল</span>
                    </div>
                    <div>
                      <p className="text-[11px] md:text-xs font-black text-white">আজকের কুইজ</p>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-medium">৫টি প্রশ্ন</p>
                    </div>
                    <div className="bg-white text-gray-900 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-lg py-1 md:py-1.5 text-center bn-text">শুরু করো</div>
                    <div className="flex items-center justify-between border-t border-gray-800 pt-1.5 md:pt-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-gray-600" />
                        <div className="w-1 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-gray-600" />
                        <div className="w-1 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-gray-600" />
                      </div>
                      <span className="text-[7px] md:text-[8px] text-gray-500 font-medium">সাবজেক্ট</span>
                    </div>
                  </div>
                  <div className="flex gap-1 md:gap-1.5 flex-wrap">
                    <span className="text-[7px] md:text-[8px] px-1.5 md:px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-medium">কালো ব্যাকগ্রাউন্ড</span>
                    <span className="text-[7px] md:text-[8px] px-1.5 md:px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-medium">সাদা টেক্সট</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col safe-top safe-bottom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-4 border-b border shrink-0">
        <span className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim">
          {stepTitles[step]}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Exam Selection */}
          {step === 0 && (
            <motion.div
              key="exam"
              variants={pageVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2 bn-text">
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
                      <p className="text-2xs font-medium text-text-dim mt-0.5">{examDescriptions[exam]}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-dim shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Group Selection (SSC/HSC) or Class Selection (Class1-8) */}
          {step === 1 && requiresGroup(selectedExam) && (
            <motion.div
              key="group"
              variants={pageVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2 bn-text">
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
                    initial="hidden" animate="visible"
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
          )}

          {step === 1 && requiresClass(selectedExam) && (
            <motion.div
              key="class"
              variants={pageVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2 bn-text">
                  তোমার শ্রেণী নির্বাচন করো
                </h1>
                <p className="text-sm text-text-muted font-medium">তুমি কোন শ্রেণীতে পড়ো?</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {CLASSES.map((cls, i) => (
                  <motion.button
                    key={cls}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden" animate="visible"
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

          {/* Step 2: Medium Selection */}
          {step === 2 && (
            <motion.div
              key="medium"
              variants={pageVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2 bn-text">
                  মিডিয়াম নির্বাচন করো
                </h1>
                <p className="text-sm text-text-muted font-medium">তোমার পড়াশোনার মাধ্যম কোনটি?</p>
              </div>
              <div className="space-y-3">
                {MEDIA.map((m, i) => (
                  <motion.button
                    key={m}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden" animate="visible"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleMediumPick(m)}
                    className="w-full flex items-center gap-4 rounded-2xl border border bg-surface p-5 text-left transition-all hover:border-primary/40 hover:bg-surface-hover"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-black text-text">{MEDIUM_LABELS[m]}</span>
                      <p className="text-2xs font-medium text-text-dim mt-0.5">
                        {m === 'Bangla' ? 'বাংলা মিডিয়াম' : 'ইংলিশ মিডিয়াম'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-dim shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Name Input */}
          {step === 3 && (
            <motion.div
              key="name"
              variants={pageVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-black text-text tracking-tight mb-2 bn-text">
                  প্রায় শেষ!
                </h1>
                <p className="text-sm text-text-muted font-medium">
                  তোমাকে কী বলে ডাকব?
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border bg-surface px-5 py-4 transition-all focus-within:border-primary/40">
                  <User className="w-5 h-5 text-text-dim shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="তোমার নাম লিখো"
                    className="bg-transparent text-base text-text placeholder:text-text-dim w-full outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim().length > 0) handleFinish();
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-4 py-4 border-t border shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-black transition-all active:scale-[0.97] ${
              step === 0
                ? 'text-text-dim cursor-not-allowed opacity-0'
                : 'text-text-muted hover:text-text hover:bg-surface-alt'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            পেছনে
          </button>

          <button
            onClick={step === 3 ? handleFinish : handleContinue}
            disabled={!canProceed[step]}
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-[0.1em] transition-all active:scale-[0.97] bn-text ${
              canProceed[step]
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-surface-alt text-text-dim cursor-not-allowed'
            }`}
          >
            {step === 3 ? (saving ? 'সেটআপ হচ্ছে...' : 'শেখা শুরু করো') : 'চালিয়ে যান'}
            {!(step === 3 && saving) && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-center text-3xs font-medium text-text-dim">
          {step === 0 && 'পরে সেটিংসে পরিবর্তন করতে পারবে'}
          {step === 1 && requiresGroup(selectedExam) && 'তোমার গ্রুপ অনুযায়ী সাবজেক্ট দেখানো হবে'}
          {step === 1 && requiresClass(selectedExam) && 'তোমার শ্রেণী অনুযায়ী কন্টেন্ট সেট হবে'}
          {step === 2 && 'তোমার মিডিয়াম অনুযায়ী প্রশ্নের ভাষা নির্ধারিত হবে'}
          {step === 3 && 'পরে সেটিংসে নাম পরিবর্তন করতে পারবে'}
        </p>
      </div>
    </motion.div>
  );
}
