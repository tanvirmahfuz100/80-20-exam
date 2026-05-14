import React from 'react';
import { Flame, Target, ArrowRight, TrendingUp, Brain, BookOpen, Coins, Crown, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMistakesDueCount } from '../services/review';
import { api } from '../services/api';
import { Rocket, ChartUp, CheckList } from '../components/Illustrations';

const StatCard = ({ title, value, subtitle, icon: Icon, accentColor }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-5 shadow-lg transition-all hover:-translate-y-0.5 hover:border-white/10 active:scale-[0.98]">
        <div className={`absolute inset-x-0 top-0 h-1 ${accentColor}`} />
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{title}</p>
                <h3 className="mt-1 text-3xl font-black tracking-tighter text-white">{value}</h3>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">{subtitle}</p>
            </div>
            <div className={`rounded-xl border border-white/10 bg-white/5 p-3 ${accentColor}`}>
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
    const coins = getMistakesDueCount() + Math.max(0, Math.floor(statsData.totalPracticed / 2));
    const streak = Number(localStorage.getItem('exam_streak_days') || Math.max(1, Math.min(31, Math.floor(statsData.totalPracticed / 4) + 1)));
    const rankLabel = rankFromAccuracy(statsData.accuracy);

    const stats = [
        { title: 'Level', value: level, subtitle: `${totalXp} XP earned`, icon: Crown, accentColor: 'text-yellow-400' },
        { title: 'Streak', value: `${streak}d`, subtitle: 'Days in a row', icon: Flame, accentColor: 'text-orange-400' },
        { title: 'Coins', value: coins, subtitle: 'Stars collected', icon: Coins, accentColor: 'text-cyan-400' },
        { title: 'Rank', value: rankLabel, subtitle: `${statsData.accuracy}% accuracy`, icon: BadgeCheck, accentColor: 'text-emerald-400' },
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
        <div className="space-y-6 md:space-y-10 pb-4 md:pb-8">
            <div className="grid gap-4 md:gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/5 bg-surface p-6 md:p-10 shadow-xl">
                    <div className="absolute -right-6 -top-6 md:-right-10 md:-top-10 opacity-[0.04] pointer-events-none">
                        <Rocket className="w-40 h-40 md:w-56 md:h-56" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                                <svg className="h-4 w-4 text-reward" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                Learning path
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white">
                                    Keep the streak <span className="text-primary">moving</span>.
                                </h1>
                                <p className="max-w-xl text-sm font-medium leading-relaxed text-white/55 md:text-base">
                                    {user.user_metadata?.username || user.email} is building momentum across practice, mock tests, and ranked sessions.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                {highlightTiles.map((tile) => (
                                    <div key={tile.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:py-4">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35">{tile.label}</p>
                                        <p className={`mt-1 text-base md:text-lg font-black tracking-tight ${tile.tone}`}>{tile.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link
                            to="/practice"
                            className="inline-flex items-center gap-2 self-start rounded-2xl bg-primary px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-black transition-all hover:bg-primary-hover active:scale-95 md:self-auto shadow-lg shadow-primary/20"
                        >
                            Open Practice Hub
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3 md:gap-4 grid-cols-2">
                    {stats.slice(0, 4).map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl font-black tracking-tighter text-white">
                        <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Exam paths
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">SSC / HSC / IBA / BCS</p>
                </div>

                <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
                    {availableExams.map((exam, index) => {
                        const accentColor = [
                            'border-l-primary',
                            'border-l-reward',
                            'border-l-accent',
                            'border-l-fuchsia-400',
                        ][index % 4];

                        return exam.active ? (
                            <Link
                                key={exam.id}
                                to={`/practice?exam=${exam.id}`}
                                className={`group relative overflow-hidden rounded-2xl border border-white/5 border-l-4 ${accentColor} bg-surface p-5 md:p-6 shadow-lg transition-all hover:-translate-y-0.5 hover:border-l-primary/80`}
                            >
                                <div className="mb-6 md:mb-10 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Available</p>
                                        <h3 className="mt-1 text-2xl md:text-3xl font-black tracking-tighter text-white">{exam.label}</h3>
                                    </div>
                                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/5 text-primary transition-transform group-hover:scale-110 shrink-0">
                                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                </div>
                                <p className="text-xs md:text-sm font-medium leading-relaxed text-white/35">{exam.note}</p>
                            </Link>
                        ) : (
                            <div key={exam.id} className="rounded-2xl border border-white/5 bg-surface p-5 md:p-6 opacity-60">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Coming soon</p>
                                <h3 className="mt-1 text-2xl md:text-3xl font-black tracking-tighter text-white">{exam.label}</h3>
                                <p className="mt-4 text-xs md:text-sm font-medium leading-relaxed text-white/20">{exam.note}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.3fr_0.8fr]">
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl font-black tracking-tighter text-white">
                            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            Recent lessons
                        </h2>
                    </div>
                    <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/5 bg-surface shadow-lg">
                        {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between gap-4 p-4 md:p-6 transition-colors hover:bg-white/5 ${idx !== recentActivity.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                <div className="flex min-w-0 items-center gap-4 md:gap-5">
                                    <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl md:rounded-2xl border border-white/5 bg-white/5 text-lg md:text-xl font-black tracking-tighter text-primary">
                                        {item.subject[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="truncate text-base md:text-xl font-black tracking-tight text-white">{item.topic}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{item.subject} &bull; {item.time}</p>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="block text-lg md:text-2xl font-black tracking-tighter text-white">{item.score}/{item.total}</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-reward">+{item.xp} XP</span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 md:py-16 px-6">
                                <CheckList className="w-24 h-24 md:w-32 md:h-32 opacity-30 mb-4" />
                                <p className="text-white/15 font-black uppercase tracking-widest text-xs text-center">No lessons yet. Start practicing!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <h2 className="flex items-center gap-2 md:gap-3 px-1 text-lg md:text-2xl font-black tracking-tighter text-white">
                        <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Study focus
                    </h2>
                    <div className="space-y-4 md:space-y-5 rounded-2xl md:rounded-3xl border border-white/5 bg-surface p-5 md:p-7 shadow-lg">
                        <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none hidden md:block">
                            <ChartUp className="w-32 h-32" />
                        </div>
                        {[
                            { label: 'Vocabulary', status: 'Needs more stars', val: 32, color: 'bg-reward', tone: 'text-reward' },
                            { label: 'Geometry', status: 'Building pace', val: 54, color: 'bg-primary', tone: 'text-primary' },
                            { label: 'Analytical', status: 'Strong streak', val: 88, color: 'bg-accent', tone: 'text-accent' },
                        ].map((area) => (
                            <div key={area.label}>
                                <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em]">
                                    <span className="text-white/40">{area.label}</span>
                                    <span className={area.tone}>{area.status}</span>
                                </div>
                                <div className="h-1.5 md:h-2 overflow-hidden rounded-full border border-white/5 bg-white/5">
                                    <div className={`h-full ${area.color} rounded-full transition-all duration-1000`} style={{ width: `${area.val}%` }} />
                                </div>
                            </div>
                        ))}

                        <button className="mt-2 md:mt-4 w-full rounded-xl md:rounded-2xl border border-primary/20 bg-primary/10 py-3 md:py-4 text-[10px] font-black uppercase tracking-[0.25em] text-primary transition-all active:scale-95 hover:bg-primary hover:text-black">
                            See full report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
