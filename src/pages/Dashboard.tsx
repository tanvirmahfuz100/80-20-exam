import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import { Rocket, CheckList } from '../components/Illustrations';
import LottieAnimation from '../components/LottieAnimation';
import LoadingScreen from '../components/LoadingScreen';
import gameControllerAnimation from '../assets/game-controller.json';
import speedometerAnimation from '../assets/speedometer.json';
import particleWaveAnimation from '../assets/particle-wave.json';
import { getChallengeState, getDailyChallengeKey, getWeeklyChallengeKey, getDailyChallengesForExam, getWeeklyChallengeForExam, getDailyChallengeExpiry, getWeeklyChallengeExpiry, getUserStats } from '../services/levels';
import { useCountdown } from '../hooks/useCountdown';
import { useDashboardData } from '../hooks/useDashboardData';
import { getPendingMistakesBySubject } from '../services/review';
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
    business_entrepreneurship: 'Business Entrepreneurship',
    social_2nd: 'Social Work 2nd Paper',
    economics_1st: 'Economics 1st Paper',
    economics_2nd: 'Economics 2nd Paper',
    logic_1st: 'Logic 1st Paper', logic_2nd: 'Logic 2nd Paper',
    management_1st: 'Management 1st Paper',
    management_2nd: 'Management 2nd Paper',
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
  const { statsData, practiceSessions, focusAreas, loading } = useDashboardData(user?.id);
  const countdown = useCountdown({ daily: getDailyChallengeExpiry, weekly: getWeeklyChallengeExpiry });

  const [availableExams, setAvailableExams] = React.useState([]);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [userGameStats, setUserGameStats] = useState({ total_xp: 0, total_stars: 0 });
  const [pendingSubjectGroups, setPendingSubjectGroups] = useState([]);

  useEffect(() => {
    if (user?.id) setUserGameStats(getUserStats(user.id));
    setPendingSubjectGroups(getPendingMistakesBySubject());
    const examId = 'ssc';
    setDailyChallenges(getDailyChallengesForExam(examId));
    setWeeklyChallenge(getWeeklyChallengeForExam(examId));
  }, [user]);

  React.useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const exams = [
      { id: 'ssc', label: 'এসএসসি', note: 'এনসিটিবি ইংরেজি ১ম ও ২য় পত্র' },
      { id: 'hsc', label: 'এইচএসসি', note: 'এনসিটিবি ইংরেজি ১ম ও ২য় পত্র' },
      { id: 'iba', label: 'আইবিএ', note: 'এডমিশন ইংরেজি, গণিত, অ্যানালিটিক্যাল' },
      { id: 'bcs', label: 'বিসিএস', note: 'কম্পিটিটিভ এক্সাম প্রাক্টিস' },
      { id: 'class7', label: 'সপ্তম শ্রেণী', note: 'ইংলিশ গ্রামার' },
    ];
    Promise.all(
      exams.map(async (exam) => {
        try {
          const res = await fetch(`${base}${exam.id}/index.json`);
          if (!res.ok) return { ...exam, active: false };
          const json = await res.json();
          return { ...exam, active: Array.isArray(json.subjects) ? json.subjects.length > 0 : Array.isArray(json) && json.length > 0 };
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

  if (loading) return <LoadingScreen message="Loading dashboard..." />;

  return (
    <Motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3 pb-20 md:pb-10 max-w-4xl mx-auto">

      {/* â”€â”€â”€ Hero Card â”€â”€â”€ */}
      <Motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border bg-surface p-4 md:p-7">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim mb-1 bn-text">
              {new Date().getHours() < 12 ? 'সুপ্রভাত' : new Date().getHours() < 18 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা'}
            </p>
            <h1 className="text-xl md:text-3xl font-black text-text tracking-tighter truncate">
              {username} <span className="text-primary">Â· Lv.{level}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL || '/'}mascot-celebrating.png`}
              alt="Mascot"
              className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-lg"
            />
            <div className={`shrink-0 px-3 py-1.5 rounded-full border ${rankTheme.bg}`}>
              <div className="flex items-center gap-1.5">
                <Trophy className={`w-3.5 h-3.5 ${rankTheme.icon}`} />
                <span className={`text-2xs font-black uppercase tracking-wider ${rankTheme.text}`}>{rankLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <div>
              <p className="text-3xs font-black uppercase tracking-widest text-text-dim leading-none mb-0.5 bn-text">{streak}d স্ট্রিক</p>
              <p className="text-sm md:text-base font-black text-text leading-none">{totalXp} <span className="text-3xs font-bold text-text-muted">XP</span></p>
            </div>
          </div>
          <div className="w-px h-7 bg-surface-alt" />
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <div>
              <p className="text-3xs font-black uppercase tracking-widest text-text-dim leading-none mb-0.5 bn-text">স্টার</p>
              <p className="text-sm md:text-base font-black text-yellow-400 leading-none">{userGameStats.total_stars}</p>
            </div>
          </div>
          <div className="w-px h-7 bg-surface-alt" />
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-accent shrink-0" />
            <div>
              <p className="text-3xs font-black uppercase tracking-widest text-text-dim leading-none mb-0.5 bn-text">একিউরেসি</p>
              <p className="text-sm md:text-base font-black text-text leading-none">{Math.round(Number(statsData.accuracy))}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/practice"
            className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3.5 text-2xs font-black uppercase tracking-[0.2em] text-white transition-all active:scale-[0.97] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] bn-text"
          >
            প্রাক্টিস করো
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/bank"
            className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl border bg-surface-alt hover:bg-surface-alt px-5 py-3.5 text-2xs font-black uppercase tracking-[0.2em] text-text-muted hover:text-text transition-all active:scale-[0.97] bn-text"
          >
            প্রশ্নব্যাংক
            <Layers className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* â”€â”€â”€ Level Progress â”€â”€â”€ */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-3xs font-black uppercase tracking-widest text-text-dim bn-text">লেভেল {level} Â· {nextLevelXp} এক্সপি টার্গেট</span>
            <span className="text-3xs font-black text-primary">{xpInLevel}/{nextLevelXp - (level - 1) * 100} এক্সপি</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
            <Motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(xpInLevel / (nextLevelXp - (level - 1) * 100)) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </Motion.div>

      {/* â”€â”€â”€ Progress to 20 (new users) â”€â”€â”€ */}
      {!hasEnoughData && (
        <Motion.div variants={itemVariants} className="rounded-xl border bg-surface p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Rocket className="w-4 h-4 text-primary shrink-0" />
              <span className="text-2xs font-black uppercase tracking-wider text-text-muted truncate bn-text">ড্যাসবোর্ড আনলক করো</span>
            </div>
            <span className="text-xs font-black text-primary shrink-0">{progressTo20}/20</span>
          </div>
          <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
            <Motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(progressTo20 / 20) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {statsData.totalPracticed > 0 && (
            <p className="text-3xs font-medium text-text-dim mt-2">
              ড্যাসবোর্ড করতে আর বাকি মাত্র {20 - statsData.totalPracticed} টি প্রশ্ন
            </p>
          )}
        </Motion.div>
      )}

      {/* â”€â”€â”€ Stats Grid â”€â”€â”€ */}
      <Motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <StatCard Icon={Crown} label="লেভেল" value={`${level}`} bgClass="bg-yellow-400/10" iconColor="text-yellow-400" />
        <StatCard Icon={Flame} label="স্ট্রিক" value={`${streak}d`} bgClass="bg-orange-400/10" iconColor="text-orange-400" />
        <StatCard Icon={Zap} label="এক্সপি" value={`${totalXp}`} bgClass="bg-primary/10" iconColor="text-primary" />
        <StatCard Icon={BadgeCheck} label="র‍্যাংক" value={rankLabel} bgClass={rankTheme.bg} iconColor={rankTheme.icon} />
        <Link to="/stars" className="block">
          <StatCard Icon={Star} label="পর্যালোচনা" value={`${pendingSubjectGroups.reduce((a, b) => a + b.count, 0)}`} bgClass="bg-yellow-400/10" iconColor="text-yellow-400" />
        </Link>
      </Motion.div>

      {pendingSubjectGroups.length > 0 && (
        <Motion.div variants={itemVariants}>
          <h2 className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim mb-3 bn-text">পর্যালোচনার জন্য সাবজেক্ট</h2>
          <div className="flex flex-wrap gap-2">
            {pendingSubjectGroups.map(g => (
              <Link
                key={g.subject}
                to={`/practice?subject=${encodeURIComponent(g.subject)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-[11px] font-bold text-yellow-400 hover:bg-yellow-400/20 transition-colors"
              >
                <Star className="w-3 h-3" />
                {g.subject} ({g.count})
              </Link>
            ))}
          </div>
        </Motion.div>
      )}

      {/* â”€â”€â”€ Quick Actions â”€â”€â”€ */}
      <Motion.div variants={itemVariants}>
        <h2 className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim mb-3 bn-text">কুইক অ্যাকশন</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <ActionCard Icon={Target} title="প্রাক্টিস" desc="এক্সাম ও সাবজেক্ট বাছাই" path="/practice" />
          <ActionCard Icon={Brain} title="প্রশ্নব্যাংক" desc="৫০,০০০+ প্রশ্ন" path="/bank" />
          <ActionCard Icon={BookOpen} title="কোর্স" desc="ভিডিও লেসন" path="/courses" />
          <ActionCard Icon={TrendingUp} title="অ্যানালিটিক্স" desc="প্রোগ্রেস ট্র্যাক করো" path="/analytics" />
        </div>
      </Motion.div>

      {/* â”€â”€â”€ Daily Challenges â”€â”€â”€ */}
      {dailyChallenges.length > 0 && (
        <Motion.div variants={itemVariants}>
          <h2 className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim mb-3 flex items-center gap-2 bn-text">
            <ZapIcon className="w-3.5 h-3.5 text-primary" />
            ডেইলি মিশন
            <span className="text-[9px] font-medium text-text-dim normal-case flex items-center gap-1 ml-auto">
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
                    : 'border bg-surface hover:border-primary/30 hover:bg-surface-alt'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-black text-text tracking-tight">{ch.label}</h3>
                    <p className="text-[10px] text-text-dim font-medium mt-0.5">লেভেল {ch.levelNumber}</p>
                  </div>
                  {ch.completed ? (
                    <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <TargetIcon className="w-4 h-4 text-primary/40" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bn-text ${
                    ch.completed
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {ch.completed ? 'সম্পন্ন' : `+${ch.bonusXp} এক্সপি`}
                  </div>
                  {!ch.completed && (
                    <span className="text-[9px] text-text-dim font-medium">শুরু করো â†’</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Motion.div>
      )}

      {/* â”€â”€â”€ Weekly Challenge â”€â”€â”€ */}
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
                  <h3 className="text-xs font-black text-text tracking-tight bn-text">সাপ্তাহিক: {weeklyChallenge.label}</h3>
                  <p className="text-[10px] text-text-muted font-medium flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {countdown.weekly.days} dni {countdown.weekly.hours} ঘ বাকি
                  </p>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bn-text ${
                weeklyChallenge.completed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {weeklyChallenge.completed ? 'সম্পন্ন' : `+${weeklyChallenge.bonusXp} এক্সপি`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
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

      {/* â”€â”€â”€ Main Content â”€â”€â”€ */}
      {hasEnoughData ? (
        <Motion.div variants={itemVariants} className="space-y-4">
          {/* Performance */}
          <div className="relative overflow-hidden rounded-2xl border bg-surface p-5 md:p-6">
            <div className="absolute -top-10 -right-10 w-44 h-44 opacity-[0.06] pointer-events-none">
              <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 shrink-0">
                <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
              </div>
              <h2 className="text-xs md:text-sm font-black tracking-tighter text-text bn-text">
                পারফরম্যান্স
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <CircularProgress value={Math.round(Number(statsData.accuracy))} size={96} strokeWidth={7} />
              <div className="grid grid-cols-3 gap-2 w-full">
                <StatBox label="প্রশ্ন" value={statsData.totalPracticed} />
                <StatBox label="সঠিক" value={statsData.correctOnes} accent="text-emerald-400" />
                <StatBox label="ভুল" value={statsData.wrongOnes} accent="text-yellow-300" />
              </div>
            </div>
            {focusAreas.length > 0 && (
              <div className="mt-5 pt-4 border-t space-y-3">
                <p className="text-3xs font-black uppercase tracking-[0.25em] text-text-dim bn-text">সাবজেক্ট অনুযায়ী একিউরেসি</p>
                {focusAreas.map((area) => (
                  <div key={area.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xs font-bold text-text-muted">{area.label}</span>
                      <span className={`text-3xs font-black uppercase tracking-wider ${area.tone}`}>{area.status} Â· {area.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
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
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] py-3 text-2xs font-black uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary hover:text-white active:scale-[0.98] bn-text"
            >
              পূর্ণ রিপোর্ট <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border bg-surface p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-xs md:text-sm font-black tracking-tighter text-text mb-3 bn-text">
              <Clock className="w-4 h-4 text-primary" />
              সাম্প্রতিক অ্যাক্টিভিটি
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
                        <p className="text-xs font-black text-text truncate">{item.chapter_title}</p>
                        <p className="text-3xs font-black uppercase tracking-wider text-text-dim bn-text">{subject} Â· {timeAgo(item.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-text">{item.correct_answers}/{item.total_questions}</p>
                        <p className="text-3xs font-black uppercase text-reward">+{xp} XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <CheckList className="w-12 h-12 opacity-20 mb-2" />
                <p className="text-2xs font-black uppercase tracking-wider text-text-dim bn-text">কোনো সেশন নেই</p>
              </div>
            )}
          </div>
        </Motion.div>
      ) : (
        <Motion.div variants={itemVariants} className="space-y-4">
          {/* Gamify Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-surface p-6">
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
                  <span className="text-3xs font-black uppercase tracking-[0.2em] text-primary bn-text">নতুন?</span>
                </div>
                <h2 className="text-base md:text-lg font-black text-text tracking-tighter bn-text">পড়াশোনাকে করো গেমিফাই! প্রাক্টিস করে পাও এক্সপি, স্টার, স্ট্রেক। বন্ধুদের সাথে পাল্লা দিয়ে আপগ্রেড করো তোমার লেভেল!</h2>
                <p className="text-xs text-text-muted font-medium leading-relaxed max-w-lg">
                  প্রশ্ন সমাধান করে এক্সপি অর্জন করো, স্ট্রিক তৈরি করো, স্টার সংগ্রহ করো। প্রতিটি সঠিক উত্তর তোমাকে পরবর্তী লেভেলে নিয়ে যাবে।
                </p>
              </div>
            </div>
          </div>

          {/* Launch CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-surface p-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-36 h-36 opacity-[0.06] pointer-events-none">
              <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 hidden sm:block">
                <LottieAnimation src={speedometerAnimation} className="w-full h-full" pingPong />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-base md:text-lg font-black text-text tracking-tighter bn-text">তোমার ড্যাসবোর্ড প্রস্তুত!</h2>
                <p className="text-xs text-text-muted font-medium leading-relaxed max-w-lg">
                  আর মাত্র <span className="text-primary font-black">২০টি প্রশ্ন</span> সমাধান করলেই জানতে পারবে তুমি কোথায় দক্ষ, কত সময় নিচ্ছো, আর কোথায় তোমার আরো কাজ করতে হবে।
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['একিউরেসি', 'অ্যানালাইসিস', 'দুর্বলতা', 'কনসিস্টেন্সি'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-alt text-3xs font-black uppercase tracking-wider text-text-dim bn-text">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
                  <Link
                    to="/practice"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3 text-2xs font-black uppercase tracking-[0.2em] text-white transition-all active:scale-95 border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] bn-text"
                  >
                    প্রথম প্রাক্টিস শুরু করো <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <p className="text-3xs text-text-dim font-medium">
                    {statsData.totalPracticed > 0
                      ? `${statsData.totalPracticed}টি প্রশ্ন সম্পন্ন`
                      : 'এখনো কোনো প্রশ্ন করা হয়নি'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>
      )}

      {/* â”€â”€â”€ Exam Paths â”€â”€â”€ */}
      {availableExams.some((e) => e.active) && (
        <Motion.div variants={itemVariants}>
          <h2 className="text-2xs font-black uppercase tracking-[0.2em] text-text-dim mb-3 bn-text">উপলব্ধ এক্সাম</h2>
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
                  className={`group relative rounded-xl border bg-surface ${t.border} border-l-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className={`w-8 h-8 rounded-lg bg-surface-alt border flex items-center justify-center ${t.accent}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter text-text">{exam.label}</h3>
                      </div>
                      <p className="text-2xs font-medium text-text-muted leading-relaxed line-clamp-2">{exam.note}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-3xs font-black uppercase tracking-wider bn-text ${t.badge}`}>
                      খোলো
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
                    <span className="text-3xs text-text-dim font-medium">{exam.label.toLowerCase()} প্রশ্ন প্রস্তুত</span>
                    <ArrowRight className={`w-3 h-3 ${t.accent} ml-auto transition-transform group-hover:translate-x-0.5`} />
                  </div>
                </Link>
              ) : (
                <div key={exam.id} className="relative rounded-xl border bg-surface p-4 opacity-50 pointer-events-none">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-alt border flex items-center justify-center text-text-dim">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter text-text-muted">{exam.label}</h3>
                      </div>
                      <p className="text-2xs font-medium text-text-dim leading-relaxed">{exam.note}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-surface-alt text-3xs font-black uppercase tracking-wider text-text-dim bn-text">
                      শীঘ্রই
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-3xs text-text-dim font-medium">শীঘ্রই আসছে</span>
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-text-dim" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl md:text-2xl font-black text-text tracking-tighter">{value}%</span>
        <span className="text-3xs font-black uppercase tracking-[0.15em] text-text-dim bn-text">একিউরেসি</span>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars -- used as JSX component
const StatCard = ({ Icon, label, value, bgClass, iconColor }) => (
  <div className="rounded-xl border bg-surface p-3.5 md:p-4 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
    <div className="flex items-center gap-2.5">
      <div className={`rounded-lg p-2 ${bgClass} border`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-3xs font-black uppercase tracking-[0.15em] text-text-dim bn-text">{label}</p>
        <p className="text-sm md:text-base font-black text-text tracking-tight truncate">{value}</p>
      </div>
    </div>
  </div>
);

// eslint-disable-next-line no-unused-vars -- used as JSX component
const ActionCard = ({ Icon, title, desc, path }) => (
  <Link
    to={path}
    className="rounded-xl border bg-surface p-4 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl active:scale-[0.97] group"
  >
    <div className="w-10 h-10 rounded-xl bg-surface-alt border flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
      <Icon className="w-5 h-5 text-text" />
    </div>
    <h4 className="text-xs font-black text-text group-hover:text-primary transition-colors">{title}</h4>
    <p className="text-2xs text-text-dim mt-0.5 leading-relaxed">{desc}</p>
  </Link>
);

const StatBox = ({ label, value, accent = 'text-text' }) => (
  <div className="rounded-xl border bg-surface-alt p-3 text-center">
    <p className={`text-lg md:text-xl font-black tracking-tighter ${accent}`}>{value}</p>
                <p className="text-3xs font-black uppercase tracking-[0.15em] text-text-dim mt-0.5 bn-text">{label}</p>
  </div>
);

export default Dashboard;
