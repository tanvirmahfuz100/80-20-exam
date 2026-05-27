import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, CheckCircle,
  BookOpen, Brain, Atom, Beaker, Microscope, Globe,
  Calculator, BarChart3, MapPin, History,
  Landmark, PieChart, Briefcase, AlertTriangle, RefreshCw,
  Sparkles, Zap, ArrowRight, Star, FlaskConical, Sprout, BookHeart,
} from 'lucide-react';
import { useExamPath } from '../hooks/useExamPath';
import { getSubjects, getPathLabel } from '../config/examPaths';
import ExamOnboarding from '../components/ExamOnboarding';
import ExamPathSelector from '../components/ExamPathSelector';
import PaperPicker from '../components/PaperPicker';
import { getDailyQuizQuestions } from '../services/dailyQuiz';
import { stripMath } from '../services/quizUtils';

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
  'সাধারণ বিজ্ঞান': FlaskConical,
  'কৃষি শিক্ষা': Sprout,
  'ইসলাম শিক্ষা': BookHeart,
};

export const multiPaperSubjects = {
  'বাংলা': true,
};

export const subjectNameToId = {
  'বাংলা': 'bangla',
  'ইংরেজি': 'english',
  'গণিত': 'math',
  'উচ্চতর গণিত': 'higher_math',
  'পদার্থবিদ্যা': 'physics',
  'রসায়ন': 'chemistry',
  'জীববিদ্যা': 'biology',
  'আইসিটি': 'ict',
  'হিসাববিজ্ঞান': 'accounting',
  'ফিন্যান্স': 'finance',
  'ব্যবসায় উদ্যোগ': 'business_entrepreneurship',
  'অর্থনীতি': 'economics',
  'ইতিহাস': 'history',
  'ভূগোল': 'geography',
  'নাগরিকতা': 'civics',
  'সাধারণ জ্ঞান': 'general_knowledge',
  'বাংলাদেশ বিষয়াবলী': 'bangladesh_affairs',
  'বিশ্লেষণী ক্ষমতা': 'analytical',
  'সমাজ বিজ্ঞান': 'social_science',
  'সাধারণ বিজ্ঞান': 'general_science',
  'কৃষি শিক্ষা': 'agriculture',
  'ইসলাম শিক্ষা': 'islam',
};

function getIcon(name) {
  return subjectIconMap[name] || BookOpen;
}



export default function SubjectSelection() {
  const navigate = useNavigate();
  const { examPath, setExamPath } = useExamPath();
  const [mode, setMode] = useState('normal');
  const [paperPicker, setPaperPicker] = useState({ open: false, subject: '' });

  const handlePaperSelect = (paperId, paperLabel) => {
    setPaperPicker({ open: false, subject: '' });
    navigate(`/practice?exam=${examPath.exam.toLowerCase()}&subjectId=${paperId}`);
  };

  const handleSelectorComplete = (path) => {
    setExamPath(path);
    setMode('normal');
  };

  const subjects = examPath ? getSubjects(examPath.exam, examPath.group) : [];
  const pathLabel = examPath ? getPathLabel(examPath.exam, examPath.group, examPath.class, examPath.medium) : '';

  return (
    <>
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
          <HomeScreen subjects={subjects} pathLabel={pathLabel} examPath={examPath} onSwitch={() => setMode('selector')} onPaperSelect={(subj) => setPaperPicker({ open: true, subject: subj })} />
          <motion.div
            className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border bg-surface p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text">পরীক্ষা পরিবর্তন?</h3>
                  <p className="text-2xs text-text-muted font-medium mt-0.5">
                    তোমার প্রোগ্রেস মুছে যাবে না
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-muted font-medium leading-relaxed mb-5">
                অন্য পরীক্ষায় সুইচ করলেও তোমার কুইজ হিস্টরি, এক্সপি, স্টার এবং মিসটেক রিভিউ ডাটা
                সম্পূর্ণ অক্ষত থাকবে। শুধু হোম স্ক্রিনের সাবজেক্ট লিস্ট পরিবর্তন হবে।
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMode('normal')}
                  className="flex-1 rounded-xl border border bg-surface-alt py-3 text-2xs font-black uppercase tracking-[0.15em] text-text-muted hover:text-text transition-colors bn-text"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => setMode('selector')}
                  className="flex-1 rounded-xl bg-primary py-3 text-2xs font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-primary-hover active:scale-[0.97] bn-text"
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
          <HomeScreen subjects={subjects} pathLabel={pathLabel} examPath={examPath} onSwitch={() => setMode('confirming')} onPaperSelect={(subj) => setPaperPicker({ open: true, subject: subj })} />
        </motion.div>
      )}
    </AnimatePresence>
      <PaperPicker
        isOpen={paperPicker.open}
        onClose={() => setPaperPicker({ open: false, subject: '' })}
        onSelect={handlePaperSelect}
        exam={examPath?.exam?.toLowerCase()}
        subjectName={paperPicker.subject}
      />
    </>
  );
}

function HomeScreen({ subjects, pathLabel, onSwitch, examPath, onPaperSelect }) {
  const navigate = useNavigate();
  const [dailyQ, setDailyQ] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!examPath) return;
    setLoading(true);
    getDailyQuizQuestions(examPath.exam, examPath.group)
      .then(qs => {
        setDailyQ(qs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [examPath]);

  const currentQ = dailyQ[qIndex];

  const handleSelect = (idx) => {
    if (answered || finished) return;
    setSelected(idx);
    const chosenKey = currentQ.options[idx]?.key || '';
    if (chosenKey === currentQ.answer) setScore(s => s + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (qIndex < dailyQ.length - 1) {
      setQIndex(i => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background border-b border">
        <div className="flex items-center w-full">
          <button
            className="w-[15%] flex items-center justify-center py-4 text-text-muted hover:text-text transition-colors min-h-touch"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-[85%] pr-4">
            <div className="flex items-center gap-2.5 bg-surface border border rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-text-dim shrink-0" />
              <input
                type="text"
                placeholder="সাবজেক্ট খুঁজুন..."
                className="bg-transparent text-sm text-text placeholder:text-text-dim w-full outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-2">
        <button
          onClick={onSwitch}
          className="w-full flex items-center gap-3 rounded-xl border border bg-surface px-4 py-3 transition-all hover:border-primary/30 hover:bg-surface-hover active:scale-[0.98]"
        >
          <span className="flex-1 text-left">
            <span className="text-3xs font-bold uppercase tracking-[0.15em] text-text-dim block mb-0.5 bn-text">
              বর্তমান পাথ
            </span>
            <span className="text-sm font-black text-text">{pathLabel}</span>
          </span>
          <RefreshCw className="w-4 h-4 text-text-dim shrink-0" />
        </button>
      </div>

      <div className="px-4 pt-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {subjects.map((name, index) => {
            const Icon = getIcon(name);
            return (
              <motion.button
                key={name}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (multiPaperSubjects[name]) {
                    onPaperSelect(name);
                    return;
                  }
                  const subjId = subjectNameToId[name];
                  const url = subjId
                    ? `/practice?exam=${examPath.exam.toLowerCase()}&subjectId=${subjId}`
                    : `/practice?exam=${examPath.exam.toLowerCase()}`;
                  navigate(url);
                }}
                className={`
                  flex flex-col items-center justify-center gap-2.5
                  rounded-2xl border border bg-surface
                  transition-all hover:border-primary/40 hover:bg-surface-hover
                  ${index < 2 ? 'py-10' : 'py-7'}
                `}
              >
                <Icon className="w-6 h-6 text-text-muted" />
                <span className="text-sm font-bold text-text leading-tight">
                  {name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-10 pb-24">
        <div className="rounded-2xl border border-primary/20 bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-base font-black text-text tracking-tight bn-text">
                আজকের কুইজ
              </h2>
            </div>
            {!loading && dailyQ.length > 0 && !finished && (
              <span className="text-2xs font-bold text-text-muted">
                {qIndex + 1} / {dailyQ.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : dailyQ.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-text-muted font-medium">আজকের জন্য কোনো প্রশ্ন উপলব্ধ নেই</p>
            </div>
          ) : finished ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-black text-text mb-1">কুইজ শেষ!</p>
              <p className="text-xs text-text-muted font-medium mb-4">
                {score} / {dailyQ.length} সঠিক
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-2xs font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-primary-hover active:scale-[0.97] bn-text"
              >
                আবার নাও
              </button>
            </div>
          ) : currentQ ? (
            <div>
              <div className="bg-surface-alt border border rounded-xl p-4 mb-3">
                <p className="text-sm font-bold text-text leading-relaxed">
                  {stripMath(currentQ.question)}
                </p>
              </div>

              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrectOpt = answered && opt.key === currentQ.answer;
                  const isWrongOpt = answered && isSelected && opt.key !== currentQ.answer;
                  const isDimmed = answered && !isCorrectOpt && !isWrongOpt;

                  let state = 'idle';
                  if (isCorrectOpt) state = 'correct';
                  else if (isWrongOpt) state = 'wrong';
                  else if (isDimmed) state = 'dimmed';
                  else if (isSelected) state = 'selected';

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        state === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                        state === 'wrong' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300' :
                        state === 'selected' ? 'bg-primary/20 border-primary text-text' :
                        state === 'dimmed' ? 'bg-surface-alt border-transparent opacity-30' :
                        'bg-surface-alt border text-text-muted hover:border hover:bg-surface-hover hover:text-text'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border shrink-0 ${
                        state === 'selected' ? 'bg-primary text-white border-primary' :
                        state === 'correct' ? 'bg-emerald-500 text-black border-emerald-500' :
                        state === 'wrong' ? 'bg-yellow-500 text-black border-yellow-500' :
                        'bg-surface-alt border text-text-muted'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs font-bold leading-snug flex-1">
                        {stripMath(opt.text)}
                      </span>
                      {state === 'correct' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="mt-3">
                  {selected !== null && currentQ.options[selected]?.key === currentQ.answer ? (
                    <div className="bg-emerald-500/[0.07] border border-emerald-500/20 rounded-xl p-3 mb-3">
                      <p className="text-emerald-400 text-xs font-black mb-1">✓ সঠিক</p>
                      {currentQ.explanation && (
                        <p className="text-text-muted text-[11px] leading-relaxed">{stripMath(currentQ.explanation)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-500/[0.07] border border-yellow-500/20 rounded-xl p-3 mb-3">
                      <p className="text-yellow-300 text-xs font-black mb-1">
                        ✗ ভুল — সঠিক উত্তর: <span className="text-text font-bold">{currentQ.answer}</span>
                      </p>
                      {currentQ.explanation && (
                        <p className="text-text-muted text-[11px] leading-relaxed">{stripMath(currentQ.explanation)}</p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-primary-hover active:scale-[0.98] flex items-center justify-center gap-2 bn-text"
                  >
                    {qIndex < dailyQ.length - 1 ? 'পরবর্তী →' : 'দেখ ফলাফল'}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
