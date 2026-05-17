import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Brain, Activity, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                const { data } = await api.getUserStats(user.id);
                setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Processing Neuro-Patterns...</p>
        </div>
    );

    const readinessScore = stats ? Math.min(Math.round((stats.accuracy / 100) * 85 + (stats.totalPracticed / 500) * 15), 100) : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Intel Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-4 uppercase">
                        NEURAL <span className="text-primary not-italic">REPORT.</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-500" /> Live Data Synchronization Active
                    </p>
                </div>

                <div className="bg-surface border border-white/5 p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Overall Readiness</p>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter">{readinessScore}%</h3>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                        <svg className="w-12 h-12 -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray={126} strokeDashoffset={126 - (126 * readinessScore) / 100} strokeLinecap="round" />
                        </svg>
                        <Target className="absolute inset-0 m-auto w-4 h-4 text-primary" />
                    </div>
                </div>
            </div>

            {/* Performance Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time Efficiency</span>
                        </div>
                        <div>
                            <h4 className="text-white font-black italic tracking-tighter text-4xl mb-1">{stats?.totalTimeInMinutes || 0}m</h4>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Total Active Learning</p>
                        </div>
                        <div className="h-24 flex items-end gap-2">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/10 rounded-full relative group transition-all hover:bg-primary/30 cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-primary rounded-full transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Consistency</span>
                        </div>
                        <div>
                            <h4 className="text-white font-black italic tracking-tighter text-4xl mb-1">
                                {stats?.totalPracticed || 0}
                            </h4>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Solved Challenges</p>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div key={i} className={`aspect-square rounded-[4px] border ${i < 12 ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/5 opactiy-20'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ML Diagnosis Sidebar */}
                <div className="bg-surface border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Brain size={120} />
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-white italic truncate uppercase">Neural Diagnostics</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">AI-Powered weak area detection</p>
                    </div>

                    <div className="space-y-6">
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

                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Smart Recommendation</h5>
                        <p className="text-[11px] text-white/60 font-medium leading-relaxed italic">
                            "Your accuracy in Geometry is 22% lower than your average. Suggest focusing on <span className="text-white border-b border-primary/40">Circle Properties</span> today."
                        </p>
                    </div>
                </div>
            </div>

            {/* Platform Comparison */}
            <div className="bg-surface border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Platform Rank</h2>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">How you compare to the global cohort</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Batch Avg</p>
                            <p className="text-xl font-black text-white italic">45%</p>
                        </div>
                        <div className="bg-primary/10 px-6 py-4 rounded-2xl border border-primary/20 text-center">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Your Score</p>
                            <p className="text-xl font-black text-primary italic">{stats?.accuracy || 0}%</p>
                        </div>
                    </div>
                </div>

                <div className="h-1 lg:h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                    <div className="h-full bg-red-500/50" style={{ width: '20%' }}></div>
                    <div className="h-full bg-yellow-500/50" style={{ width: '30%' }}></div>
                    <div className="h-full bg-primary shadow-[0_0_20px_#5e6ad2]" style={{ width: `${stats?.accuracy || 0}%` }}></div>
                    <div className="h-full bg-emerald-500/50" style={{ width: `${100 - (stats?.accuracy || 0) - 20 - 30}%` }}></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
