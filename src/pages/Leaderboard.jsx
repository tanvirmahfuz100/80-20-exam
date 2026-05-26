import React from 'react';
import { Medal, Trophy, Crown, User, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const leagueColors = {
  Bronze: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: 'text-amber-500' },
  Silver: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600', icon: 'text-slate-400' },
  Gold: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'text-yellow-500' },
  Sapphire: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'text-blue-500' },
  Ruby: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: 'text-red-500' },
  Emerald: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-500' },
  Diamond: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', icon: 'text-cyan-500' },
};

const mockLeaderboard = [
  { rank: 1, name: 'Rafiq', xp: 2840, avatar: 'R', change: 'up' },
  { rank: 2, name: 'Jamal', xp: 2510, avatar: 'J', change: 'up' },
  { rank: 3, name: 'Karim', xp: 2230, avatar: 'K', change: 'down' },
  { rank: 4, name: 'Hasan', xp: 1980, avatar: 'H', change: 'same' },
  { rank: 5, name: 'Farhana', xp: 1750, avatar: 'F', change: 'up' },
  { rank: 6, name: 'Tanvir', xp: 1520, avatar: 'T', change: 'down' },
  { rank: 7, name: 'Shamim', xp: 1340, avatar: 'S', change: 'same' },
  { rank: 8, name: 'Nusrat', xp: 1100, avatar: 'N', change: 'up' },
];

const ChangeIcon = ({ change }) => {
  if (change === 'up') return <ArrowUp className="w-3.5 h-3.5 text-primary" />;
  if (change === 'down') return <ArrowDown className="w-3.5 h-3.5 text-cardinal" />;
  return <Minus className="w-3.5 h-3.5 text-hare" />;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const currentLeague = leagueColors.Gold;
  const currentUser = { name: user?.user_metadata?.username || 'You', xp: 1520, avatar: 'Y', rank: 6 };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border rounded-full mb-3">
          <Medal className="w-5 h-5 text-bee" />
          <span className="font-bold text-sm text-text">এই সপ্তাহে</span>
        </div>
        <h1 className="text-xl font-black text-text">লিডারবোর্ড</h1>
      </div>

      <div className={`${currentLeague.bg} ${currentLeague.border} border-2 rounded-2xl p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${currentLeague.text} bn-text`}>
              বর্তমান লিগ
            </p>
            <p className={`text-lg font-black ${currentLeague.text} mt-0.5`}>
              {Object.entries(leagueColors).find(([_, v]) => v === currentLeague)?.[0] || 'Gold'} লিগ
            </p>
          </div>
          <Trophy className={`w-10 h-10 ${currentLeague.icon}`} />
        </div>
      </div>

      <div className="space-y-1">
        {mockLeaderboard.map((entry) => {
          const isMe = entry.name === currentUser.name;
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${isMe ? 'bg-primary/5 border border-primary/20' : 'bg-surface border hover:border-hare'}`}
            >
              <span className={`w-7 text-center font-black text-sm ${
                entry.rank <= 3 ? 'text-bee' : 'text-hare'
              }`}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
              </span>
              <div className="w-9 h-9 bg-surface-hover rounded-xl flex items-center justify-center font-bold text-sm text-text shrink-0">
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-text truncate">
                  {entry.name}
                  {isMe && <span className="text-primary text-xs ml-1">(তুমি)</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-text">{entry.xp.toLocaleString()}</span>
                <ChangeIcon change={entry.change} />
              </div>
            </div>
          );
        })}
      </div>

      {currentUser.rank > 8 && (
        <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
          <span className="w-7 text-center font-black text-sm text-hare">{currentUser.rank}</span>
          <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center font-bold text-sm text-primary shrink-0">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-text truncate">{currentUser.name}</p>
          </div>
          <span className="font-black text-sm text-text">{currentUser.xp.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
