import React, { useState, useEffect } from 'react';
import { Timer, ClipboardList, TrendingUp, Lock, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Target, Trophy } from '../components/Illustrations';
import LoadingScreen from '../components/LoadingScreen';

const MockTests = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            const { data } = await api.getMockTests('IBA');
            setTests(data || []);
            setLoading(false);
        };

        fetchTests();
    }, []);

    const startTest = (testId) => {
        navigate(`/quiz/${testId}?isMock=true`);
    };

    if (loading) return <LoadingScreen message="Preparing exam hall..." />;

    return (
        <div className="mx-auto max-w-7xl space-y-8 md:space-y-12">
            <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl md:rounded-3xl border border-white/5 bg-surface p-6 md:p-16 shadow-xl">
                <div className="absolute -right-6 md:-right-12 -top-6 md:-top-12 opacity-[0.03] pointer-events-none">
                    <Trophy className="w-40 h-40 md:w-64 md:h-64" />
                </div>

                <div className="relative z-10 max-w-xl space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                        <Star className="h-4 w-4 text-reward fill-current" />
                        Timed challenge mode
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
                        SIMULATE THE <span className="text-primary">EVENT.</span>
                    </h1>
                    <p className="text-xs md:text-sm font-medium uppercase tracking-wider leading-relaxed text-white/40">
                        Full-length mock tests that keep the pressure on while still feeling rewarding.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Auto Eval</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-reward fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Detail Sol</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full md:min-w-[240px] md:max-w-xs rounded-2xl border border-white/5 bg-surface/80 p-4 md:p-8 shadow-lg">
                    <div className="mb-6 flex items-center justify-between">
                        <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Global Rank</span>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full w-[75%] bg-primary rounded-full" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                            Ready for IBA: <span className="text-white">75%</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="whitespace-nowrap text-lg md:text-2xl font-black uppercase tracking-tighter text-white">Full-Length Mocks</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {tests.length > 0 ? tests.map((test) => (
                        <div key={test.id} className="group relative rounded-2xl md:rounded-[2.5rem] border border-white/5 bg-surface p-6 md:p-8 transition-all hover:-translate-y-0.5 hover:border-primary/30 active:scale-[0.98]">
                            {test.is_premium && profile?.plan_type !== 'premium' && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl md:rounded-[2.5rem] bg-black/60 p-8 text-center">
                                    <div className="space-y-4">
                                        <Lock className="mx-auto h-8 w-8 md:h-10 md:w-10 text-white/20" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Premium Content</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Upgrade to access full mocks</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-[1.4rem] border border-white/5 bg-white/5 transition-colors group-hover:bg-primary/10">
                                        <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                    </div>
                                    <div className="text-right">
                                        <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Duration</p>
                                        <p className="text-sm font-black text-white">{test.duration_minutes}m</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-lg md:text-xl font-black tracking-tight text-white transition-colors group-hover:text-primary">{test.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                                            <Timer className="h-3 w-3 text-primary/50" /> {test.total_questions} Questions
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => startTest(test.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl md:rounded-[1.4rem] bg-primary py-3 md:py-4 text-[9px] font-black uppercase tracking-widest text-black border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px] transition-all active:scale-95 hover:bg-primary-hover"
                                >
                                    Start Mock Test <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="rounded-2xl md:rounded-[2.5rem] border border-white/5 bg-surface p-6 md:p-8 opacity-60">
                            <div className="space-y-5 blur-[1px]">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-[1.4rem] border border-white/5 bg-white/5">
                                        <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-white/20" />
                                    </div>
                                    <div className="text-right text-white/10">
                                        <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em]">Duration</p>
                                        <p className="text-sm font-black">120m</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-lg md:text-xl font-black tracking-tight text-white/20">IBA FULL MOCK #01</h3>
                                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/10">
                                        <Timer className="h-3 w-3" /> 100 Questions
                                    </div>
                                </div>
                                <button className="w-full cursor-not-allowed rounded-xl md:rounded-[1.4rem] bg-white/5 py-3 md:py-4 text-[9px] font-black uppercase tracking-widest text-white/10">
                                    Mock Coming Soon
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 rounded-2xl md:rounded-[2.5rem] border border-white/5 bg-surface p-6 md:p-8">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Live Exam Countdown</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            Next All-Platform Mock in: <span className="text-primary">12:45:30</span>
                        </p>
                    </div>
                </div>
                <button className="w-full md:w-auto rounded-xl md:rounded-[1.4rem] bg-primary px-8 md:px-10 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest text-black shadow-lg transition-all active:scale-95 hover:bg-primary-hover">
                    Register for Event
                </button>
            </div>
        </div>
    );
};

export default MockTests;
