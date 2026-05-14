import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Brain, Activity, Download } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChartUp, Trophy } from '../components/Illustrations';

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

    const buildProgressReport = () => {
        const reportGeneratedAt = new Date().toISOString();

        return {
            reportGeneratedAt,
            student: {
                userId: user?.id || null,
                username: profile?.username || user?.user_metadata?.username || null,
                email: user?.email || null
            },
            summary: {
                totalAttempted: stats?.totalPracticed || 0,
                correctAnswers: stats?.correctOnes || 0,
                wrongAnswers: stats?.wrongOnes || 0,
                accuracyPercent: Number(stats?.accuracy || 0),
                totalTimeInMinutes: stats?.totalTimeInMinutes || 0,
                sessionsCount: practiceSessions.length
            },
            sessions: practiceSessions,
            attempts: responses
        };
    };

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
            'created_at',
            'chapter_title',
            'question_id',
            'question_text',
            'selected_option_text',
            'correct_option_text',
            'is_correct',
            'time_spent'
        ];

        const escapeCell = (value) => {
            const text = String(value ?? '').replace(/"/g, '""');
            return `"${text}"`;
        };

        const rows = responses.map((row) => [
            row.created_at,
            row.chapter_title,
            row.question_id,
            row.question_text,
            row.selected_option_text,
            row.correct_option_text,
            row.is_correct,
            row.time_spent
        ]);

        const csv = [headers, ...rows].map((cols) => cols.map(escapeCell).join(',')).join('\n');
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadFile(`progress-attempts-${stamp}.csv`, csv, 'text/csv;charset=utf-8');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Processing Neuro-Patterns...</p>
        </div>
    );

    const readinessScore = stats ? Math.min(Math.round((stats.accuracy / 100) * 85 + (stats.totalPracticed / 500) * 15), 100) : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
                <div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-3 md:mb-4 uppercase">
                        NEURAL <span className="text-primary">REPORT.</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-500" /> Live Data Synchronization Active
                    </p>
                </div>

                <div className="bg-surface border border-white/5 p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-lg">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Overall Readiness</p>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">{readinessScore}%</h3>
                    </div>
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                        <svg className="w-10 h-10 md:w-12 md:h-12 -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray={126} strokeDashoffset={126 - (126 * readinessScore) / 100} strokeLinecap="round" />
                        </svg>
                        <Target className="absolute inset-0 m-auto w-3 h-3 md:w-4 md:h-4 text-primary" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                    <button
                        onClick={handleExportJson}
                        className="px-4 md:px-5 py-3 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export JSON</span>
                        <span className="sm:hidden">JSON</span>
                    </button>
                    <button
                        onClick={handleExportCsv}
                        className="px-4 md:px-5 py-3 rounded-xl md:rounded-2xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">CSV</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-surface border border-white/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-500/10 rounded-xl md:rounded-2xl border border-blue-500/20">
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time Efficiency</span>
                        </div>
                        <div>
                            <h4 className="text-white font-black tracking-tighter text-3xl md:text-4xl mb-1">{stats?.totalTimeInMinutes || 0}m</h4>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Total Active Learning</p>
                        </div>
                        <div className="h-20 md:h-24 flex items-end gap-1.5 md:gap-2">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/5 rounded-full relative group transition-all hover:bg-primary/20 cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-primary rounded-full transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Consistency</span>
                        </div>
                        <div>
                            <h4 className="text-white font-black tracking-tighter text-3xl md:text-4xl mb-1">
                                {stats?.totalPracticed || 0}
                            </h4>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Solved Challenges</p>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div key={i} className={`aspect-square rounded-[3px] md:rounded-[4px] border ${i < 12 ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/5'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 space-y-6 md:space-y-8 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 opacity-[0.03] pointer-events-none hidden md:block">
                        <Brain size={120} />
                    </div>

                    <div>
                        <h3 className="text-lg md:text-xl font-black text-white uppercase">Neural Diagnostics</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">AI-Powered weak area detection</p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                <span className="text-emerald-500 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Core Strengths</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Vocabulary', 'Algebra', 'Puzzles'].map(s => (
                                    <span key={s} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                <span className="text-red-500 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Vulnerable Areas</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Geometry', 'Grammar Basics', 'Critical Reasoning'].map(w => (
                                    <span key={w} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-400">
                                        {w}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-6 bg-primary/5 rounded-xl md:rounded-2xl border border-primary/20 space-y-2">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Smart Recommendation</h5>
                        <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                            &ldquo;Your accuracy in Geometry is 22% lower than your average. Suggest focusing on <span className="text-white border-b border-primary/40">Circle Properties</span> today.&rdquo;
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-14 shadow-lg space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-1">Platform Rank</h2>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">How you compare to the global cohort</p>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                        <div className="bg-white/5 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Batch Avg</p>
                            <p className="text-lg md:text-xl font-black text-white">45%</p>
                        </div>
                        <div className="bg-primary/10 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-primary/20 text-center">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Your Score</p>
                            <p className="text-lg md:text-xl font-black text-primary">{stats?.accuracy || 0}%</p>
                        </div>
                    </div>
                </div>

                <div className="h-1.5 md:h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                    <div className="h-full bg-red-500/50 rounded-full" style={{ width: '20%' }}></div>
                    <div className="h-full bg-yellow-500/50 rounded-full" style={{ width: '30%' }}></div>
                    <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(94,106,210,0.5)]" style={{ width: `${stats?.accuracy || 0}%` }}></div>
                    <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: `${Math.max(0, 100 - (stats?.accuracy || 0) - 20 - 30)}%` }}></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Beginner', color: 'bg-red-500' },
                        { label: 'Intermediate', color: 'bg-yellow-500' },
                        { label: 'Advanced', color: 'bg-primary' },
                        { label: 'Elite', color: 'bg-emerald-500' }
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
