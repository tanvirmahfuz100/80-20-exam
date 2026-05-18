import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import {
  ArrowLeft, Lock, CheckCircle, Zap, Star, Trophy,
  BrainCircuit, TrendingUp, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeQuizQuestions } from './Quiz';
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
        setNormalizedQuestions(normalized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [file]);

  const handleStartLevel = (levelNumber) => {
    navigate(`/quiz/${chapterId}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(title)}&level=${levelNumber}`);
  };

  if (loading) return <LoadingScreen message="Loading levels..." />;

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

      <div className="space-y-2">
        {levelsWithMeta.map((level, idx) => (
          <motion.button
            key={level.levelNumber}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
            onClick={() => level.unlocked && !level.completed && handleStartLevel(level.levelNumber)}
            disabled={!level.unlocked || level.completed}
            className={`w-full text-left rounded-xl border transition-all overflow-hidden ${
              !level.unlocked
                ? 'bg-surface/50 border-white/5 opacity-50 cursor-not-allowed'
                : level.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20 cursor-default'
                  : 'bg-surface border-white/5 hover:border-primary/30 hover:bg-white/[0.03] cursor-pointer active:scale-[0.99]'
            }`}
          >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                !level.unlocked
                  ? 'bg-white/[0.04] text-white/15'
                  : level.completed
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-primary/15 text-primary'
              }`}>
                {!level.unlocked ? (
                  <Lock className="w-4 h-4" />
                ) : level.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{String(level.levelNumber).padStart(2, '0')}</span>
                )}
              </div>

              <div className="min-w-0">
                <h4 className={`font-black tracking-tight text-sm leading-tight ${
                  level.unlocked ? 'text-white' : 'text-white/40'
                }`}>
                  Level {level.levelNumber}
                </h4>
                <p className="text-[10px] font-bold text-white/30 mt-0.5">
                  {level.type === 'passage'
                    ? `${level.passageCount} passage${level.passageCount > 1 ? 's' : ''}`
                    : `${level.questions.length} question${level.questions.length !== 1 ? 's' : ''}`
                  }
                  {level.completed && level.accuracy != null && (
                    <span className="ml-2 text-emerald-400">• {level.accuracy}%</span>
                  )}
                </p>
                {level.completed && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 text-primary/60" />
                      <span className="text-[9px] font-black text-primary/60 tabular-nums">+{level.xpEarned}XP</span>
                    </div>
                    {level.starsEarned > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-400/60" />
                        <span className="text-[9px] font-black text-yellow-400/60 tabular-nums">+{level.starsEarned}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {level.unlocked && !level.completed && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black font-black uppercase tracking-widest rounded-xl text-[9px] shadow-lg shadow-primary/10">
                  <Trophy className="w-3 h-3" />
                  Start
                </div>
              )}
              {level.completed && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 font-black uppercase tracking-widest rounded-xl text-[9px]">
                  <CheckCircle className="w-3 h-3" />
                  Done
                </div>
              )}
            </div>
          </motion.button>
        ))}
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
          className="w-full py-3 bg-primary text-black rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] hover:bg-primary-hover flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Continue Practicing
        </motion.button>
      )}
    </motion.div>
  );
};

export default LevelSelect;
