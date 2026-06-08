import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowRight, User, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/localApi';
import type { LeaderboardEntry } from '../../types';

const leagueColors: Record<string, { bg: string; text: string; icon: string }> = {
  Bronze: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-500' },
  Silver: { bg: 'bg-slate-300/10', text: 'text-slate-300', icon: 'text-slate-400' },
  Gold: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', icon: 'text-yellow-500' },
  Diamond: { bg: 'bg-cyan-300/10', text: 'text-cyan-300', icon: 'text-cyan-400' },
};

function getLeague(xp: number) {
  if (xp >= 5000) return leagueColors.Diamond;
  if (xp >= 2000) return leagueColors.Gold;
  if (xp >= 500) return leagueColors.Silver;
  return leagueColors.Bronze;
}

const topThreeIcons = [Crown, Medal, Medal];

export default function LeaderboardCard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'all-time'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.getLeaderboard(period);
      setEntries(data?.slice(0, 5) || []);
      setLoading(false);
    })();
  }, [period]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-surface p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-sm text-text">লিডারবোর্ড</h2>
        <Link
          to="/leaderboard"
          className="text-2xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          সব দেখো <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-1 mb-4">
        {(['daily', 'weekly', 'all-time'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              period === p
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-text-muted hover:text-text'
            }`}
          >
            {p === 'daily' ? 'দৈনিক' : p === 'weekly' ? 'সাপ্তাহিক' : 'সর্বকাল'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader className="w-5 h-5 animate-spin text-text-muted" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6 font-medium">কোনো ডেটা নেই</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isMe = entry.userId === user?.id;
            const league = getLeague(entry.xp);
            const TopIcon = index < 3 ? topThreeIcons[index] : null;

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  isMe ? 'bg-primary/5 border border-primary/15' : 'hover:bg-surface-alt'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-surface-alt border flex items-center justify-center shrink-0">
                  {index === 0 ? (
                    <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <span className="text-[10px] font-black text-text-muted">{index + 1}</span>
                  )}
                </div>
                <div className="w-7 h-7 rounded-full bg-surface-alt border flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text truncate">
                    {entry.username || 'Anonymous'}
                    {isMe && <span className="text-primary ml-1">(তুমি)</span>}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded-md ${league.bg}`}>
                  <span className={`text-[10px] font-black ${league.text}`}>{entry.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
