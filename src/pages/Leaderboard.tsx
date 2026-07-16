import React, { useEffect, useState } from 'react';
import { Medal, Trophy, Crown, User, ArrowUp, ArrowDown, Minus, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import type { LeaderboardEntry } from '../types';

const leagueColors = {
  Bronze: { bg: 'bg-surface', border: 'border', text: 'text-text-dim', icon: 'text-text-dim' },
  Silver: { bg: 'bg-surface-hover', border: 'border', text: 'text-text-muted', icon: 'text-text-muted' },
  Gold: { bg: 'bg-surface-hover', border: 'border', text: 'text-text', icon: 'text-text' },
  Diamond: { bg: 'bg-surface', border: 'border', text: 'text-text', icon: 'text-text' },
};

const ChangeIcon = ({ change }: { change: string }) => {
  if (change === 'up') return <ArrowUp className="w-3.5 h-3.5 text-primary" />;
  if (change === 'down') return <ArrowDown className="w-3.5 h-3.5 text-text-dim" />;
  return <Minus className="w-3.5 h-3.5 text-text-dim" />;
};

export default function Leaderboard() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'all-time'>('all-time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.getLeaderboard(period);
      setEntries(data || []);
      setLoading(false);
    })();
  }, [period]);

  const currentUserName = profile?.username || user?.user_metadata?.username || 'You';
  const currentUserEntry = entries.find(e => e.userId === user?.id);
  const currentRank = currentUserEntry ? entries.indexOf(currentUserEntry) + 1 : 0;
  const top10 = entries.slice(0, 10);

  const getLeague = (xp: number) => {
    if (xp >= 5000) return leagueColors.Diamond;
    if (xp >= 2000) return leagueColors.Gold;
    if (xp >= 500) return leagueColors.Silver;
    return leagueColors.Bronze;
  };

  const currentLeague = getLeague(currentUserEntry?.xp || 0);

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border rounded-full mb-3">
          <Medal className="w-5 h-5 text-bee" />
          <span className="font-bold text-sm text-text">লিডারবোর্ড</span>
        </div>
        <h1 className="text-xl font-black text-text">শীর্ষ ব্যবহারকারী</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(['daily', 'weekly', 'all-time'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              period === p ? 'bg-primary text-white' : 'bg-surface border text-text-muted'
            }`}
          >
            {p === 'daily' ? 'দৈনিক' : p === 'weekly' ? 'সাপ্তাহিক' : 'সর্বকাল'}
          </button>
        ))}
      </div>

      <div className={`${currentLeague.bg} ${currentLeague.border} border-2 rounded-2xl p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${currentLeague.text} bn-text`}>
              তোমার লিগ
            </p>
            <p className={`text-lg font-black ${currentLeague.text} mt-0.5`}>
              {currentUserEntry ? `#${currentRank}` : '—'}  {Object.entries(leagueColors).find(([_, v]) => v === currentLeague)?.[0] || 'Bronze'}
            </p>
          </div>
          <Trophy className={`w-10 h-10 ${currentLeague.icon}`} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : top10.length === 0 ? (
        <div className="text-center py-12 text-text-muted font-medium">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>এখনো কোনো ডাটা নেই</p>
          <p className="text-sm mt-1">প্রাক্টিস শুরু করো এবং শীর্ষে উঠো!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {top10.map((entry, idx) => {
            const isMe = entry.userId === user?.id;
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all
                  ${isMe ? 'bg-primary/5 border border-primary/20' : 'bg-surface border hover:border-hare'}`}
              >
                <span className={`w-7 text-center font-black text-sm ${
                  idx < 3 ? 'text-bee' : 'text-hare'
                }`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </span>
                <div className="w-9 h-9 bg-surface-hover rounded-xl flex items-center justify-center font-bold text-sm text-text shrink-0">
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-text truncate">
                    {entry.username}
                    {isMe && <span className="text-primary text-xs ml-1">(তুমি)</span>}
                  </p>
                </div>
                <span className="font-black text-sm text-text">{entry.xp.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}

      {currentRank > 10 && currentUserEntry && (
        <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
          <span className="w-7 text-center font-black text-sm text-hare">{currentRank}</span>
          <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center font-bold text-sm text-primary shrink-0">
            {currentUserName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-text truncate">{currentUserName}</p>
          </div>
          <span className="font-black text-sm text-text">{currentUserEntry.xp.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
