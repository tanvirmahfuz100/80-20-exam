import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Brain, Atom, Beaker, Microscope, Globe,
  Calculator, BarChart3, MapPin, History,
  Landmark, PieChart, Briefcase, Star, Zap,
  Sparkles, Flame, ArrowRight, Play,
} from 'lucide-react';
import { useExamPath } from '../hooks/useExamPath';
import { getSubjects } from '../config/examPaths';
import ExamOnboarding from '../components/ExamOnboarding';
import { subjectNameToId } from './SubjectSelection';
import ExamChangerDropdown from '../components/ExamChangerDropdown';
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

function SubjectGridCard({ subject, onClick }) {
  const Icon = getIcon(subject);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface border hover:border-primary/50 transition-all"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-[11px] font-bold text-text text-center leading-tight">{subject}</span>
    </motion.button>
  );
}

function InlineDailyQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    getDailyQuizQuestions().then(setQuestions);
  }, []);

  if (questions.length === 0) return null;

  if (finished) {
    const accuracy = Math.round((score / questions.length) * 100);
    const earnedXp = score * 10;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/5 to-peacock/5 border border-primary/20 rounded-2xl p-5 text-center"
      >
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-black text-base text-text mb-1">দৈনিক কুইজ সম্পন্ন!</h3>
        <div className="flex items-center justify-center gap-1 mt-3">
          <span className="text-4xl font-black text-text">{score}</span>
          <span className="text-lg font-bold text-text-muted">/{questions.length}</span>
        </div>
        <p className="text-sm font-bold text-text-muted mt-1">{accuracy}% accuracy</p>
        <div className="flex items-center justify-center gap-1.5 mt-3 mb-5">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-black text-text">+{earnedXp} XP</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setCurrentIndex(0); setSelectedIdx(null); setAnswered(false); setScore(0); setResults([]); setFinished(false); }}
            className="flex-1 bg-surface border border rounded-xl py-2.5 text-sm font-bold text-text hover:bg-surface-hover transition-all active:scale-95"
          >
            পুনরায় চেষ্টা
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary-hover transition-all active:scale-95"
          >
            আরও প্রাক্টিস
          </button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedIdx(idx);
  };

  const handleCheck = () => {
    if (selectedIdx === null) return;
    const isCorrect = q.options[selectedIdx]?.key === q.answer;
    if (isCorrect) setScore(s => s + 1);
    setResults(prev => [...prev, { selected: selectedIdx, isCorrect }]);
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedIdx(null);
      setAnswered(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-peacock/5 p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-black text-sm text-text">দৈনিক কুইজ</h2>
        </div>
        <span className="text-xs font-bold text-text-muted">{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="bg-surface border rounded-xl p-4 mb-3">
        <p className="text-sm font-bold text-text leading-relaxed">{q.question}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          let btnClass = 'border-2 bg-surface border hover:border-primary/40';
          let badgeClass = 'bg-surface-hover border text-text-muted';

          if (answered) {
            if (opt.key === q.answer) {
              btnClass = 'border-2 border-emerald-500 bg-emerald-500/10';
              badgeClass = 'bg-emerald-500 text-white border-emerald-500';
            } else if (isSelected) {
              btnClass = 'border-2 border-cardinal bg-cardinal/10';
              badgeClass = 'bg-cardinal text-white border-cardinal';
            } else {
              btnClass = 'border-2 bg-surface border opacity-50';
            }
          } else if (isSelected) {
            btnClass = 'border-2 border-primary bg-primary/10';
            badgeClass = 'bg-primary text-white border-primary';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${btnClass}`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border shrink-0 ${badgeClass}`}>
                {opt.key}
              </span>
              <span className="text-xs font-bold leading-snug flex-1 text-text">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {!answered ? (
        selectedIdx !== null && (
          <button
            onClick={handleCheck}
            className="mt-4 w-full bg-primary text-white rounded-xl py-3 font-bold text-sm hover:bg-primary-hover transition-all active:scale-95"
          >
            চেক করুন
          </button>
        )
      ) : (
        <button
          onClick={handleNext}
          className="mt-4 w-full bg-primary text-white rounded-xl py-3 font-bold text-sm hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          {isLast ? 'দেখুন ফলাফল' : 'পরবর্তী প্রশ্ন'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
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
  const navigate = useNavigate();

  const handleSelectorComplete = (path) => {
    setExamPath(path);
  };

  const subjects = examPath ? getSubjects(examPath.exam, examPath.group) : [];

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

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-text">তোমার কোর্স</h1>
          <StatsBar />
        </div>
        <ExamChangerDropdown
          currentExamPath={examPath}
          onExamChange={handleSelectorComplete}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-sm text-text">সাবজেক্ট সমূহ</h2>
          <span className="text-xs text-text-muted font-bold">{subjects.length}টি সাবজেক্ট</span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          {subjects.map((subject) => (
            <SubjectGridCard
              key={subject}
              subject={subject}
              onClick={() => {
                const subjId = subjectNameToId[subject];
                const url = subjId
                  ? `/practice?exam=${examPath.exam.toLowerCase()}&subjectId=${subjId}`
                  : `/practice?exam=${examPath.exam.toLowerCase()}`;
                navigate(url);
              }}
            />
          ))}
        </motion.div>
      </div>

      <InlineDailyQuiz />

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
