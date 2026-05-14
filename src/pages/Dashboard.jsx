import React from 'react';
import { Flame, Star, Target, Clock, ArrowRight, TrendingUp, Brain, Zap, BookOpen, Coins, Crown, Sparkles, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { api } from '../services/api';

const StatCard = ({ title, value, subtitle, icon: Icon, accent }) => (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/5 bg-surface p-5 shadow-xl transition-all hover:-translate-y-1 hover:border-white/10">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
        <div className="absolute -right-6 -bottom-8 opacity-10 transition-opacity group-hover:opacity-20">
            <Icon size={100} />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{title}</p>
                <h3 className="mt-2 text-3xl font-black tracking-tighter text-white italic">{value}</h3>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">{subtitle}</p>
            </div>
            <div className={`rounded-2xl border border-white/10 bg-white/5 p-3 text-white shadow-lg ${accent}`}> 
                <Icon className="w-5 h-5" />
            </div>
        </div>
    </div>
);

const rankFromAccuracy = (accuracy) => {
    if (accuracy >= 95) return 'Diamond';
    if (accuracy >= 85) return 'Gold';
    if (accuracy >= 70) return 'Silver';
    return 'Bronze';
};

const Dashboard = () => {
    const { user, profile } = useAuth();
    const [availableExams, setAvailableExams] = React.useState([]);
    const [statsData, setStatsData] = React.useState({
        totalPracticed: 0,
        accuracy: 0,
        totalTimeInMinutes: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            const { data } = await api.getUserStats(user.id);
            if (data) setStatsData(data);
            setLoading(false);
        };
        fetchStats();
    }, [user]);

    React.useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const exams = [
            { id: 'ssc', label: 'SSC', note: 'NCTB English 1st and 2nd Paper' },
            { id: 'hsc', label: 'HSC', note: 'NCTB English 1st and 2nd Paper' },
            { id: 'iba', label: 'IBA', note: 'Admission English, Math, Analytical' },
            { id: 'bcs', label: 'BCS', note: 'Competitive exam practice' }
        ];

        Promise.all(exams.map(async (exam) => {
            try {
                const res = await fetch(`${base}${exam.id}/index.json`);
                if (!res.ok) return { ...exam, active: false };
                const json = await res.json();
                return { ...exam, active: Array.isArray(json.subjects) && json.subjects.length > 0 };
            } catch {
                return { ...exam, active: false };
            }
        })).then(setAvailableExams);
    }, []);

    const totalXp = Number(profile?.total_xp || 0);
    const level = Math.max(1, Math.floor(totalXp / 100) + 1);
    const coins = Number(localStorage.getItem('quiz_star_balance') || 0) + Math.max(0, Math.floor(statsData.totalPracticed / 2));
    const streak = Number(localStorage.getItem('exam_streak_days') || Math.max(1, Math.min(31, Math.floor(statsData.totalPracticed / 4) + 1)));
    const rankLabel = rankFromAccuracy(statsData.accuracy);

    const stats = [
        { title: 'Level', value: level, subtitle: `${totalXp} XP earned`, icon: Crown, accent: 'from-yellow-400 to-amber-500 text-black' },
        { title: 'Streak', value: `${streak}d`, subtitle: 'Days in a row', icon: Flame, accent: 'from-orange-400 to-red-400 text-black' },
        { title: 'Coins', value: coins, subtitle: 'Stars collected', icon: Coins, accent: 'from-cyan-400 to-sky-500 text-black' },
        { title: 'Rank', value: rankLabel, subtitle: `${statsData.accuracy}% accuracy`, icon: BadgeCheck, accent: 'from-emerald-400 to-lime-500 text-black' },
    ];

    const recentActivity = [
        { id: 1, topic: 'Algebra Basics', subject: 'Math', score: 8, total: 10, time: '2h ago', xp: 80 },
        { id: 2, topic: 'Sentence Correction', subject: 'English', score: 12, total: 15, time: '5h ago', xp: 120 },
        { id: 3, topic: 'Critical Reasoning', subject: 'Analytical', score: 5, total: 5, time: 'Yesterday', xp: 50 },
    ];

    const highlightTiles = [
        { label: 'Focus today', value: `${statsData.totalPracticed || 0} questions`, tone: 'text-yellow-300' },
        { label: 'Best pace', value: `${statsData.totalTimeInMinutes || 0}m tracked`, tone: 'text-cyan-300' },
        { label: 'Current rank', value: rankLabel, tone: 'text-emerald-300' },
    ];

    return (
        <div className="space-y-10 pb-8">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-primary/20 via-surface to-surface p-8 md:p-10 shadow-2xl">
                    <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-reward/20 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                                <Sparkles className="h-4 w-4 text-reward" />
                                Learning path
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black tracking-tighter text-white italic md:text-6xl">
                                    Keep the streak <span className="text-primary not-italic">moving</span>.
                                </h1>
                                <p className="max-w-xl text-sm font-medium leading-relaxed text-white/55 md:text-base">
                                    {user.user_metadata?.username || user.email} is building momentum across practice, mock tests, and ranked sessions.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {highlightTiles.map((tile) => (
                                    <div key={tile.label} className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35">{tile.label}</p>
                                        <p className={`mt-2 text-lg font-black tracking-tight ${tile.tone}`}>{tile.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link
                            to="/practice"
                            className="inline-flex items-center gap-3 self-start rounded-[1.5rem] bg-primary px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-black transition-all hover:scale-[1.02] active:scale-95 md:self-auto"
                        >
                            Open Practice Hub
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-3 text-2xl font-black tracking-tighter text-white italic">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Exam paths
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">SSC / HSC / IBA / BCS</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {availableExams.map((exam, index) => {
                        const accentBand = [
                            'from-primary/80 to-primary',
                            'from-reward/80 to-reward',
                            'from-accent/80 to-cyan-400',
                            'from-fuchsia-400/80 to-violet-500',
                        ][index % 4];

                        return exam.active ? (
                            <Link
                                key={exam.id}
                                to={`/practice?exam=${exam.id}`}
                                className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-surface p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-primary/30"
                            >
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBand}`} />
                                <div className="mb-10 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Available</p>
                                        <h3 className="mt-2 text-3xl font-black tracking-tighter text-white italic">{exam.label}</h3>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-primary transition-transform group-hover:scale-110">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-white/35">{exam.note}</p>
                            </Link>
                        ) : (
                            <div key={exam.id} className="rounded-[2rem] border border-white/5 bg-surface p-6 opacity-60">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Coming soon</p>
                                <h3 className="mt-2 text-3xl font-black tracking-tighter text-white italic">{exam.label}</h3>
                                <p className="mt-4 text-sm font-medium leading-relaxed text-white/20">{exam.note}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="flex items-center gap-3 text-2xl font-black tracking-tighter text-white italic">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            Recent lessons
                        </h2>
                    </div>
                    <div className="overflow-hidden rounded-[2.3rem] border border-white/5 bg-surface shadow-2xl">
                        {recentActivity.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between gap-6 p-6 transition-colors hover:bg-white/5 ${idx !== recentActivity.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                <div className="flex min-w-0 items-center gap-5">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] border border-white/5 bg-white/5 text-xl font-black tracking-tighter text-primary">
                                        {item.subject[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="truncate text-xl font-black tracking-tight text-white italic">{item.topic}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{item.subject} • {item.time}</p>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="block text-2xl font-black tracking-tighter text-white italic">{item.score}/{item.total}</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-reward">+{item.xp} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="flex items-center gap-3 px-1 text-2xl font-black tracking-tighter text-white italic">
                        <Brain className="h-6 w-6 text-primary" />
                        Study focus
                    </h2>
                    <div className="space-y-5 rounded-[2.3rem] border border-white/5 bg-surface p-7 shadow-2xl">
                        {[
                            { label: 'Vocabulary', status: 'Needs more stars', val: 32, color: 'bg-reward', tone: 'text-reward' },
                            { label: 'Geometry', status: 'Building pace', val: 54, color: 'bg-primary', tone: 'text-primary' },
                            { label: 'Analytical', status: 'Strong streak', val: 88, color: 'bg-accent', tone: 'text-accent' },
                        ].map((area) => (
                            <div key={area.label}>
                                <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em]">
                                    <span className="text-white/40">{area.label}</span>
                                    <span className={area.tone}>{area.status}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-white/5">
                                    <div className={`h-full ${area.color} rounded-full transition-all duration-1000`} style={{ width: `${area.val}%` }} />
                                </div>
                            </div>
                        ))}

                        <button className="mt-4 w-full rounded-[1.4rem] border border-primary/20 bg-primary/10 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-primary transition-all hover:bg-primary hover:text-black">
                            See full report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
