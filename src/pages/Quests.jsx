import React from 'react';
import { Target, Trophy, Zap, Clock, Star, ArrowRight, Flame, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDailyChallengeExpiry, getWeeklyChallengeExpiry } from '../services/levels';
import { useCountdown } from '../hooks/useCountdown';

const dailyQuests = [
  { icon: Zap, label: '২টি লেসন সম্পন্ন করো', progress: 0, total: 2, xp: 20, gems: 5 },
  { icon: Star, label: '৫০ এক্সপি অর্জন করো', progress: 0, total: 50, xp: 30, gems: 10 },
  { icon: Flame, label: '৩ দিনের স্ট্রিক রক্ষা করো', progress: 0, total: 3, xp: 15, gems: 3 },
];

export default function Quests() {
  const countdown = useCountdown({ daily: getDailyChallengeExpiry, weekly: getWeeklyChallengeExpiry });
  const weeklyProgress = 35;
  const weeklyTotal = 100;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-charcoal">কুয়েস্টস</h1>
          <p className="text-sm text-hare font-medium mt-0.5">ডেইলি ও উইকলি চ্যালেঞ্জ</p>
        </div>
        <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 rounded-xl px-3 py-1.5">
          <Gem className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-black text-cyan-600">0</span>
        </div>
      </div>

      <div className="bg-white border border-wolf rounded-2xl p-4 md:p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-black text-sm text-charcoal">ডেইলি কুয়েস্ট</h2>
          </div>
          {countdown.daily && (
            <span className="text-xs font-bold text-hare flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown.daily}
            </span>
          )}
        </div>
        <div className="space-y-3">
          {dailyQuests.map((quest, i) => (
            <div key={i} className="bg-eel rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white border border-wolf rounded-xl flex items-center justify-center">
                  <quest.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-charcoal">{quest.label}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-wolf rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (quest.progress / quest.total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-hare">
                      {quest.progress}/{quest.total}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-charcoal">+{quest.xp}</p>
                  <p className="text-[10px] text-hare font-bold flex items-center gap-0.5 justify-end mt-0.5">
                    <Gem className="w-3 h-3 text-cyan-500" /> +{quest.gems}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-peacock/5 border border-primary/20 rounded-2xl p-4 md:p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-bee" />
            <h2 className="font-black text-sm text-charcoal">উইকলি চ্যালেঞ্জ</h2>
          </div>
          {countdown.weekly && (
            <span className="text-xs font-bold text-hare flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown.weekly}
            </span>
          )}
        </div>
        <div className="bg-white/80 rounded-xl p-3.5 border border-wolf/50">
          <p className="font-bold text-sm text-charcoal mb-2">৩টি লেসন শেষ করো</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-wolf rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-peacock rounded-full transition-all"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-hare">{weeklyProgress}%</span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-hare font-medium">পুরস্কার:</span>
            <span className="text-xs font-black text-charcoal">+৫০ এক্সপি</span>
            <span className="text-xs font-black text-cyan-600 flex items-center gap-0.5">
              <Gem className="w-3 h-3" /> +২০
            </span>
          </div>
        </div>
      </div>

      <Link
        to="/practice"
        className="flex items-center justify-between bg-primary text-white rounded-2xl p-4 hover:bg-primary-hover transition-all"
      >
        <span className="font-bold text-sm">প্রাক্টিস শুরু করো</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
