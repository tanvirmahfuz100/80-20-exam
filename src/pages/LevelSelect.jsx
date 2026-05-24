import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import {
  ArrowLeft, Lock, CheckCircle, Zap, Star, Trophy,
  BrainCircuit, TrendingUp, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeQuizQuestions } from '../services/quizUtils';
import { computeLevels, getLevelProgress, isLevelUnlocked, getUserStats } from '../services/levels';

const LevelSelect = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const file = searchParams.get('file');
  const title = searchParams.get('title');
  const chapterId = searchParams.get('chapterId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [normalizedQuestions, setNormalizedQuestions] = useState([]);
  const [redirecting, setRedirecting] = useState(false);

  const progress = useMemo(() => {
    if (!user?.id || !chapterId) return { levels: {} };
    return getLevelProgress(user.id, chapterId);
  }, [user?.id, chapterId]);

  const levels = useMemo(() => {
    return computeLevels(normalizedQuestions);
  }, [normalizedQuestions]);

  const levelsWithMeta = useMemo(() => {
    return levels.map(l => ({
      ...l,
      unlocked: isLevelUnlocked(l.levelNumber, progress),
      completed: progress.levels[String(l.levelNumber)]?.completed || false,
      accuracy: progress.levels[String(l.levelNumber)]?.accuracy || null,
      xpEarned: progress.levels[String(l.levelNumber)]?.xpEarned || 0,
      starsEarned: progress.levels[String(l.levelNumber)]?.starsEarned || 0,
    }));
  }, [levels, progress]);

  const completedCount = levelsWithMeta.filter(l => l.completed).length;
  const totalCount = levels.length;

  const stats = useMemo(() => {
    if (!user?.id) return { total_xp: 0, total_stars: 0 };
    return getUserStats(user.id);
  }, [user?.id]);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        if (!file) {
          setError('No file specified.');
          return;
        }
        let fileUrl = file;
        if (fileUrl.startsWith('/')) {
          const base = import.meta.env.BASE_URL || '/';
          fileUrl = `${base}${fileUrl.replace(/^\//, '')}`;
        }
        const res = await fetch(fileUrl);
        const data = await res.json();

        let questionArray = [];
        if (Array.isArray(data)) {
          if (data.length > 0 && Array.isArray(data[0].items)) {
            questionArray = data.flatMap(set =>
              (set.items || []).map((item) => {
                const options = item.options || [];
                const correctAnswer = item.correct_answer || '';
                return {
                  id: item.id || `${set.id}_${item.item}`,
                  text: [item.context, item.question_text].filter(Boolean).join(' '),
                  options,
                  correct: options.indexOf(correctAnswer) >= 0 ? options.indexOf(correctAnswer) : 0,
                  difficulty: 'medium',
                };
              })
            );
          } else {
            questionArray = data;
          }
        } else if (Array.isArray(data.questions)) questionArray = data.questions;
        else if (Array.isArray(data.passages)) questionArray = data.passages;
        else if (Array.isArray(data.items)) questionArray = data.items;

        const normalized = normalizeQuizQuestions({ questions: questionArray });
        const computed = computeLevels(normalized);
        // CQ chapters have no levels — skip LevelSelect UI entirely
        if (computed.length === 0 && normalized.length > 0) {
          setRedirecting(true);
          navigate(`/quiz/${chapterId}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(title)}`, { replace: true });
          return;
        }
        setNormalizedQuestions(normalized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [file, chapterId, title, navigate]);

  const handleStartLevel = (levelNumber) => {
    navigate(`/quiz/${chapterId}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(title)}&level=${levelNumber}`);
  };

  if (loading || redirecting) return <LoadingScreen message="Loading levels..." />;

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 md:p-10 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl md:rounded-[2rem] text-center shadow-lg">
        <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-5 rounded-2xl md:rounded-3xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
        </div>
        <h3 className="text-white font-black text-xl md:text-2xl tracking-tighter mb-3">Could not load levels</h3>
        <p className="text-white/70 font-medium leading-relaxed">{error}</p>
        <Link to="/practice" className="mt-5 md:mt-6 inline-flex items-center justify-center rounded-xl md:rounded-2xl bg-yellow-500 px-5 md:px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-yellow-400 active:scale-95">
          Back to Practice
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-4 md:space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all border border-white/5 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-tighter">Levels</h1>
            <p className="text-[10px] md:text-xs text-white/30 font-medium truncate max-w-[200px] md:max-w-xs">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary font-black text-xs tabular-nums">{stats.total_xp}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 font-black text-xs tabular-nums">{stats.total_stars}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-white/5 rounded-xl">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] font-black tabular-nums text-primary/70 whitespace-nowrap">{completedCount}/{totalCount}</span>
      </div>

      {totalCount === 0 && (
        <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
          <BrainCircuit className="w-10 h-10 mx-auto mb-3 text-white/10" />
          <p className="text-white/20 font-black uppercase tracking-widest text-xs">No levels available</p>
        </div>
      )}

      {/* Zigzag roadmap */}
      <div className="relative px-2 pb-2">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/5 -translate-x-1/2" />

        {(() => {
          const items = [];
          for (let i = 0; i < levelsWithMeta.length; i++) {
            items.push({ type: 'level', level: levelsWithMeta[i], index: i });
            if ((i + 1) % 5 === 0 && i < levelsWithMeta.length - 1) {
              items.push({ type: 'milestone' });
            }
          }

          const firstUncompletedIdx = levelsWithMeta.findIndex(l => l.unlocked && !l.completed);

          const nodeContent = (level, idx) => {
            const isLocked = !level.unlocked;
            const isCurrent = idx === firstUncompletedIdx;

            if (isLocked) {
              return (
                <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center cursor-not-allowed">
                  <Lock className="w-6 h-6 text-gray-500" />
                </div>
              );
            }

            if (isCurrent) {
              return (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-70" />
                  <button
                    className="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px]"
                    onClick={() => handleStartLevel(level.levelNumber)}
                  >
                    <span className="text-black font-black text-lg">{level.levelNumber}</span>
                  </button>
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[11px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-20 tracking-widest">
                    START
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
                  </div>
                </div>
              );
            }

            return (
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
            );
          };

          const dotColor = (level, idx) => {
            if (idx === firstUncompletedIdx) return 'bg-primary';
            if (level.completed) return 'bg-emerald-500';
            return 'bg-gray-600';
          };

          const nodeLabel = (level) => {
            const isLocked = !level.unlocked;
            return (
              <span className={`text-xs mt-1.5 max-w-[128px] leading-tight font-medium truncate ${
                isLocked ? 'text-white/20' : 'text-white/50'
              }`}>
                Level {level.levelNumber}
              </span>
            );
          };

          return items.map((item, idx) => {
            if (item.type === 'milestone') {
              return (
                <motion.div
                  key={`ms-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  className="relative flex items-center justify-center py-5"
                >
                  <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center z-10 ring-4 ring-gray-900">
                    <Trophy className="w-9 h-9 text-white" />
                  </div>
                </motion.div>
              );
            }

            const level = item.level;
            const i = item.index;
            const isLeft = i % 2 === 0;

            return (
              <motion.div
                key={level.levelNumber}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.25 }}
                className="relative flex items-center py-[18px]"
              >
                <div className={`absolute top-1/2 w-[80px] h-px bg-white/5 -translate-y-1/2 ${
                  isLeft ? 'right-1/2' : 'left-1/2'
                }`} />

                <div className="flex-1 flex justify-end pr-20">
                  {isLeft && (
                    <div className="flex flex-col items-end">
                      {nodeContent(level, i)}
                      {nodeLabel(level)}
                    </div>
                  )}
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${dotColor(level, i)}`} />
                </div>

                <div className="flex-1 flex justify-start pl-20">
                  {!isLeft && (
                    <div className="flex flex-col items-start">
                      {nodeContent(level, i)}
                      {nodeLabel(level)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          });
        })()}
      </div>

      {levelsWithMeta.some(l => l.completed && l.accuracy >= 80) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            const nextUncompleted = levelsWithMeta.find(l => l.unlocked && !l.completed);
            if (nextUncompleted) handleStartLevel(nextUncompleted.levelNumber);
          }}
          className="w-full py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] hover:bg-primary-hover flex items-center justify-center gap-2 border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px]"
        >
          <TrendingUp className="w-4 h-4" />
          Continue Practicing
        </motion.button>
      )}
    </motion.div>
  );
};

export default LevelSelect;
