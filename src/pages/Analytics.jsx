import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target, TrendingUp, AlertTriangle, CheckCircle2,
  Brain, Activity, Download, Clock, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LottieAnimation from '../components/LottieAnimation';
import dataAnalyticsAnimation from '../assets/data-analytics.json';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

const ReadinessGauge = ({ score }) => {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * score) / 100;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 bg-surface border border-white/5 rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-3.5 shrink-0"
    >
      <div className="relative w-11 h-11 md:w-16 md:h-16 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/[0.04]" />
          <motion.circle
            cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4"
            className="text-primary" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Target className="w-3 h-3 md:w-4 md:h-4 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30 leading-none mb-0.5">Readiness</p>
        <h3 className="text-lg md:text-2xl lg:text-3xl font-black text-white tracking-tighter leading-none">{score}%</h3>
      </div>
    </motion.div>
  );
};

const ExportGroup = ({ onJson, onCsv }) => (
  <div className="flex bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl p-0.5 shrink-0">
    <button
      onClick={onJson}
      className="px-2.5 md:px-4 py-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white/50 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 active:scale-95 touch-target"
    >
      <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
      <span className="hidden sm:inline">JSON</span>
    </button>
    <div className="w-px bg-white/10 my-1.5" />
    <button
      onClick={onCsv}
      className="px-2.5 md:px-4 py-2 rounded-lg md:rounded-xl hover:bg-primary/10 text-primary/60 hover:text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 active:scale-95 touch-target"
    >
      <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
      <span className="hidden sm:inline">CSV</span>
    </button>
  </div>
);

const barHeights = [40, 70, 45, 90, 65, 80, 55];

const ActivityChart = () => (
  <div className="h-20 md:h-24 flex items-end gap-1.5 md:gap-2">
    {barHeights.map((h, i) => (
      <div key={i} className="flex-1 bg-primary/5 rounded-full relative group transition-all hover:bg-primary/20 cursor-pointer">
        <motion.div
          className="absolute bottom-0 w-full bg-gradient-to-t from-primary/90 to-primary/60 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 text-[8px] font-black text-white/80 px-1.5 py-0.5 rounded">
          {h}%
        </div>
      </div>
    ))}
  </div>
);

const ChallengeGrid = ({ filled }) => (
  <div className="grid grid-cols-7 gap-1.5">
    {Array.from({ length: 28 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: i * 0.02 }}
        className={`aspect-square rounded-[3px] border transition-all ${
          i < filled
            ? 'bg-emerald-500/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
            : 'bg-white/[0.03] border-white/[0.06]'
        }`}
      />
    ))}
  </div>
);

const SmartRecommendation = () => (
  <div className="relative bg-gradient-to-r from-primary/[0.07] to-transparent rounded-xl border border-primary/20 p-4 space-y-2 overflow-hidden">
    <div className="absolute inset-y-0 left-0 w-0.5 bg-primary rounded-full" />
    <div className="flex items-center gap-1.5">
      <Sparkles className="w-3 h-3 text-primary" />
      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Smart Recommendation</h5>
    </div>
    <p className="text-xs text-white/70 font-medium leading-relaxed">
      &ldquo;Your accuracy in Geometry is 22% lower than your average. Suggest focusing on{' '}
      <span className="text-white border-b border-primary/40 font-semibold">Circle Properties</span> today.&rdquo;
    </p>
  </div>
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

  const filledCells = useMemo(() =>
    totalPracticed > 0 ? Math.min(Math.round((totalPracticed / 200) * 28), 28) : 0,
    [totalPracticed]
  );

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
      <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Processing Neuro-Patterns...</p>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-5 md:space-y-7"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-1 uppercase leading-none">
            Neural <span className="text-primary">Report</span>
          </h1>
          <p className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Data Sync Active
          </p>
        </div>

        <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
          <ReadinessGauge score={readinessScore} />
          <ExportGroup onJson={handleExportJson} onCsv={handleExportCsv} />
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Time Efficiency */}
          <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              </div>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Time Efficiency</span>
            </div>
            <div>
              <h4 className="text-white font-black tracking-tighter text-3xl md:text-4xl leading-none">{totalTime}<span className="text-lg md:text-xl text-white/30 ml-0.5">m</span></h4>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Total Active Learning</p>
            </div>
            <ActivityChart />
          </motion.div>

          {/* Solved Challenges */}
          <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              </div>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Consistency</span>
            </div>
            <div>
              <h4 className="text-white font-black tracking-tighter text-3xl md:text-4xl leading-none">{totalPracticed}</h4>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Solved Challenges</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[8px] font-bold text-white/20 uppercase tracking-wider">
                <span>Last 28 days</span>
                <span>{filledCells}/28 active</span>
              </div>
              <ChallengeGrid filled={filledCells} />
            </div>
          </motion.div>
        </div>

        {/* Right column (1/3) — Neural Diagnostics */}
        <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 opacity-[0.05] pointer-events-none hidden md:block">
            <LottieAnimation src={dataAnalyticsAnimation} className="w-full h-full" pingPong />
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-black text-white uppercase tracking-tight">Neural Diagnostics</h3>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none mt-0.5">AI-Powered Analysis</p>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2.5">
              <TrendingUp className="w-3 h-3" /> Core Strengths
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Vocabulary', 'Algebra', 'Puzzles'].map(s => (
                <span key={s} className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-lg text-[10px] font-black uppercase tracking-wider text-emerald-400 leading-none">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Weaknesses */}
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 mb-2.5">
              <AlertTriangle className="w-3 h-3" /> Vulnerable Areas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Geometry', 'Grammar Basics', 'Critical Reasoning'].map(w => (
                <span key={w} className="px-2.5 py-1 bg-red-500/15 border border-red-500/25 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-400 leading-none">
                  {w}
                </span>
              ))}
            </div>
          </div>

          <SmartRecommendation />
        </motion.div>
      </div>

      {/* ── Platform Rank ── */}
      <motion.div variants={itemVariants} className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">Platform Rank</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">How you compare to the global cohort</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/5 text-center min-w-[100px]">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Batch Avg</p>
              <p className="text-xl md:text-2xl font-black text-white leading-none">45%</p>
            </div>
            <div className="bg-primary/10 px-4 py-3 rounded-xl border border-primary/20 text-center min-w-[100px]">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Your Score</p>
              <p className="text-xl md:text-2xl font-black text-primary leading-none">{accuracy}%</p>
            </div>
          </div>
        </div>

        {/* Rank bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500/60 to-red-400/40 rounded-l-full"
              initial={{ width: 0 }} animate={{ width: '20%' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500/60 to-yellow-400/40"
              initial={{ width: 0 }} animate={{ width: '30%' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/30 relative"
              initial={{ width: 0 }} animate={{ width: `${accuracy}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500/40 to-emerald-400/60 rounded-r-full"
              initial={{ width: 0 }} animate={{ width: `${Math.max(0, 100 - accuracy - 50)}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-white/15 uppercase tracking-wider">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Beginner', color: 'from-red-500 to-red-400', value: '20%' },
            { label: 'Intermediate', color: 'from-yellow-500 to-yellow-400', value: '30%' },
            { label: 'Advanced (You)', color: 'from-primary to-primary-hover', value: `${accuracy}%` },
            { label: 'Elite', color: 'from-emerald-500 to-emerald-400', value: `${Math.max(0, 100 - accuracy - 50)}%` }
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${l.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest truncate leading-none mb-0.5">{l.label}</p>
                <p className="text-[9px] font-bold text-white/20">{l.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
