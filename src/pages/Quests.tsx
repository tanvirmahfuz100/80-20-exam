import React, { useEffect, useState } from 'react';
import { Target, Trophy, Zap, Clock, Star, ArrowRight, Flame, Gem, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getChallengeState, getDailyChallengesForExam,
  getWeeklyChallengeForExam,
  getDailyChallengeExpiry, getWeeklyChallengeExpiry,
} from '../services/levels';
import { useCountdown } from '../hooks/useCountdown';
import type { DailyChallenge, WeeklyChallenge } from '../types';

export default function Quests() {
  const { profile } = useAuth();
  const countdown = useCountdown({ daily: getDailyChallengeExpiry, weekly: getWeeklyChallengeExpiry });
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  const examId = (profile?.target_exams || ['hsc'])[0].toLowerCase();

  useEffect(() => {
    const daily = getDailyChallengesForExam(examId);
    const weekly = getWeeklyChallengeForExam(examId);
    setDailyChallenges(daily);
    setWeeklyChallenge(weekly);
    setLoading(false);
  }, [examId]);

  const weeklyProgress = weeklyChallenge
    ? Math.round((weeklyChallenge.completedLevels?.length || 0) / (weeklyChallenge.totalLevels || 1) * 100)
    : 0;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-text">কুয়েস্টস</h1>
          <p className="text-sm text-text-muted font-medium mt-0.5">ডেইলি ও উইকলি চ্যালেঞ্জ</p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface border rounded-xl px-3 py-1.5">
          <Gem className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-black text-cyan-600">{profile?.gems || 0}</span>
        </div>
      </div>

      <div className="bg-surface border rounded-2xl p-4 md:p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-black text-sm text-text">ডেইলি কুয়েস্ট</h2>
          </div>
          {countdown.daily && (
            <span className="text-xs font-bold text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown.daily.hours}h {countdown.daily.minutes}m বাকি
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader className="w-5 h-5 animate-spin text-primary" /></div>
        ) : dailyChallenges.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">আজকের জন্য কোনো চ্যালেঞ্জ নেই</p>
        ) : (
          <div className="space-y-3">
            {dailyChallenges.map((quest, i) => {
              const progress = quest.completed ? quest.bonusXp : 0;
              const total = quest.bonusXp;
              return (
                <div key={quest.id} className="bg-background rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface border rounded-xl flex items-center justify-center">
                      <Zap className={`w-4 h-4 ${quest.completed ? 'text-green-500' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-text">{quest.label}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-wolf rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${quest.completed ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${quest.completed ? 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-text-muted">
                          {quest.completed ? 'সম্পন্ন' : '০%'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-black ${quest.completed ? 'text-green-600' : 'text-text'}`}>
                        {quest.completed ? '✓' : '+'}{quest.bonusXp} এক্সপি
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-peacock/5 border border-primary/20 rounded-2xl p-4 md:p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-bee" />
            <h2 className="font-black text-sm text-text">উইকলি চ্যালেঞ্জ</h2>
          </div>
          {countdown.weekly && (
            <span className="text-xs font-bold text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown.weekly.days} দিন {countdown.weekly.hours} ঘ বাকি
            </span>
          )}
        </div>
        {weeklyChallenge ? (
          <div className="bg-surface/80 rounded-xl p-3.5 border border/50">
            <p className="font-bold text-sm text-text mb-2">{weeklyChallenge.totalLevels}টি লেসন শেষ করো</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-wolf rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-peacock rounded-full transition-all"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-text-muted">{weeklyProgress}%</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-text-muted font-medium">পুরস্কার:</span>
              <span className="text-xs font-black text-text">
                {weeklyChallenge.completed ? '✓ সম্পন্ন' : `+${weeklyChallenge.bonusXp} এক্সপি`}
              </span>
              {weeklyChallenge.completed && (
                <span className="text-xs font-black text-cyan-600 flex items-center gap-0.5">
                  <Gem className="w-3 h-3" /> +২০
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-4">কোনো উইকলি চ্যালেঞ্জ নেই</p>
        )}
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
