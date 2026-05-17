import React, { useState, useEffect } from 'react';
import { Timer, ClipboardList, TrendingUp, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MockTests = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            const { data } = await api.getMockTests('IBA'); // Defaulting to IBA for now
            setTests(data || []);
            setLoading(false);
        };
        fetchTests();
    }, []);

    const startTest = (testId) => {
        navigate(`/quiz/${testId}?isMock=true`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Preparing Exam Hall...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="bg-primary/5 border border-primary/20 p-10 md:p-16 rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>

                <div className="relative z-10 space-y-6 max-w-xl">
                    <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
                        SIMULATE THE <span className="text-primary not-italic uppercase">EVENT.</span>
                    </h1>
                    <p className="text-white/40 font-medium text-sm leading-relaxed uppercase tracking-wider">
                        Full-length mock tests designed to mimic real exams. Track your scoring accuracy and time management.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Auto Eval</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Detail Sol</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 bg-surface border border-white/5 p-8 rounded-[2rem] shadow-2xl min-w-[280px]">
                    <div className="flex items-center justify-between mb-8">
                        <TrendingUp className="text-primary w-8 h-8" />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Global Rank</span>
                    </div>
                    <div className="space-y-4">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[75%]"></div>
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Ready for IBA: <span className="text-white italic">75%</span></p>
                    </div>
                </div>
            </div>

            {/* Test Categories */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Full-Length Mocks</h2>
                    <div className="h-px bg-white/5 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tests.length > 0 ? tests.map((test) => (
                        <div key={test.id} className="bg-surface border border-white/5 rounded-[2.5rem] p-8 hover:border-primary/30 transition-all group group relative">
                            {test.is_premium && profile?.plan_type !== 'premium' && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 rounded-[2.5rem] flex items-center justify-center p-8 text-center">
                                    <div className="space-y-4">
                                        <Lock className="w-10 h-10 text-white/20 mx-auto" />
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Premium Content</p>
                                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Upgrade to access full mocks</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
                                        <ClipboardList className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Duration</p>
                                        <p className="text-sm font-black text-white italic">{test.duration_minutes}m</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight mb-2 group-hover:text-primary transition-colors">{test.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                            <Timer className="w-3 h-3 text-emerald-500/50" /> {test.total_questions} Questions
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => startTest(test.id)}
                                    className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    Start Mock Test <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <>
                            {/* Static Mock for Preview if DB is empty */}
                            <div className="bg-surface border border-white/5 rounded-[2.5rem] p-8 opacity-60">
                                <div className="space-y-6 blur-[1px]">
                                    <div className="flex items-start justify-between">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                            <ClipboardList className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="text-right text-white/10">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">Duration</p>
                                            <p className="text-sm font-black italic">120m</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white/20 italic tracking-tight mb-2">IBA FULL MOCK #01</h3>
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/10 uppercase tracking-widest">
                                            <Timer className="w-3 h-3" /> 100 Questions
                                        </div>
                                    </div>
                                    <button className="w-full py-4 bg-white/5 text-white/10 rounded-2xl font-black uppercase tracking-widest text-[9px] cursor-not-allowed">
                                        Mock Coming Soon
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-surface border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs italic">Live Exam Countdown</h4>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Next All-Platform Mock in: <span className="text-primary">12:45:30</span></p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 transition-all shadow-2xl">
                    Register for Event
                </button>
            </div>
        </div>
    );
};

export default MockTests;
