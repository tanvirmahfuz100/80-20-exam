import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronLeft, ArrowRight, BookOpen, Globe, User, Sun, Moon } from 'lucide-react';
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

  const showBack = step > 0;
  const canProceed = {
    0: false, // exam pick triggers automatically
    1: false, // group/class pick triggers automatically
    2: false, // medium pick triggers automatically
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
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center space-y-8">
            <div className="flex justify-center">
              <img
                src={`${import.meta.env.BASE_URL || '/'}mascot-celebrating.png`}
                alt="Mascot"
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl"
              />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-text">ফায়ারম্যানে স্বাগতম!</h2>
              <p className="text-text-muted text-sm md:text-base font-medium">শুরু করার আগে তোমার পছন্দের মোড বেছে নাও</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleThemePick('dark')}
                className="flex-1 flex flex-col items-center gap-3 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-surface border-2 border hover:border-primary/50 transition-all active:scale-[0.97] hover:scale-[1.02] group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                  <Moon className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg md:text-xl font-black text-text">ডার্ক মোড</p>
                  <p className="text-[10px] md:text-xs text-text-muted font-medium">চোখে আরামদায়ক</p>
                </div>
              </button>
              <button
                onClick={() => handleThemePick('light')}
                className="flex-1 flex flex-col items-center gap-3 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-surface border-2 border hover:border-primary/50 transition-all active:scale-[0.97] hover:scale-[1.02] group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/40 transition-all">
                  <Sun className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg md:text-xl font-black text-text">লাইট মোড</p>
                  <p className="text-[10px] md:text-xs text-text-muted font-medium">উজ্জ্বল ও পরিষ্কার</p>
                </div>
              </button>
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
      <div className="flex items-center gap-3 px-4 py-4 border-b border shrink-0">
        {showBack ? (
          <button onClick={handleBack} className="p-2 -ml-2 text-text-muted hover:text-text transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex-1 text-center">
          <span className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim">
            {stepTitles[step]}
          </span>
        </div>
        <div className="w-9" />
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
                <h1 className="text-xl font-black text-text tracking-tight mb-2">
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
                <h1 className="text-xl font-black text-text tracking-tight mb-2">
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
                <h1 className="text-xl font-black text-text tracking-tight mb-2">
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
                <button
                  onClick={handleFinish}
                  disabled={name.trim().length === 0 || saving}
                  className={`w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-black uppercase tracking-[0.15em] transition-all active:scale-[0.97] ${
                    name.trim().length > 0 && !saving
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-surface-alt text-text-dim cursor-not-allowed'
                  }`}
                >
                  {saving ? 'সেটআপ হচ্ছে...' : 'শেখা শুরু করো'}
                  {!saving && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-4 border-t border shrink-0">
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
