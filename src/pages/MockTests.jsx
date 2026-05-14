import React, { useState, useEffect } from 'react';
import { Timer, ClipboardList, TrendingUp, Lock, ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Preparing exam hall...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-12">
            <div className="relative flex flex-col items-center justify-between gap-10 overflow-hidden rounded-[3rem] border border-white/5 bg-gradient-to-br from-primary/20 via-surface to-surface p-10 md:flex-row md:p-16">
                <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-reward/15 blur-[100px]" />
                <div className="absolute -bottom-12 right-0 h-72 w-72 rounded-full bg-accent/10 blur-[110px]" />

                <div className="relative z-10 max-w-xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                        <Sparkles className="h-4 w-4 text-reward" />
                        Timed challenge mode
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white italic leading-none md:text-6xl">
                        SIMULATE THE <span className="text-primary not-italic uppercase">EVENT.</span>
                    </h1>
                    <p className="text-sm font-medium uppercase tracking-wider leading-relaxed text-white/40">
                        Full-length mock tests that keep the pressure on while still feeling rewarding.
                    </p>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Auto Eval</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-reward" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Detail Sol</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 min-w-[280px] rounded-[2rem] border border-white/5 bg-surface p-8 shadow-2xl">
                    <div className="mb-8 flex items-center justify-between">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Global Rank</span>
                    </div>
                    <div className="space-y-4">
                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full w-[75%] bg-primary" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                            Ready for IBA: <span className="italic text-white">75%</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="whitespace-nowrap text-2xl font-black uppercase tracking-tighter text-white italic">Full-Length Mocks</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {tests.length > 0 ? tests.map((test) => (
                        <div key={test.id} className="group relative rounded-[2.5rem] border border-white/5 bg-surface p-8 transition-all hover:-translate-y-1 hover:border-primary/30">
                            {test.is_premium && profile?.plan_type !== 'premium' && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[2.5rem] bg-black/40 p-8 text-center backdrop-blur-[2px]">
                                    <div className="space-y-4">
                                        <Lock className="mx-auto h-10 w-10 text-white/20" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Premium Content</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Upgrade to access full mocks</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/5 bg-white/5 transition-colors group-hover:bg-primary/10">
                                        <ClipboardList className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-right">
                                        <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Duration</p>
                                        <p className="text-sm font-black italic text-white">{test.duration_minutes}m</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-2 text-xl font-black tracking-tight text-white italic transition-colors group-hover:text-primary">{test.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                                            <Timer className="h-3 w-3 text-primary/50" /> {test.total_questions} Questions
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => startTest(test.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-primary py-4 text-[9px] font-black uppercase tracking-widest text-black shadow-xl shadow-primary/20 transition-all active:scale-95 hover:bg-primary-hover"
                                >
                                    Start Mock Test <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="rounded-[2.5rem] border border-white/5 bg-surface p-8 opacity-60">
                            <div className="space-y-6 blur-[1px]">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/5 bg-white/5">
                                        <ClipboardList className="h-6 w-6 text-white/20" />
                                    </div>
                                    <div className="text-right text-white/10">
                                        <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em]">Duration</p>
                                        <p className="text-sm font-black italic">120m</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-black tracking-tight text-white/20 italic">IBA FULL MOCK #01</h3>
                                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/10">
                                        <Timer className="h-3 w-3" /> 100 Questions
                                    </div>
                                </div>
                                <button className="w-full cursor-not-allowed rounded-[1.4rem] bg-white/5 py-4 text-[9px] font-black uppercase tracking-widest text-white/10">
                                    Mock Coming Soon
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border border-white/5 bg-surface p-8 md:flex-row">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black italic uppercase tracking-widest text-white">Live Exam Countdown</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            Next All-Platform Mock in: <span className="text-primary">12:45:30</span>
                        </p>
                    </div>
                </div>
                <button className="rounded-[1.4rem] bg-white px-10 py-4 text-[10px] font-black uppercase tracking-widest text-black shadow-2xl transition-all hover:scale-105">
                    Register for Event
                </button>
            </div>
        </div>
    );
};

export default MockTests;
