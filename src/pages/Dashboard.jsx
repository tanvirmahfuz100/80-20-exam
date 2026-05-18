import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Rocket, CheckList } from '../components/Illustrations';
import LottieAnimation from '../components/LottieAnimation';
import gameControllerAnimation from '../assets/game-controller.json';
import speedometerAnimation from '../assets/speedometer.json';
import particleWaveAnimation from '../assets/particle-wave.json';
import { getChallengeState, getDailyChallengeKey, getWeeklyChallengeKey, getDailyChallengesForExam, getWeeklyChallengeForExam, getDailyChallengeExpiry, getWeeklyChallengeExpiry, getUserStats } from '../services/levels';
import {
  Target, Brain, BookOpen, TrendingUp, ArrowRight,
  Crown, Flame, BadgeCheck, Clock, Zap,
  Star, Gamepad, Gauge, Trophy, Layers, Book, GraduationCap, Library, ScrollText, Sparkles, Calendar, Timer, Target as TargetIcon, Zap as ZapIcon
} from 'lucide-react';

const rankFromAccuracy = (accuracy) => {
  if (accuracy >= 95) return 'Diamond';
  if (accuracy >= 85) return 'Gold';
  if (accuracy >= 70) return 'Silver';
  return 'Bronze';
};

const subjectFromPath = (filePath) => {
  if (!filePath) return 'General';
  const parts = filePath.split('/').filter(Boolean);
  const segments = parts.filter(p => !p.endsWith('.json'));
  if (segments.length === 0) return 'General';

  const examMap = {
    ssc: 'SSC', hsc: 'HSC', iba: 'IBA', bcs: 'BCS', class7: 'Class 7',
  };
  const subjectMap = {
    english: 'English', math: 'Math', analytical: 'Analytical Ability',
    accounting_1st: 'Accounting 1st Paper', accounting_2nd: 'Accounting 2nd Paper',
    finance_1st: 'Finance 1st Paper', finance_2nd: 'Finance 2nd Paper',
    production_1st: 'Production 1st Paper', production_2nd: 'Production 2nd Paper',
    english_2nd: 'English 2nd Paper',
  };

  const examSlug = segments[0];
  const subjectSlug = segments.length >= 2 ? segments[1] : null;

  if (subjectSlug && subjectMap[subjectSlug]) return subjectMap[subjectSlug];
  if (examMap[examSlug]) return examMap[examSlug];

  return subjectSlug
    ? subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1).replace(/-/g, ' ')
    : (examMap[examSlug] || examSlug.charAt(0).toUpperCase() + examSlug.slice(1));
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 2) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const rankColorMap = {
  Bronze: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-500' },
  Silver: { bg: 'bg-slate-300/10', text: 'text-slate-300', icon: 'text-slate-400' },
  Gold: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', icon: 'text-yellow-500' },
  Diamond: { bg: 'bg-cyan-300/10', text: 'text-cyan-300', icon: 'text-cyan-400' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [availableExams, setAvailableExams] = React.useState([]);
  const [statsData, setStatsData] = React.useState({
    totalPracticed: 0, accuracy: 0, totalTimeInMinutes: 0, correctOnes: 0, wrongOnes: 0,
  });
  const [practiceSessions, setPracticeSessions] = React.useState([]);
  const [focusAreas, setFocusAreas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [weeklyChallenge, setWeeklyChallengeState] = useState(null);
  const [userGameStats, setUserGameStats] = useState({ total_xp: 0, total_stars: 0 });
  const [countdown, setCountdown] = useState({ daily: { hours: 0, minutes: 0 }, weekly: { days: 0, hours: 0 } });

  useEffect(() => {
    if (user?.id) setUserGameStats(getUserStats(user.id));
    const examId = 'ssc';
    setDailyChallenges(getDailyChallengesForExam(examId));
    setWeeklyChallengeState(getWeeklyChallengeForExam(examId));

    const tick = () => {
      setCountdown({
        daily: getDailyChallengeExpiry(),
        weekly: getWeeklyChallengeExpiry(),
      });
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [user]);

  React.useEffect(() => {
    api.getUserStats(user.id).then(({ data }) => { if (data) setStatsData(data); setLoading(false); });
  }, [user]);

  React.useEffect(() => {
    api.getUserPracticeSessions(user.id).then(({ data }) => setPracticeSessions(data || []));
  }, [user]);

  React.useEffect(() => {
    api.getUserResponses(user.id).then(({ data: responses }) => {
      if (responses?.length > 0) {
        const grouped = {};
        responses.forEach((r) => {
          const s = subjectFromPath(r.source_file);
          if (!grouped[s]) grouped[s] = { correct: 0, total: 0 };
          grouped[s].total++;
          if (r.is_correct) grouped[s].correct++;
        });
        setFocusAreas(
          Object.entries(grouped)
            .map(([label, { correct, total }]) => {
              const val = Math.round((correct / total) * 100);
              let status, color, tone;
              if (val >= 80) { status = 'Strong'; color = 'bg-accent'; tone = 'text-accent'; }
              else if (val >= 50) { status = 'Building'; color = 'bg-primary'; tone = 'text-primary'; }
              else { status = 'Needs work'; color = 'bg-reward'; tone = 'text-reward'; }
              return { label, status, val, color, tone };
            })
            .sort((a, b) => b.val - a.val)
            .slice(0, 4)
        );
      }
    });
  }, [user]);

  React.useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const exams = [
      { id: 'ssc', label: 'SSC', note: 'NCTB English 1st & 2nd Paper' },
      { id: 'hsc', label: 'HSC', note: 'NCTB English 1st & 2nd Paper' },
      { id: 'iba', label: 'IBA', note: 'Admission English, Math, Analytical' },
      { id: 'bcs', label: 'BCS', note: 'Competitive exam practice' },
      { id: 'class7', label: 'Class 7', note: 'English Grammar' },
    ];
    Promise.all(
      exams.map(async (exam) => {
        try {
          const res = await fetch(`${base}${exam.id}/index.json`);
          if (!res.ok) return { ...exam, active: false };
          const json = await res.json();
          return { ...exam, active: Array.isArray(json.subjects) && json.subjects.length > 0 };
        } catch { return { ...exam, active: false }; }
      })
    ).then(setAvailableExams);
  }, []);

  const totalXp = Number(profile?.total_xp || 0);
  const level = Math.max(1, Math.floor(totalXp / 100) + 1);
  const streak = statsData.totalPracticed > 0
    ? Number(localStorage.getItem('exam_streak_days')) || Math.max(1, Math.min(31, Math.floor(statsData.totalPracticed / 4) + 1))
    : 0;
  const rankLabel = rankFromAccuracy(Number(statsData.accuracy));
  const rankTheme = rankColorMap[rankLabel] || rankColorMap.Bronze;
  const hasEnoughData = statsData.totalPracticed >= 20;
  const username = user?.user_metadata?.username || user?.email || 'Student';
  const recentSessions = practiceSessions.slice(0, 5);
  const progressTo20 = Math.min(statsData.totalPracticed, 20);
  const nextLevelXp = level * 100;
  const xpInLevel = totalXp - (level - 1) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-white/20">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3 pb-20 md:pb-10 max-w-4xl mx-auto">

      {/* ─── Hero Card ─── */}
      <Motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface p-4 md:p-7">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="w-full h-full opacity-[0.12]">
            <LottieAnimation src={particleWaveAnimation} className="w-full h-full" lottieStyle={{ width: '100%', height: '100%', objectFit: 'cover' }} renderer="canvas" />
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-2xs font-black uppercase tracking-[0.2em] text-white/30 mb-1">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </p>
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter truncate">
              {username} <span className="text-primary">· Lv.{level}</span>
            </h1>
          </div>
          <div className={`shrink-0 px-3 py-1.5 rounded-full border border-white/[0.06] ${rankTheme.bg}`}>
            <div className="flex items-center gap-1.5">
              <Trophy className={`w-3.5 h-3.5 ${rankTheme.icon}`} />
              <span className={`text-2xs font-black uppercase tracking-wider ${rankTheme.text}`}>{rankLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <div>
              <p className="text-3xs font-black uppercase tracking-widest text-white/25 leading-none mb-0.5">{streak}d streak</p>
              <p className="text-sm md:text-base font-black text-white leading-none">{totalXp} <span className="text-3xs font-bold text-white/40">XP</span></p>
            </div>
          </div>
          <div className="w-px h-7 bg-white/5" />
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <div>
              <p className="text-3xs font-black uppercase tracking-widest text-white/25 leading-none mb-0.5">Stars</p>
              <p className="text-sm md:text-base font-black text-yellow-400 leading-none">{userGameStats.total_stars}</p>
            </div>
          </div>
          <div className="w-px h-7 bg-white/5" />
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-accent shrink-0" />
            <div>
              <p className="text-3xs font-black uppercase tracking-widest text-white/25 leading-none mb-0.5">Accuracy</p>
              <p className="text-sm md:text-base font-black text-white leading-none">{Math.round(Number(statsData.accuracy))}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/practice"
            className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3.5 text-2xs font-black uppercase tracking-[0.2em] text-black transition-all active:scale-[0.97] shadow-lg shadow-primary/25"
          >
            Start Practice
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/bank"
            className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3.5 text-2xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all active:scale-[0.97]"
          >
            Question Bank
            <Layers className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ─── Level Progress ─── */}
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-3xs font-black uppercase tracking-widest text-white/20">Level {level} · {nextLevelXp} XP target</span>
            <span className="text-3xs font-black text-primary">{xpInLevel}/{nextLevelXp - (level - 1) * 100} XP</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <Motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(xpInLevel / (nextLevelXp - (level - 1) * 100)) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </Motion.div>

      {/* ─── Progress to 20 (new users) ─── */}
      {!hasEnoughData && (
        <Motion.div variants={itemVariants} className="rounded-xl border border-white/[0.05] bg-surface p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Rocket className="w-4 h-4 text-primary shrink-0" />
              <span className="text-2xs font-black uppercase tracking-wider text-white/40 truncate">Unlock full dashboard</span>
            </div>
            <span className="text-xs font-black text-primary shrink-0">{progressTo20}/20</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <Motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(progressTo20 / 20) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {statsData.totalPracticed > 0 && (
            <p className="text-3xs font-medium text-white/20 mt-2">
              {20 - statsData.totalPracticed} more questions to unlock performance reports
            </p>
          )}
        </Motion.div>
      )}

      {/* ─── Stats Grid ─── */}
      <Motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatCard Icon={Crown} label="Level" value={`${level}`} bgClass="bg-yellow-400/10" iconColor="text-yellow-400" />
        <StatCard Icon={Flame} label="Streak" value={`${streak}d`} bgClass="bg-orange-400/10" iconColor="text-orange-400" />
        <StatCard Icon={Zap} label="XP Earned" value={`${totalXp}`} bgClass="bg-primary/10" iconColor="text-primary" />
        <StatCard Icon={BadgeCheck} label="Rank" value={rankLabel} bgClass={rankTheme.bg} iconColor={rankTheme.icon} />
      </Motion.div>

      {/* ─── Quick Actions ─── */}
      <Motion.div variants={itemVariants}>
        <h2 className="text-2xs font-black uppercase tracking-[0.2em] text-white/30 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <ActionCard Icon={Target} title="Practice" desc="Pick an exam & subject" path="/practice" />
          <ActionCard Icon={Brain} title="Question Bank" desc="Search 50,000+" path="/bank" />
          <ActionCard Icon={BookOpen} title="Courses" desc="Video lessons" path="/courses" />
          <ActionCard Icon={TrendingUp} title="Analytics" desc="Track progress" path="/analytics" />
        </div>
      </Motion.div>

      {/* ─── Daily Challenges ─── */}
      {dailyChallenges.length > 0 && (
        <Motion.div variants={itemVariants}>
          <h2 className="text-2xs font-black uppercase tracking-[0.2em] text-white/30 mb-3 flex items-center gap-2">
            <ZapIcon className="w-3.5 h-3.5 text-primary" />
            Daily Missions
            <span className="text-[9px] font-medium text-white/20 normal-case flex items-center gap-1 ml-auto">
              <Timer className="w-3 h-3" />
              {countdown.daily.hours}h {countdown.daily.minutes}m left
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {dailyChallenges.map((ch) => (
              <Link
                key={ch.id}
                to={`/levels?file=${encodeURIComponent(ch.file)}&title=${encodeURIComponent(ch.label)}&chapterId=${ch.chapterId}`}
                className={`relative overflow-hidden rounded-2xl border p-4 transition-all group ${
                  ch.completed
                    ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                    : 'border-white/5 bg-surface hover:border-primary/30 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-black text-white tracking-tight">{ch.label}</h3>
                    <p className="text-[10px] text-white/30 font-medium mt-0.5">Level {ch.levelNumber}</p>
                  </div>
                  {ch.completed ? (
                    <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <TargetIcon className="w-4 h-4 text-primary/40" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                    ch.completed
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {ch.completed ? 'Done' : `+${ch.bonusXp} XP`}
                  </div>
                  {!ch.completed && (
                    <span className="text-[9px] text-white/20 font-medium">Start →</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Motion.div>
      )}

      {/* ─── Weekly Challenge ─── */}
      {weeklyChallenge && (
        <Motion.div variants={itemVariants}>
          <Link
            to="/practice"
            className="relative overflow-hidden rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.04] p-4 md:p-5 hover:bg-yellow-500/[0.07] transition-all group block"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-tight">Weekly: {weeklyChallenge.label}</h3>
                  <p className="text-[10px] text-white/40 font-medium flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {countdown.weekly.days}d {countdown.weekly.hours}h remaining
                  </p>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                weeklyChallenge.completed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {weeklyChallenge.completed ? 'Done' : `+${weeklyChallenge.bonusXp} XP`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <Motion.div
                  className="h-full rounded-full bg-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(weeklyChallenge.completedLevels?.length || 0) / weeklyChallenge.totalLevels * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="text-[10px] font-black tabular-nums text-yellow-400/70 whitespace-nowrap">
                {weeklyChallenge.completedLevels?.length || 0}/{weeklyChallenge.totalLevels}
              </span>
            </div>
            {!weeklyChallenge.completed && (
              <ArrowRight className="absolute bottom-3 right-3 w-4 h-4 text-yellow-500/30 group-hover:text-yellow-500/60 transition-all group-hover:translate-x-0.5" />
            )}
          </Link>
        </Motion.div>
      )}

      {/* ─── Main Content ─── */}
      {hasEnoughData ? (
        <Motion.div variants={itemVariants} className="space-y-4">
          {/* Performance */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-surface p-5 md:p-6">
            <div className="absolute -top-10 -right-10 w-44 h-44 opacity-[0.06] pointer-events-none">
              <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 shrink-0">
                <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
              </div>
              <h2 className="text-xs md:text-sm font-black tracking-tighter text-white">
                Performance
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <CircularProgress value={Math.round(Number(statsData.accuracy))} size={96} strokeWidth={7} />
              <div className="grid grid-cols-3 gap-2 w-full">
                <StatBox label="Questions" value={statsData.totalPracticed} />
                <StatBox label="Correct" value={statsData.correctOnes} accent="text-emerald-400" />
                <StatBox label="Wrong" value={statsData.wrongOnes} accent="text-yellow-300" />
              </div>
            </div>
            {focusAreas.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/[0.04] space-y-3">
                <p className="text-3xs font-black uppercase tracking-[0.25em] text-white/20">Accuracy by subject</p>
                {focusAreas.map((area) => (
                  <div key={area.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xs font-bold text-white/50">{area.label}</span>
                      <span className={`text-3xs font-black uppercase tracking-wider ${area.tone}`}>{area.status} · {area.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <Motion.div
                        className={`h-full rounded-full ${area.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${area.val}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/analytics"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] py-3 text-2xs font-black uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary hover:text-black active:scale-[0.98]"
            >
              Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-white/[0.05] bg-surface p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-xs md:text-sm font-black tracking-tighter text-white mb-3">
              <Clock className="w-4 h-4 text-primary" />
              Recent Activity
            </h2>
            {recentSessions.length > 0 ? (
              <div className="divide-y divide-white/[0.04] -mx-1">
                {recentSessions.map((item) => {
                  const subject = subjectFromPath(item.source_file);
                  const xp = item.correct_answers * 10;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-1 py-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
                        {subject[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white truncate">{item.chapter_title}</p>
                        <p className="text-3xs font-black uppercase tracking-wider text-white/20">{subject} · {timeAgo(item.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-white">{item.correct_answers}/{item.total_questions}</p>
                        <p className="text-3xs font-black uppercase text-reward">+{xp} XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <CheckList className="w-12 h-12 opacity-20 mb-2" />
                <p className="text-2xs font-black uppercase tracking-wider text-white/15">No sessions yet</p>
              </div>
            )}
          </div>
        </Motion.div>
      ) : (
        <Motion.div variants={itemVariants} className="space-y-4">
          {/* Gamify Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-surface p-6 shadow-2xl shadow-black/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-36 h-36 opacity-[0.08] pointer-events-none">
              <LottieAnimation src={gameControllerAnimation} className="w-full h-full" lottieStyle={{ transform: 'scale(1.5)', transformOrigin: 'center center' }} pingPong />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 hidden sm:block overflow-hidden flex items-center justify-center">
                <LottieAnimation src={gameControllerAnimation} className="w-full h-full" lottieStyle={{ transform: 'scale(1.5)', transformOrigin: 'center center' }} pingPong />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                    <Gamepad className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-3xs font-black uppercase tracking-[0.2em] text-primary">New here?</span>
                </div>
                <h2 className="text-base md:text-lg font-black text-white tracking-tighter">Gamify your experience. Earn XP and collect stars.</h2>
                <p className="text-xs text-white/40 font-medium leading-relaxed max-w-lg">
                  Complete questions to earn XP, build streaks, collect stars. Every correct answer gets you closer to the next level.
                </p>
              </div>
            </div>
          </div>

          {/* Launch CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-surface p-6 shadow-2xl shadow-black/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-36 h-36 opacity-[0.06] pointer-events-none">
              <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 hidden sm:block">
                <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-base md:text-lg font-black text-white tracking-tighter">Your dashboard is ready to launch</h2>
                <p className="text-xs text-white/40 font-medium leading-relaxed max-w-lg">
                  Complete <span className="text-primary font-black">20 questions</span> to unlock reports, accuracy tracking, and weak spot analysis.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Accuracy', 'Analysis', 'Weak spots', 'Consistency'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-3xs font-black uppercase tracking-wider text-white/30">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
                  <Link
                    to="/practice"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3 text-2xs font-black uppercase tracking-[0.2em] text-black transition-all active:scale-95 shadow-lg shadow-primary/25"
                  >
                    Start Your First Practice <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <p className="text-3xs text-white/20 font-medium">
                    {statsData.totalPracticed > 0
                      ? `${statsData.totalPracticed} question${statsData.totalPracticed !== 1 ? 's' : ''} completed`
                      : 'No questions attempted yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>
      )}

      {/* ─── Exam Paths ─── */}
      {availableExams.some((e) => e.active) && (
        <Motion.div variants={itemVariants}>
          <h2 className="text-2xs font-black uppercase tracking-[0.2em] text-white/30 mb-3">Available Exams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableExams.map((exam, i) => {
              const themes = [
                { border: 'border-l-primary', accent: 'text-primary', badge: 'bg-primary/20 text-primary', icon: Book },
                { border: 'border-l-reward', accent: 'text-reward', badge: 'bg-reward/20 text-reward', icon: GraduationCap },
                { border: 'border-l-accent', accent: 'text-accent', badge: 'bg-accent/20 text-accent', icon: Library },
                { border: 'border-l-fuchsia-500', accent: 'text-fuchsia-400', badge: 'bg-fuchsia-500/20 text-fuchsia-400', icon: ScrollText },
              ];
              const t = themes[i % themes.length];
              const IconComp = t.icon;
              return exam.active ? (
                <Link
                  key={exam.id}
                  to={`/practice?exam=${exam.id}`}
                  className={`group relative rounded-xl border border-white/[0.05] bg-surface ${t.border} border-l-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className={`w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${t.accent}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white">{exam.label}</h3>
                      </div>
                      <p className="text-2xs font-medium text-white/40 leading-relaxed line-clamp-2">{exam.note}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-3xs font-black uppercase tracking-wider ${t.badge}`}>
                      Open
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-3xs text-white/20 font-medium">{exam.label.toLowerCase()} questions ready</span>
                    <ArrowRight className={`w-3 h-3 ${t.accent} ml-auto transition-transform group-hover:translate-x-0.5`} />
                  </div>
                </Link>
              ) : (
                <div key={exam.id} className="relative rounded-xl border border-white/[0.04] bg-surface p-4 opacity-50 pointer-events-none">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white/50">{exam.label}</h3>
                      </div>
                      <p className="text-2xs font-medium text-white/20 leading-relaxed">{exam.note}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-white/[0.04] text-3xs font-black uppercase tracking-wider text-white/20">
                      Soon
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-3xs text-white/10 font-medium">Coming soon</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Motion.div>
      )}
    </Motion.div>
  );
};

const CircularProgress = ({ value, size = 96, strokeWidth = 7, className = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-white/[0.05]" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl md:text-2xl font-black text-white tracking-tighter">{value}%</span>
        <span className="text-3xs font-black uppercase tracking-[0.15em] text-white/25">Accuracy</span>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars -- used as JSX component
const StatCard = ({ Icon, label, value, bgClass, iconColor }) => (
  <div className="rounded-xl border border-white/[0.05] bg-surface p-3.5 md:p-4 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
    <div className="flex items-center gap-2.5">
      <div className={`rounded-lg p-2 ${bgClass} border border-white/[0.04]`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-3xs font-black uppercase tracking-[0.15em] text-white/25">{label}</p>
        <p className="text-sm md:text-base font-black text-white tracking-tight truncate">{value}</p>
      </div>
    </div>
  </div>
);

// eslint-disable-next-line no-unused-vars -- used as JSX component
const ActionCard = ({ Icon, title, desc, path }) => (
  <Link
    to={path}
    className="rounded-xl border border-white/[0.06] bg-surface p-4 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl active:scale-[0.97] group"
  >
    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
      <Icon className="w-5 h-5 text-white/70" />
    </div>
    <h4 className="text-xs font-black text-white group-hover:text-primary transition-colors">{title}</h4>
    <p className="text-2xs text-white/30 mt-0.5 leading-relaxed">{desc}</p>
  </Link>
);

const StatBox = ({ label, value, accent = 'text-white' }) => (
  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
    <p className={`text-lg md:text-xl font-black tracking-tighter ${accent}`}>{value}</p>
    <p className="text-3xs font-black uppercase tracking-[0.15em] text-white/25 mt-0.5">{label}</p>
  </div>
);

export default Dashboard;
