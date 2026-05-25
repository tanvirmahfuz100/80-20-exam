import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Sparkles, Zap
} from 'lucide-react';
import { api } from '../services/localApi';
import { useAuth } from '../context/AuthContext';
import LottieAnimation from '../components/LottieAnimation';
import LoadingScreen from '../components/LoadingScreen';
import dataAnalyticsAnimation from '../assets/data-analytics.json';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
};

const StatCard = ({ icon: Icon, label, value, suffix, subtext, color, trend }) => (
  <motion.div variants={itemVariants} className="bg-surface border rounded-xl p-4 space-y-1.5">
    <div className="flex items-center justify-between">
      <div className={`p-1.5 rounded-lg ${color.bg} border ${color.border}`}>
        <Icon className={`w-3.5 h-3.5 ${color.text}`} />
      </div>
      {trend && (
        <span className={`text-[8px] font-black uppercase tracking-wider ${trend.color}`}>
          {trend.label}
        </span>
      )}
    </div>
    <div className="flex items-baseline gap-0.5">
      <span className="text-2xl md:text-3xl font-black text-text tracking-tighter leading-none">{value}</span>
      {suffix && <span className="text-xs md:text-sm text-text-muted font-bold">{suffix}</span>}
    </div>
    <p className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: color.label || 'rgba(255,255,255,0.3)' }}>
      {subtext || label}
    </p>
  </motion.div>
);

const EmptyStat = ({ icon: Icon, label, message, color }) => (
  <motion.div variants={itemVariants} className="bg-surface border rounded-xl p-4 space-y-2">
    <div className={`p-1.5 rounded-lg ${color.bg} border ${color.border} w-fit`}>
      <Icon className={`w-3.5 h-3.5 ${color.text}`} />
    </div>
    <p className="text-xs font-black text-text uppercase tracking-wider">{label}</p>
    <p className="text-[9px] text-text-muted font-medium leading-relaxed">{message}</p>
  </motion.div>
);

const AccentBar = ({ pct, color }) => (
  <div className="h-1 w-full bg-surface-alt rounded-full overflow-hidden">
    <motion.div
      className={`h-full rounded-full ${color}`}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
);

const Chip = ({ label, color, icon: Icon }) => (
  <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider leading-none flex items-center gap-1 ${color}`}>
    {Icon && <Icon className="w-2 h-2" />}
    {label}
  </span>
);

const Analytics = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [responses, setResponses] = useState([]);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        const [{ data: statsData }, { data: responseRows }, { data: sessionRows }] = await Promise.all([
          api.getUserStats(user.id),
          api.getUserResponses(user.id),
          api.getUserPracticeSessions(user.id)
        ]);

        setStats(statsData);
        setResponses(responseRows || []);
        setPracticeSessions(sessionRows || []);
      }
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const readinessScore = useMemo(() =>
    stats
      ? Math.min(Math.round((Number(stats.accuracy) / 100) * 85 + (stats.totalPracticed / 500) * 15), 100)
      : 0,
    [stats]
  );

  const accuracy = useMemo(() => Number(stats?.accuracy || 0), [stats]);
  const totalPracticed = stats?.totalPracticed || 0;
  const totalTime = stats?.totalTimeInMinutes || 0;
  const correctOnes = stats?.correctOnes || 0;
  const wrongOnes = stats?.wrongOnes || 0;

  const getAccuracyLabel = () => {
    if (accuracy >= 80) return { label: 'চমৎকার', color: 'text-emerald-400' };
    if (accuracy >= 60) return { label: 'ভালো', color: 'text-blue-400' };
    if (accuracy >= 40) return { label: 'মোটামুটি', color: 'text-yellow-400' };
    return { label: 'কাজ বাকি', color: 'text-red-400' };
  };

  const getReadinessLabel = () => {
    if (readinessScore >= 70) return { label: 'প্রস্তুত', color: 'text-emerald-400' };
    if (readinessScore >= 40) return { label: 'গড়ে উঠছে', color: 'text-yellow-400' };
    return { label: 'শুরু হচ্ছে', color: 'text-text-muted' };
  };

  const buildProgressReport = () => ({
    reportGeneratedAt: new Date().toISOString(),
    student: {
      userId: user?.id || null,
      username: profile?.username || user?.user_metadata?.username || null,
      email: user?.email || null
    },
    summary: {
      totalAttempted: totalPracticed,
      correctAnswers: correctOnes,
      wrongAnswers: wrongOnes,
      accuracyPercent: accuracy,
      totalTimeInMinutes: totalTime,
      sessionsCount: practiceSessions.length
    },
    sessions: practiceSessions,
    attempts: responses
  });

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const report = buildProgressReport();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(`progress-report-${stamp}.json`, JSON.stringify(report, null, 2), 'application/json');
  };

  const handleExportCsv = () => {
    const headers = [
      'created_at', 'chapter_title', 'question_id', 'question_text',
      'selected_option_text', 'correct_option_text', 'is_correct', 'time_spent'
    ];

    const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = responses.map((row) => [
      row.created_at, row.chapter_title, row.question_id, row.question_text,
      row.selected_option_text, row.correct_option_text, row.is_correct, row.time_spent
    ]);

    const csv = [headers, ...rows].map((cols) => cols.map(escapeCell).join(',')).join('\n');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(`progress-attempts-${stamp}.csv`, csv, 'text/csv;charset=utf-8');
  };

  if (loading) return <LoadingScreen message="স্ট্যাটস লোড হচ্ছে..." />;

  const accuracyLabel = getAccuracyLabel();
  const readinessLabel = getReadinessLabel();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-5 md:space-y-6"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text tracking-tighter uppercase leading-none">
            অ্যানালিটিক্স
          </h1>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">
            {profile?.username || user?.email || 'শিক্ষার্থী'} &middot; {totalPracticed}টি প্রশ্ন
          </p>
        </div>
        <div className="w-16 h-16 opacity-[0.15] shrink-0">
          <LottieAnimation src={dataAnalyticsAnimation} className="w-full h-full" pingPong />
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={handleExportJson}
            className="px-2.5 py-1.5 rounded-lg bg-surface-alt border text-text-muted hover:text-text text-[8px] font-black uppercase tracking-widest transition-colors"
          >
            JSON
          </button>
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary/60 hover:text-primary text-[8px] font-black uppercase tracking-widest transition-colors"
          >
            CSV
          </button>
        </div>
      </motion.div>

      {/* ── Compact Stat Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {totalPracticed > 0 ? (
          <StatCard
            icon={CheckCircle2}
            label="সমাধান করা চ্যালেঞ্জ"
            value={totalPracticed}
            subtext="চালিয়ে যাও!"
            color={{ bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', label: 'rgba(52,211,153,0.5)' }}
            trend={{ label: `${correctOnes}টি সঠিক`, color: 'text-emerald-400/50' }}
          />
        ) : (
          <EmptyStat
            icon={CheckCircle2}
            label="সমাধান করা চ্যালেঞ্জ"
            message="প্রথম প্রশ্ন সমাধান করে শুরু করো"
            color={{ bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500/50' }}
          />
        )}

        {totalPracticed > 0 ? (
          <StatCard
            icon={Target}
            label="একিউরেসি"
            value={accuracy}
            suffix="%"
            subtext={accuracyLabel.label}
            color={{ bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', label: 'rgba(96,165,250,0.5)' }}
            trend={{ label: accuracyLabel.label, color: accuracyLabel.color }}
          />
        ) : (
          <EmptyStat
            icon={Target}
            label="একিউরেসি"
            message="একিউরেসি দেখতে কিছু প্রশ্নের উত্তর দাও"
            color={{ bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500/50' }}
          />
        )}

        {totalTime > 0 ? (
          <StatCard
            icon={Clock}
            label="শেখার সময়"
            value={totalTime}
            suffix="মি"
            subtext="মোট অ্যাকটিভ লার্নিং"
            color={{ bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', label: 'rgba(192,132,252,0.5)' }}
          />
        ) : (
          <EmptyStat
            icon={Clock}
            label="শেখার সময়"
            message="সময় ট্র্যাক করতে একটি সেশন শুরু করো"
            color={{ bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500/50' }}
          />
        )}

        {totalPracticed > 0 ? (
          <StatCard
            icon={Zap}
            label="প্রস্তুতি"
            value={readinessScore}
            suffix="%"
            subtext={readinessLabel.label}
            color={{ bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', label: 'rgba(251,191,36,0.5)' }}
            trend={{ label: readinessLabel.label, color: readinessLabel.color }}
          />
        ) : (
          <EmptyStat
            icon={Zap}
            label="প্রস্তুতি"
            message="প্রস্তুতি স্কোর বাড়াতে আরো প্রাক্টিস করো"
            color={{ bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500/50' }}
          />
        )}
      </div>

      {/* ── Strengths & Weaknesses + Recommendation ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.div variants={itemVariants} className="bg-surface border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">শক্তিমত্তা</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-start">
            {['Vocabulary', 'Algebra', 'Puzzles'].map(s => (
              <Chip key={s} label={s} color="bg-emerald-500/15 border-emerald-500/25 text-emerald-400" />
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500">দুর্বলতা</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-start">
            {['Geometry', 'Grammar Basics', 'Critical Reasoning'].map(s => (
              <Chip key={s} label={s} color="bg-red-500/15 border-red-500/25 text-red-400" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Smart Recommendation ── */}
      <motion.div variants={itemVariants} className="relative bg-primary/[0.07] rounded-xl border border-primary/30 p-5 md:p-6 space-y-3 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-full" />
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">স্মারট রিকমেন্ডেশন</span>
        </div>
        <p className="text-sm md:text-base text-text font-semibold leading-relaxed italic">
          &ldquo;Your accuracy in Geometry is 22% lower than your average. Try focusing on{' '}
          <span className="text-white border-b-2 border-primary font-bold not-italic">Circle Properties</span> today.&rdquo;
        </p>
      </motion.div>

      {/* ── Platform Rank ── */}
      <motion.div variants={itemVariants} className="bg-surface border rounded-xl p-4 md:p-5 space-y-4">
        <div>
          <h2 className="text-sm md:text-base font-black text-text tracking-tighter uppercase">প্ল্যাটফর্ম র‍্যাংক</h2>
          <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-0.5">অন্যদের সাথে তুলনা</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-surface-alt rounded-xl px-4 py-3 text-center border">
            <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">প্ল্যাটফর্ম গড়</p>
            <p className="text-xl md:text-2xl font-black text-text-muted mt-1">45%</p>
          </div>
          <div className="flex-1 bg-primary/10 rounded-xl px-4 py-3 text-center border border-primary/20">
            <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">তোমার স্কোর</p>
            <p className="text-xl md:text-2xl font-black text-primary mt-1">{accuracy}%</p>
          </div>
        </div>

        <AccentBar pct={accuracy} color="bg-primary" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'বিগিনার', color: 'bg-red-500', value: '২০%' },
            { label: 'ইন্টারমিডিয়েট', color: 'bg-yellow-500', value: '৩০%' },
            { label: 'তুমি', color: 'bg-primary', value: `${accuracy}%` },
            { label: 'এলিট', color: 'bg-emerald-500', value: `${Math.max(0, 100 - accuracy - 50)}%` }
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${l.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">{l.label}</p>
                <p className="text-[8px] font-bold text-text-dim mt-0.5">{l.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
