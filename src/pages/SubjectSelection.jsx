import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search,
  BookOpen, Brain, Atom, Beaker, Microscope, Globe,
  Calculator, BarChart3, MapPin, History,
  Landmark, PieChart, Briefcase, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useExamPath } from '../hooks/useExamPath';
import { getSubjects, getPathLabel } from '../config/examPaths';
import ExamOnboarding from '../components/ExamOnboarding';
import ExamPathSelector from '../components/ExamPathSelector';

const subjectIconMap = {
  'বাংলা': BookOpen,
  'ইংরেজি': BookOpen,
  'গণিত': Brain,
  'উচ্চতর গণিত': Brain,
  'পদার্থবিদ্যা': Atom,
  'রসায়ন': Beaker,
  'জীববিদ্যা': Microscope,
  'আইসিটি': Globe,
  'হিসাববিজ্ঞান': Calculator,
  'ফিন্যান্স': BarChart3,
  'ব্যবসায় উদ্যোগ': Briefcase,
  'অর্থনীতি': PieChart,
  'ইতিহাস': History,
  'ভূগোল': MapPin,
  'নাগরিকতা': Landmark,
  'সাধারণ জ্ঞান': Globe,
  'বাংলাদেশ বিষয়াবলী': MapPin,
  'বিশ্লেষণী ক্ষমতা': Brain,
  'সমাজ বিজ্ঞান': BookOpen,
};

function getIcon(name) {
  return subjectIconMap[name] || BookOpen;
}

const quizItems = [
  { id: 1, label: 'ইংরেজি গ্রামার বেসিক', meta: '১০টি প্রশ্ন' },
  { id: 2, label: 'গণিত অ্যাপ্লিকেশন', meta: '১৫টি প্রশ্ন' },
  { id: 3, label: 'পদার্থবিদ্যা মডেল টেস্ট', meta: '২০টি প্রশ্ন' },
];

export default function SubjectSelection() {
  const { examPath, setExamPath } = useExamPath();
  const [mode, setMode] = useState('normal');

  const handleSelectorComplete = (path) => {
    setExamPath(path);
    setMode('normal');
  };

  const subjects = examPath ? getSubjects(examPath.exam, examPath.group) : [];
  const pathLabel = examPath ? getPathLabel(examPath.exam, examPath.group, examPath.class, examPath.medium) : '';

  return (
    <AnimatePresence mode="wait">
      {!examPath ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <ExamOnboarding onComplete={handleSelectorComplete} />
        </motion.div>
      ) : mode === 'confirming' ? (
        <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <HomeScreen subjects={subjects} pathLabel={pathLabel} onSwitch={() => setMode('selector')} />
          <motion.div
            className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-white/15 bg-surface p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">পরীক্ষা পরিবর্তন?</h3>
                  <p className="text-2xs text-white/40 font-medium mt-0.5">
                    তোমার প্রোগ্রেস মুছে যাবে না
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/50 font-medium leading-relaxed mb-5">
                অন্য পরীক্ষায় সুইচ করলেও তোমার কুইজ হিস্টরি, এক্সপি, স্টার এবং মিসটেক রিভিউ ডাটা
                সম্পূর্ণ অক্ষত থাকবে। শুধু হোম স্ক্রিনের সাবজেক্ট লিস্ট পরিবর্তন হবে।
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMode('normal')}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-2xs font-black uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => setMode('selector')}
                  className="flex-1 rounded-xl bg-primary py-3 text-2xs font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-primary-hover active:scale-[0.97]"
                >
                  পরিবর্তন করো
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : mode === 'selector' ? (
        <motion.div
          key="selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <ExamPathSelector
            onComplete={handleSelectorComplete}
            onCancel={() => setMode('normal')}
          />
        </motion.div>
      ) : (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <HomeScreen subjects={subjects} pathLabel={pathLabel} onSwitch={() => setMode('confirming')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HomeScreen({ subjects, pathLabel, onSwitch }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-background border-b border-white/5">
        <div className="flex items-center w-full">
          <button
            className="w-[15%] flex items-center justify-center py-4 text-white/40 hover:text-white transition-colors min-h-touch"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-[85%] pr-4">
            <div className="flex items-center gap-2.5 bg-surface border border-white/10 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-white/30 shrink-0" />
              <input
                type="text"
                placeholder="সাবজেক্ট খুঁজুন..."
                className="bg-transparent text-sm text-white/80 placeholder:text-white/30 w-full outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Exam Path — switcher row */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={onSwitch}
          className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3 transition-all hover:border-primary/30 hover:bg-white/[0.03] active:scale-[0.98]"
        >
          <span className="flex-1 text-left">
            <span className="text-3xs font-bold uppercase tracking-[0.15em] text-white/30 block mb-0.5">
              বর্তমান পাথ
            </span>
            <span className="text-sm font-black text-white">{pathLabel}</span>
          </span>
          <RefreshCw className="w-4 h-4 text-white/30 shrink-0" />
        </button>
      </div>

      {/* Subject Grid */}
      <div className="px-4 pt-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {subjects.map((name, index) => {
            const Icon = getIcon(name);
            return (
              <motion.button
                key={name}
                whileTap={{ scale: 0.96 }}
                className={`
                  flex flex-col items-center justify-center gap-2.5
                  rounded-2xl border border-white/15 bg-surface
                  transition-all hover:border-primary/40 hover:bg-white/[0.03]
                  ${index < 2 ? 'py-10' : 'py-7'}
                `}
              >
                <Icon className="w-6 h-6 text-white/40" />
                <span className="text-sm font-bold text-white/70 leading-tight">
                  {name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Today's Quiz */}
      <div className="px-4 pt-10 pb-24">
        <div className="rounded-2xl border border-white/15 bg-surface p-5">
          <h2 className="text-base font-black text-white text-center tracking-tight mb-5">
            আজকের কুইজ
          </h2>
          <div className="space-y-3">
            {quizItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 flex items-center justify-between"
              >
                <span className="text-sm font-bold text-white/60">{item.label}</span>
                <span className="text-2xs font-bold text-white/30 uppercase tracking-wider">{item.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
