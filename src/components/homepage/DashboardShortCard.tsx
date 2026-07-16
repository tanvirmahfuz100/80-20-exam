import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { getUserStats } from '../../services/levels';
import {
  Trophy, Flame, Star, Gauge, Zap, ArrowRight, Crown,
} from 'lucide-react';

const rankFromAccuracy = (accuracy: number) => {
  if (accuracy >= 95) return 'Diamond';
  if (accuracy >= 85) return 'Gold';
  if (accuracy >= 70) return 'Silver';
  return 'Bronze';
};

const rankColorMap: Record<string, { bg: string; text: string; icon: string }> = {
  Bronze: { bg: 'bg-surface', text: 'text-text-dim', icon: 'text-text-dim' },
  Silver: { bg: 'bg-surface', text: 'text-text-muted', icon: 'text-text-muted' },
  Gold: { bg: 'bg-surface-hover', text: 'text-text', icon: 'text-text' },
  Diamond: { bg: 'bg-surface-hover', text: 'text-text', icon: 'text-text' },
};

export default function DashboardShortCard() {
  const { user, profile } = useAuth();
  const { statsData, loading } = useDashboardData(user?.id);
  const userGameStats = user?.id ? getUserStats(user.id) : { total_xp: 0, total_stars: 0 };

  if (loading) return null;

  const totalXp = Number(profile?.total_xp || 0) || userGameStats.total_xp || 0;
  const level = Math.max(1, Math.floor(totalXp / 100) + 1);
  const streak = statsData.totalPracticed > 0
    ? Number(localStorage.getItem('exam_streak_days')) || Math.max(1, Math.min(31, Math.floor(statsData.totalPracticed / 4) + 1))
    : 0;
  const rankLabel = rankFromAccuracy(Number(statsData.accuracy));
  const rankTheme = rankColorMap[rankLabel] || rankColorMap.Bronze;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-surface p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-sm text-text">ড্যাশবোর্ড সারাংশ</h2>
        <Link
          to="/dashboard"
          className="text-2xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          পূর্ণ রিপোর্ট <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Crown className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <p className="text-lg font-black text-text">{level}</p>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">লেভেল</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <p className="text-lg font-black text-text">{streak}d</p>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">স্ট্রিক</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-lg font-black text-text">{totalXp}</p>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">এক্সপি</p>
        </div>
        <div className="text-center">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${rankTheme.bg} mb-1`}>
            <Trophy className={`w-3 h-3 ${rankTheme.icon}`} />
            <span className={`text-[9px] font-black uppercase tracking-wider ${rankTheme.text}`}>{rankLabel}</span>
          </div>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">র‍্যাংক</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs font-bold text-text">{userGameStats.total_stars} স্টার</span>
        </div>
        <div className="w-px h-4 bg-wolf" />
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-bold text-text">{Math.round(Number(statsData.accuracy))}% একিউরেসি</span>
        </div>
      </div>
    </motion.div>
  );
}
