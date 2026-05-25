import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Brain, Atom, Beaker, Microscope, Globe,
  Calculator, BarChart3, MapPin, History,
  Landmark, PieChart, Briefcase, Star, Zap,
  Lock, CheckCircle2, Circle, Target, Sparkles,
  ChevronRight, Flame, ArrowRight, Play,
} from 'lucide-react';
import { useExamPath } from '../hooks/useExamPath';
import { getSubjects, getPathLabel } from '../config/examPaths';
import ExamOnboarding from '../components/ExamOnboarding';
import ExamPathSelector from '../components/ExamPathSelector';
import { getDailyQuizQuestions } from '../services/dailyQuiz';
import { stripMath } from '../services/quizUtils';
import { getMistakesDueCount } from '../services/review';

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

function SubjectNode({ subject, index, total, isCompleted, isCurrent, isLocked, onClick }) {
  const Icon = getIcon(subject);
  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      className={`relative flex items-center gap-4 w-full p-4 rounded-2xl border-2 transition-all text-left
        ${isLocked
          ? 'bg-surface/50 border opacity-50 cursor-not-allowed'
          : isCompleted
            ? 'bg-primary/5 border-primary/30 hover:border-primary'
            : isCurrent
              ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15'
              : 'bg-surface border hover:border-primary/50 hover:shadow-md'
        }`}
      whileHover={!isLocked ? { scale: 1.01 } : {}}
      whileTap={!isLocked ? { scale: 0.99 } : {}}
    >
      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0
        ${isLocked
          ? 'bg-surface-hover'
          : isCompleted
            ? 'bg-primary'
            : isCurrent
              ? 'bg-primary'
              : 'bg-surface-hover'
        }`}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-text-muted" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-white" />
        ) : (
          <Icon className="w-6 h-6 text-white" />
        )}
        {isCurrent && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-bee rounded-full animate-pulse ring-2 ring-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm md:text-base truncate
          ${isLocked ? 'text-text-muted' : 'text-text'}`}
        >
          {subject}
        </p>
        <p className={`text-xs font-medium mt-0.5
          ${isLocked ? 'text-text-muted/60' : isCompleted ? 'text-primary' : 'text-text-muted'}`}
        >
          {isLocked ? 'লকড' : isCompleted ? 'সম্পন্ন' : 'শুরু করুন'}
        </p>
      </div>
      {!isLocked && (
        <ChevronRight className={`w-5 h-5 shrink-0 ${isCompleted ? 'text-primary' : 'text-text-muted'}`} />
      )}
    </motion.button>
  );
}

function ConnectorLine({ completed }) {
  return (
    <div className="flex justify-center py-0.5">
      <svg width="20" height="24" viewBox="0 0 20 24" className="overflow-visible">
        <path
          d="M 10 0 C 10 12, 12 14, 14 16 C 16 18, 16 20, 10 24"
          stroke={completed ? '#93D333' : '#DCE6EC'}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function DailyQuestCard() {
  const navigate = useNavigate();
  const [dailyQuestions, setDailyQuestions] = useState([]);

  useEffect(() => {
    const qs = getDailyQuizQuestions();
    setDailyQuestions(qs);
  }, []);

  if (dailyQuestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 to-peacock/5 border border-primary/20 rounded-2xl p-4 md:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-sm text-text">আজকের কুইজ</h3>
            <p className="text-xs text-text-muted font-medium mt-0.5">
              {dailyQuestions.length}টি প্রশ্ন
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-hover transition-all active:scale-95"
        >
          শুরু করো
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function StatsBar() {
  const stars = getMistakesDueCount();
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-surface border border rounded-xl px-3 py-1.5">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-black text-text">0</span>
      </div>
      <div className="flex items-center gap-1.5 bg-surface border border rounded-xl px-3 py-1.5">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/30" />
        <span className="text-sm font-black text-text">{stars}</span>
      </div>
    </div>
  );
}

export default function Learn() {
  const { examPath, setExamPath } = useExamPath();
  const [mode, setMode] = useState('normal');
  const [dailyQuestions, setDailyQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setDailyQuestions(getDailyQuizQuestions());
  }, []);

  const handleSelectorComplete = (path) => {
    setExamPath(path);
    setMode('normal');
  };

  const subjects = examPath ? getSubjects(examPath.exam, examPath.group) : [];
  const pathLabel = examPath ? getPathLabel(examPath.exam, examPath.group, examPath.class, examPath.medium) : '';

  if (!examPath) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <ExamOnboarding onComplete={handleSelectorComplete} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (mode === 'selector') {
    return (
      <div className="max-w-lg mx-auto py-4">
        <button
          onClick={() => setMode('normal')}
          className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text mb-4 transition-all"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          ফিরে যান
        </button>
        <ExamPathSelector onComplete={handleSelectorComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black text-text">তোমার কোর্স</h1>
          <p className="text-sm text-text-muted font-medium mt-0.5">{pathLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatsBar />
          <button
            onClick={() => setMode('selector')}
            className="px-3 py-1.5 bg-surface border border rounded-full text-xs font-bold text-text-muted hover:text-text hover:border transition-all"
          >
            সুইচ
          </button>
        </div>
      </div>

      <DailyQuestCard />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-sm text-text">সাবজেক্ট সমূহ</h2>
          <span className="text-xs text-text-muted font-bold">{subjects.length}টি সাবজেক্ট</span>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-0"
          >
            {subjects.map((subject, index) => {
              const completed = false;
              const current = index === 0 && dailyQuestions.length === 0;
              const locked = index > 0 && !completed;
              return (
                <React.Fragment key={subject}>
                  {index > 0 && <ConnectorLine completed={false} />}
                  <SubjectNode
                    subject={subject}
                    index={index}
                    total={subjects.length}
                    isCompleted={completed}
                    isCurrent={current}
                    isLocked={locked}
                    onClick={() => {
                      if (!locked) {
                        navigate(`/practice`);
                      }
                    }}
                  />
                </React.Fragment>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 bg-gradient-to-br from-primary/5 to-peacock/5 border border-primary/20 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-black text-sm text-text mb-1">পড়াশোনাকে করো গেমিফাই!</h3>
        <p className="text-xs text-text-muted font-medium mb-3">প্রতিদিন প্রাক্টিস করো, জিতো এক্সপি ও জেমস</p>
        <button
          onClick={() => navigate('/practice')}
          className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary-hover transition-all active:scale-95 inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          এখনি শুরু করো
        </button>
      </div>
    </div>
  );
}
