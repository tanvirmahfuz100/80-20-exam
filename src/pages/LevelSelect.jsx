import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import {
  ArrowLeft, Lock, Zap, Star, Trophy,
  BrainCircuit, TrendingUp, Sparkles, BookOpen
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
        // CQ chapters have no levels â€” skip LevelSelect UI entirely
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

  if (loading || redirecting) return <LoadingScreen message="লেভেল লোড হচ্ছে..." />;

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 md:p-8 bg-white border border-wolf rounded-3xl text-center shadow-lg">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cardinal/10 border border-cardinal/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-cardinal" />
        </div>
        <h3 className="text-charcoal font-black text-xl tracking-tighter mb-2">লেভেল লোড করা যায়নি</h3>
        <p className="text-hare font-medium leading-relaxed text-sm">{error}</p>
        <Link to="/practice" className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-hover active:scale-95 shadow-sm">
          প্রাক্টিসে ফিরে যাও
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
            className="p-2 bg-white border border-wolf rounded-xl text-hare hover:text-charcoal hover:border-hare transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-charcoal tracking-tight">লেভেল</h1>
            <p className="text-xs text-hare font-medium truncate max-w-[200px] md:max-w-xs">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary font-bold text-xs tabular-nums">{stats.total_xp}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-600 font-bold text-xs tabular-nums">{stats.total_stars}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-wolf rounded-xl shadow-sm">
        <div className="flex-1 h-1.5 bg-eel rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] font-bold tabular-nums text-primary whitespace-nowrap">{completedCount}/{totalCount}</span>
      </div>

      {totalCount === 0 && (
        <div className="p-10 text-center border-2 border-dashed border-wolf rounded-2xl bg-white/50">
          <BrainCircuit className="w-10 h-10 mx-auto mb-3 text-hare/30" />
          <p className="text-hare/50 font-bold text-xs">কোনো লেভেল উপলব্ধ নয়</p>
        </div>
      )}

      {/* Section banner */}
      {totalCount > 0 && (
        <div className="bg-primary rounded-2xl shadow-md flex items-stretch sticky top-0 z-10">
          <div className="flex-1 min-w-0 p-4">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em] leading-relaxed">
              SECTION 1 · UNIT 1
            </p>
            <h2 className="text-white text-base font-black mt-0.5 truncate">{title}</h2>
          </div>
          <div className="flex items-stretch">
            <div className="w-px bg-white/20 my-3" />
            <button className="w-12 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-r-2xl">
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Winding snake roadmap */}
      <div className="relative px-2 pb-4">
        {(() => {
          const firstUncompletedIdx = levelsWithMeta.findIndex(l => l.unlocked && !l.completed);
          const itemCount = levelsWithMeta.length;
          const ROW_H = 88;
          const containerH = itemCount * ROW_H + 60;

          const xPositions = [18, 78, 25, 82, 15, 72, 30, 85, 20, 75];
          const getX = (i) => xPositions[i % xPositions.length];

          const buildPath = (from, to) => {
            if (from >= to || to === 0) return '';
            const segs = [];
            for (let i = from; i < to; i++) {
              const y = i * ROW_H + ROW_H / 2;
              const nx = getX(i);
              if (i === from) {
                const startX = from === 0 ? 50 : getX(from - 1);
                const startY = from === 0 ? 0 : (from - 1) * ROW_H + ROW_H / 2;
                segs.push(`M ${startX} ${startY}`);
                segs.push(`C ${nx} ${y - 16}, ${nx} ${y - 16}, ${nx} ${y}`);
              } else {
                const prevNX = getX(i - 1);
                const prevY = (i - 1) * ROW_H + ROW_H / 2;
                const prevBottom = prevY + ROW_H * 0.3;
                const nextTop = y - ROW_H * 0.3;
                segs.push(`C ${prevNX} ${prevBottom}, ${nx} ${nextTop}, ${nx} ${y}`);
              }
            }
            return segs.join(' ');
          };

          const nodeContent = (level, idx) => {
            const isLocked = !level.unlocked;
            const isCurrent = idx === firstUncompletedIdx;

            if (isLocked) {
              return (
                <div className="w-10 h-10 rounded-full bg-wolf/20 flex items-center justify-center cursor-not-allowed border border-wolf/30 opacity-40">
                  <Lock className="w-4 h-4 text-hare/30" />
                </div>
              );
            }

            if (isCurrent) {
              return (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
                  <button
                    className="relative w-14 h-14 rounded-full bg-gradient-to-b from-primary to-[#7ABF33] flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all border-b-4 border-[#5C9E1F] active:border-b-0 active:translate-y-[3px]"
                    onClick={() => handleStartLevel(level.levelNumber)}
                  >
                    <span className="text-white font-black text-lg mt-[-2px]">{level.levelNumber}</span>
                  </button>
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 250 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-white text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap shadow-xl z-20 border-2 border-white/30"
                  >
                    শুরু করো
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary" />
                  </motion.div>
                </div>
              );
            }

            if (level.completed) {
              return (
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-primary to-[#7ABF33] flex items-center justify-center shadow-sm border-b-4 border-[#5C9E1F] active:border-b-0 active:translate-y-[1px]">
                  <Star className="w-7 h-7 text-white fill-white mt-[-2px]" />
                </div>
              );
            }

            return (
              <div className="w-14 h-14 rounded-full bg-white border-[3px] border-wolf flex items-center justify-center shadow-sm">
                <span className="text-hare font-bold text-base">{level.levelNumber}</span>
              </div>
            );
          };

          const nodeLabel = (level, idx) => {
            const isLocked = !level.unlocked;
            const isCurrent = idx === firstUncompletedIdx;
            return (
              <span className={`text-[10px] mt-1 font-medium truncate ${
                isLocked ? 'text-hare/30' : isCurrent ? 'text-primary font-bold' : 'text-hare/60'
              }`}>
                {isCurrent ? 'চলুন!' : `Level ${level.levelNumber}`}
              </span>
            );
          };

          const allItems = [];
          for (let i = 0; i < itemCount; i++) {
            allItems.push({ type: 'node', index: i });
            if ((i + 1) % 5 === 0 && i < itemCount - 1) {
              allItems.push({ type: 'milestone', levelIndex: i });
            }
          }

          const svgFullPath = buildPath(0, itemCount);
          const svgCompletedPath = firstUncompletedIdx > 0 ? buildPath(0, firstUncompletedIdx) : '';

          return (
            <div className="relative" style={{ height: containerH }}>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox={`0 0 100 ${containerH}`}
                preserveAspectRatio="none"
              >
                <path
                  d={svgFullPath}
                  stroke="#DCE6EC"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {svgCompletedPath && (
                  <path
                    d={svgCompletedPath}
                    stroke="#93D333"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {levelsWithMeta.filter(l => l.completed).map((l, idx) => (
                  <circle
                    key={`dot-${idx}`}
                    cx={getX(idx)}
                    cy={idx * ROW_H + ROW_H / 2}
                    r="2.5"
                    fill="#93D333"
                  />
                ))}
              </svg>

              {allItems.map((item, idx) => {
                if (item.type === 'milestone') {
                  const msY = item.levelIndex * ROW_H + ROW_H / 2;
                  return (
                    <motion.div
                      key={`ms-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="absolute z-10"
                      style={{
                        left: '50%',
                        top: msY - 32,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="w-16 h-16 rounded-full bg-cardinal flex items-center justify-center ring-4 ring-white shadow-lg">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                    </motion.div>
                  );
                }

                const i = item.index;
                const level = levelsWithMeta[i];
                const nx = getX(i);
                const alignLeft = nx < 50;
                const nodeY = i * ROW_H;

                return (
                  <motion.div
                    key={`node-${i}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                    className="absolute z-10"
                    style={{
                      left: `${nx}%`,
                      top: nodeY,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className={`flex flex-col ${alignLeft ? 'items-start' : 'items-end'}`}>
                      {nodeContent(level, i)}
                      {nodeLabel(level, i)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
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
          className="w-full py-3 bg-primary text-white rounded-full font-bold text-sm transition-all active:scale-[0.97] hover:bg-primary-hover flex items-center justify-center gap-2 shadow-sm"
        >
          <TrendingUp className="w-4 h-4" />
          প্রাক্টিস চালিয়ে যাও
        </motion.button>
      )}
    </motion.div>
  );
};

export default LevelSelect;
