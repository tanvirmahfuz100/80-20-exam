import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Timer, Target, BadgeCheck, Flame, ArrowRight, Trophy,
} from 'lucide-react';
import {
  getDailyChallengesForExam,
  getWeeklyChallengeForExam,
  getDailyChallengeExpiry,
  getWeeklyChallengeExpiry,
} from '../../services/levels';
import { useCountdown } from '../../hooks/useCountdown';

interface ChallengesCardProps {
  exam?: string;
}

export default function ChallengesCard({ exam }: ChallengesCardProps) {
  const examId = exam?.toLowerCase() || 'ssc';
  const [dailyChallenges] = useState<any[]>(() => getDailyChallengesForExam(examId));
  const [weeklyChallenge] = useState<any>(() => getWeeklyChallengeForExam(examId));
  const countdown = useCountdown({
    daily: getDailyChallengeExpiry,
    weekly: getWeeklyChallengeExpiry,
  });

  const hasContent = dailyChallenges.length > 0 || weeklyChallenge;

  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-surface p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h2 className="font-black text-sm text-text">চ্যালেঞ্জ</h2>
      </div>

      <div className="space-y-3">
        {dailyChallenges.slice(0, 3).map((ch: any) => (
          <Link
            key={ch.id}
            to={`/levels?file=${encodeURIComponent(ch.file)}&title=${encodeURIComponent(ch.label)}&chapterId=${ch.chapterId}`}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-primary/30 ${
              ch.completed ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : 'bg-surface-alt border'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              ch.completed ? 'bg-emerald-500/10' : 'bg-primary/10'
            }`}>
              {ch.completed ? (
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Target className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text truncate">{ch.label}</p>
              <p className="text-[10px] text-text-muted font-medium">লেভেল {ch.levelNumber}</p>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
              ch.completed
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-primary/10 text-primary'
            }`}>
              {ch.completed ? 'সম্পন্ন' : `+${ch.bonusXp} XP`}
            </div>
          </Link>
        ))}

        {dailyChallenges.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] text-text-dim font-medium flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {countdown.daily.hours}h {countdown.daily.minutes}m বাকি
            </span>
          </div>
        )}

        {weeklyChallenge && (
          <Link
            to="/practice"
            className="block p-3 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.03] hover:bg-yellow-500/[0.06] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-xs font-bold text-text">সাপ্তাহিক: {weeklyChallenge.label}</p>
                  <p className="text-[9px] text-text-muted font-medium flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {countdown.weekly.days}d {countdown.weekly.hours}h বাকি
                  </p>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                weeklyChallenge.completed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {weeklyChallenge.completed ? 'সম্পন্ন' : `+${weeklyChallenge.bonusXp} XP`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${((weeklyChallenge.completedLevels?.length || 0) / Math.max(weeklyChallenge.totalLevels, 1)) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-bold tabular-nums text-yellow-400/70">
                {weeklyChallenge.completedLevels?.length || 0}/{weeklyChallenge.totalLevels}
              </span>
            </div>
          </Link>
        )}
      </div>

      <Link
        to="/quests"
        className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold text-primary hover:underline pt-2 border-t"
      >
        সব চ্যালেঞ্জ দেখো <ArrowRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}
