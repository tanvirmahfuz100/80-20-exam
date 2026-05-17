import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Sparkles, Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LottieAnimation from '../components/LottieAnimation';
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
  <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-xl p-4 space-y-1.5">
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
      <span className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">{value}</span>
      {suffix && <span className="text-xs md:text-sm text-white/30 font-bold">{suffix}</span>}
    </div>
    <p className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: color.label || 'rgba(255,255,255,0.3)' }}>
      {subtext || label}
    </p>
  </motion.div>
);

const EmptyStat = ({ icon: Icon, label, message, color }) => (
  <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-xl p-4 space-y-2">
    <div className={`p-1.5 rounded-lg ${color.bg} border ${color.border} w-fit`}>
      <Icon className={`w-3.5 h-3.5 ${color.text}`} />
    </div>
    <p className="text-xs font-black text-white/90 uppercase tracking-wider">{label}</p>
    <p className="text-[9px] text-white/30 font-medium leading-relaxed">{message}</p>
  </motion.div>
);

const AccentBar = ({ pct, color }) => (
  <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
    <motion.div
      className={`h-full rounded-full ${color}`}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
);

const Chip = ({ label, color, icon: Icon }) => (
  <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider leading-none flex items-center gap-1 ${color}`}>
    {Icon && <Icon className="w-2.5 h-2.5" />}
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
    if (accuracy >= 80) return { label: 'Excellent', color: 'text-emerald-400' };
    if (accuracy >= 60) return { label: 'Good', color: 'text-blue-400' };
    if (accuracy >= 40) return { label: 'Fair', color: 'text-yellow-400' };
    return { label: 'Needs work', color: 'text-red-400' };
  };

  const getReadinessLabel = () => {
    if (readinessScore >= 70) return { label: 'Ready', color: 'text-emerald-400' };
    if (readinessScore >= 40) return { label: 'Building', color: 'text-yellow-400' };
    return { label: 'Getting started', color: 'text-white/30' };
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Loading your stats...</p>
    </div>
  );

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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
            Analytics
          </h1>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">
            {profile?.username || user?.email || 'Student'} &middot; {practiceSessions.length} sessions
          </p>
        </div>
        <div className="w-16 h-16 opacity-[0.15] shrink-0">
          <LottieAnimation src={dataAnalyticsAnimation} className="w-full h-full" pingPong />
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={handleExportJson}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white text-[8px] font-black uppercase tracking-widest transition-colors"
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
            label="Solved Challenges"
            value={totalPracticed}
            subtext="Keep going!"
            color={{ bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', label: 'rgba(52,211,153,0.5)' }}
            trend={{ label: `${correctOnes} correct`, color: 'text-emerald-400/50' }}
          />
        ) : (
          <EmptyStat
            icon={CheckCircle2}
            label="Solved Challenges"
            message="Solve your first question to get started"
            color={{ bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500/50' }}
          />
        )}

        {totalPracticed > 0 ? (
          <StatCard
            icon={Target}
            label="Accuracy"
            value={accuracy}
            suffix="%"
            subtext={accuracyLabel.label}
            color={{ bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', label: 'rgba(96,165,250,0.5)' }}
            trend={{ label: accuracyLabel.label, color: accuracyLabel.color }}
          />
        ) : (
          <EmptyStat
            icon={Target}
            label="Accuracy"
            message="Answer some questions to see your accuracy"
            color={{ bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500/50' }}
          />
        )}

        {totalTime > 0 ? (
          <StatCard
            icon={Clock}
            label="Learning Time"
            value={totalTime}
            suffix="m"
            subtext="Total active learning"
            color={{ bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', label: 'rgba(192,132,252,0.5)' }}
          />
        ) : (
          <EmptyStat
            icon={Clock}
            label="Learning Time"
            message="Start a session to begin tracking your time"
            color={{ bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500/50' }}
          />
        )}

        {totalPracticed > 0 ? (
          <StatCard
            icon={Zap}
            label="Readiness"
            value={readinessScore}
            suffix="%"
            subtext={readinessLabel.label}
            color={{ bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', label: 'rgba(251,191,36,0.5)' }}
            trend={{ label: readinessLabel.label, color: readinessLabel.color }}
          />
        ) : (
          <EmptyStat
            icon={Zap}
            label="Readiness"
            message="Practice more to build your readiness score"
            color={{ bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500/50' }}
          />
        )}
      </div>

      {/* ── Strengths & Weaknesses + Recommendation ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Strengths</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Vocabulary', 'Algebra', 'Puzzles'].map(s => (
              <Chip key={s} label={s} color="bg-emerald-500/15 border-emerald-500/25 text-emerald-400" />
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Vulnerable Areas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Geometry', 'Grammar Basics', 'Critical Reasoning'].map(s => (
              <Chip key={s} label={s} color="bg-red-500/15 border-red-500/25 text-red-400" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Smart Recommendation ── */}
      <motion.div variants={itemVariants} className="relative bg-gradient-to-r from-primary/[0.07] to-transparent rounded-xl border border-primary/20 p-4 space-y-2 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-0.5 bg-primary rounded-full" />
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Recommendation</span>
        </div>
        <p className="text-xs text-white/70 font-medium leading-relaxed">
          &ldquo;Your accuracy in Geometry is 22% lower than your average. Try focusing on{' '}
          <span className="text-white border-b border-primary/40 font-semibold">Circle Properties</span> today.&rdquo;
        </p>
      </motion.div>

      {/* ── Platform Rank ── */}
      <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-xl p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm md:text-base font-black text-white tracking-tighter uppercase">Platform Rank</h2>
            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">How you compare to others</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/5 px-3 py-2 rounded-lg border border-white/5 text-center min-w-[70px]">
              <p className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none mb-0.5">Avg</p>
              <p className="text-base md:text-lg font-black text-white leading-none">45%</p>
            </div>
            <div className="bg-primary/10 px-3 py-2 rounded-lg border border-primary/20 text-center min-w-[70px]">
              <p className="text-[7px] font-black text-primary uppercase tracking-widest leading-none mb-0.5">You</p>
              <p className="text-base md:text-lg font-black text-primary leading-none">{accuracy}%</p>
            </div>
          </div>
        </div>

        <AccentBar pct={accuracy} color="bg-gradient-to-r from-primary to-primary-hover" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Beginner', color: 'bg-red-500', value: '20%' },
            { label: 'Intermediate', color: 'bg-yellow-500', value: '30%' },
            { label: 'You', color: 'bg-primary', value: `${accuracy}%` },
            { label: 'Elite', color: 'bg-emerald-500', value: `${Math.max(0, 100 - accuracy - 50)}%` }
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${l.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest truncate leading-none">{l.label}</p>
                <p className="text-[7px] font-bold text-white/20">{l.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
