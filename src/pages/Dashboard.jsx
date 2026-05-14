import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Rocket, CheckList } from '../components/Illustrations';
import {
    Target, Brain, BookOpen, TrendingUp, ArrowRight,
    Crown, Flame, BadgeCheck, Clock, HelpCircle, Zap, BarChart3, Info
} from 'lucide-react';

const rankFromAccuracy = (accuracy) => {
    if (accuracy >= 95) return 'Diamond';
    if (accuracy >= 85) return 'Gold';
    if (accuracy >= 70) return 'Silver';
    return 'Bronze';
};

const subjectFromPath = (filePath) => {
    if (!filePath) return 'General';
    const parts = filePath.split('/');
    const subjectPart = parts[2] || '';
    const map = {
        'english': 'English',
        'math': 'Math',
        'analytical': 'Analytical Ability',
    };
    return map[subjectPart] || subjectPart.charAt(0).toUpperCase() + subjectPart.slice(1);
};

const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const CircularProgress = ({ value, size = 120, strokeWidth = 8, className = '' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-white/5"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">{value}%</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mt-0.5">Accuracy</span>
            </div>
        </div>
    );
};

const MetricPill = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-surface px-3.5 py-2.5 md:px-4 md:py-3">
        <div className={`rounded-lg p-1.5 ${color} shrink-0`}>
            <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{label}</p>
            <p className="text-sm md:text-base font-black text-white tracking-tight truncate">{value}</p>
        </div>
    </div>
);

const QuickActionCard = ({ icon: Icon, title, desc, path }) => (
    <Link
        to={path}
        className="group flex items-center gap-3 md:gap-4 rounded-xl border border-white/5 bg-surface p-3.5 md:p-5 transition-all hover:-translate-y-0.5 hover:border-white/10 active:scale-[0.98]"
    >
        <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
            <h4 className="text-xs md:text-sm font-black text-white group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-[10px] md:text-xs text-white/40 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/20 shrink-0 group-hover:text-primary transition-colors" />
    </Link>
);

const Dashboard = () => {
    const { user, profile } = useAuth();
    const [availableExams, setAvailableExams] = React.useState([]);
    const [statsData, setStatsData] = React.useState({
        totalPracticed: 0,
        accuracy: 0,
        totalTimeInMinutes: 0,
        correctOnes: 0,
        wrongOnes: 0,
    });
    const [practiceSessions, setPracticeSessions] = React.useState([]);
    const [focusAreas, setFocusAreas] = React.useState([]);
    const [showExplanations, setShowExplanations] = React.useState(false);
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
        const fetchSessions = async () => {
            const { data } = await api.getUserPracticeSessions(user.id);
            setPracticeSessions(data || []);
        };
        fetchSessions();
    }, [user]);

    React.useEffect(() => {
        const fetchFocusAreas = async () => {
            const { data: responses } = await api.getUserResponses(user.id);
            if (responses && responses.length > 0) {
                const grouped = {};
                responses.forEach((r) => {
                    const subject = subjectFromPath(r.source_file);
                    if (!grouped[subject]) grouped[subject] = { correct: 0, total: 0 };
                    grouped[subject].total++;
                    if (r.is_correct) grouped[subject].correct++;
                });
                const areas = Object.entries(grouped)
                    .map(([label, { correct, total }]) => {
                        const accuracy = (correct / total) * 100;
                        let status, color, tone;
                        if (accuracy >= 80) { status = 'Strong'; color = 'bg-accent'; tone = 'text-accent'; }
                        else if (accuracy >= 50) { status = 'Building'; color = 'bg-primary'; tone = 'text-primary'; }
                        else { status = 'Needs work'; color = 'bg-reward'; tone = 'text-reward'; }
                        return { label, status, val: Math.round(accuracy), color, tone };
                    })
                    .sort((a, b) => b.val - a.val)
                    .slice(0, 4);
                setFocusAreas(areas);
            }
        };
        fetchFocusAreas();
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
    const streak = statsData.totalPracticed > 0
        ? Number(localStorage.getItem('exam_streak_days')) || Math.max(1, Math.min(31, Math.floor(statsData.totalPracticed / 4) + 1))
        : 0;
    const rankLabel = rankFromAccuracy(Number(statsData.accuracy));

    const hasEnoughData = statsData.totalPracticed >= 20;
    const username = user?.user_metadata?.username || user?.email || 'Student';

    const quickActions = [
        { icon: Target, title: 'Start Practicing', desc: 'Pick an exam and subject', path: '/practice' },
        { icon: Brain, title: 'Question Bank', desc: 'Search 50,000+ questions', path: '/bank' },
        { icon: BookOpen, title: 'Video Courses', desc: 'Watch from top instructors', path: '/courses' },
        { icon: TrendingUp, title: 'Track Progress', desc: 'View accuracy & weak areas', path: '/analytics' },
    ];

    const recentSessions = practiceSessions.slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-white/20">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 md:space-y-8 pb-6 md:pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter">
                        {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, <span className="text-primary">{username}</span>
                    </h1>
                    <p className="text-xs md:text-sm text-white/40 font-medium mt-1">
                        {hasEnoughData
                            ? 'Here\'s your performance overview. Keep the momentum going.'
                            : 'Start practicing to unlock your personalized dashboard.'}
                    </p>
                </div>
                <Link
                    to="/practice"
                    className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20 shrink-0"
                >
                    Start Practice
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                <MetricPill icon={Crown} label="Level" value={`${level}`} color="bg-yellow-400/10 text-yellow-400" />
                <MetricPill icon={Flame} label="Streak" value={`${streak}d`} color="bg-orange-400/10 text-orange-400" />
                <MetricPill icon={Zap} label="XP" value={`${totalXp}`} color="bg-primary/10 text-primary" />
                <MetricPill icon={BadgeCheck} label="Rank" value={rankLabel} color="bg-emerald-400/10 text-emerald-400" />
            </div>

            {hasEnoughData ? (
                <div className="grid gap-5 md:gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                    <div className="space-y-4 md:space-y-5">
                        <h2 className="flex items-center gap-2 text-sm md:text-lg font-black tracking-tighter text-white px-0.5">
                            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Performance Report
                        </h2>

                        <div className="rounded-2xl border border-white/5 bg-surface p-5 md:p-7 shadow-lg">
                            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                                <CircularProgress value={Math.round(Number(statsData.accuracy))} size={130} strokeWidth={9} className="shrink-0" />
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 md:p-4 text-center">
                                        <p className="text-2xl md:text-3xl font-black text-white tracking-tighter">{statsData.totalPracticed}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Questions</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 md:p-4 text-center">
                                        <p className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tighter">{statsData.correctOnes}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Correct</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 md:p-4 text-center">
                                        <p className="text-2xl md:text-3xl font-black text-red-400 tracking-tighter">{statsData.wrongOnes}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Wrong</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 md:p-4 text-center">
                                        <p className="text-2xl md:text-3xl font-black text-cyan-400 tracking-tighter">{statsData.totalTimeInMinutes}m</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Time spent</p>
                                    </div>
                                </div>
                            </div>

                            {focusAreas.length > 0 && (
                                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-4">Accuracy by subject</h3>
                                    <div className="space-y-3.5 md:space-y-4">
                                        {focusAreas.map((area) => (
                                            <div key={area.label}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs font-bold text-white/60">{area.label}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${area.tone}`}>{area.status} &bull; {area.val}%</span>
                                                </div>
                                                <div className="h-2 md:h-2.5 overflow-hidden rounded-full bg-white/5">
                                                    <div
                                                        className={`h-full rounded-full ${area.color} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${area.val}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Link
                                to="/analytics"
                                className="mt-5 md:mt-6 flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary hover:text-black active:scale-[0.98]"
                            >
                                View Full Report
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <button
                                onClick={() => setShowExplanations(!showExplanations)}
                                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/25 hover:text-white/40 transition-colors"
                            >
                                <Info className="w-3 h-3" />
                                {showExplanations ? 'Hide calculations' : 'How it\'s calculated'}
                            </button>

                            {showExplanations && (
                                <div className="mt-4 p-4 md:p-5 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3">Metric definitions</p>
                                    {[
                                        { metric: 'Accuracy', formula: '(Correct answers ÷ Total questions) × 100', detail: 'Your overall accuracy across all subjects and exams.' },
                                        { metric: 'Level', formula: 'floor(Total XP ÷ 100) + 1', detail: 'You gain 1 level for every 100 XP earned. XP is awarded for correct answers and practice completion.' },
                                        { metric: 'Streak', formula: 'Consecutive days with at least 1 practice session', detail: 'Tracked daily. Practice at least once per day to keep your streak alive.' },
                                        { metric: 'Rank', formula: 'Bronze / Silver / Gold / Diamond', detail: 'Bronze (<70%), Silver (70-84%), Gold (85-94%), Diamond (95%+). Based on overall accuracy.' },
                                        { metric: 'Subject accuracy', formula: '(Correct in subject ÷ Total in subject) × 100', detail: 'Filtered by subject type (e.g. Math, English, Analytical). Shows your strongest and weakest areas.' },
                                    ].map((item) => (
                                        <div key={item.metric} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-black text-white">{item.metric}</h4>
                                                <p className="text-[10px] text-white/30 font-mono mt-0.5">{item.formula}</p>
                                                <p className="text-[10px] text-white/20 mt-0.5 leading-relaxed">{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-5">
                        <h2 className="flex items-center gap-2 text-sm md:text-lg font-black tracking-tighter text-white px-0.5">
                            <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Recent Activity
                        </h2>

                        <div className="rounded-2xl border border-white/5 bg-surface shadow-lg">
                            {recentSessions.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {recentSessions.map((item) => {
                                        const subject = subjectFromPath(item.source_file);
                                        const xp = item.correct_answers * 10;
                                        return (
                                            <div key={item.id} className="flex items-center justify-between gap-3 p-4 md:p-5 transition-colors hover:bg-white/[0.02]">
                                                <div className="flex min-w-0 items-center gap-3 md:gap-4">
                                                    <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-sm md:text-lg font-black tracking-tighter text-primary">
                                                        {subject[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="truncate text-sm md:text-base font-black text-white tracking-tight">{item.chapter_title}</h4>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">{subject} &bull; {timeAgo(item.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <span className="block text-base md:text-xl font-black tracking-tighter text-white">{item.correct_answers}/{item.total_questions}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-reward">+{xp} XP</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 md:py-14 px-6">
                                    <CheckList className="w-20 h-20 md:w-24 md:h-24 opacity-25 mb-3" />
                                    <p className="text-white/15 font-black uppercase tracking-widest text-[10px] text-center">No sessions recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-white/5 bg-surface p-6 md:p-10 shadow-lg">
                    <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-10">
                        <div className="shrink-0 opacity-[0.06]">
                            <Rocket className="w-36 h-36 md:w-48 md:h-48" />
                        </div>
                        <div className="text-center lg:text-left">
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter">Your dashboard is ready to launch</h2>
                            <p className="text-sm text-white/40 font-medium mt-2 max-w-lg leading-relaxed">
                                Complete at least <span className="text-primary font-black">20 questions</span> to unlock your personalized performance report. Track accuracy by subject, review weak areas, and watch your progress grow.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
                                {[
                                    { label: 'Accuracy tracking', color: 'text-accent' },
                                    { label: 'Subject analysis', color: 'text-primary' },
                                    { label: 'Weak area detection', color: 'text-reward' },
                                    { label: 'Consistency scores', color: 'text-emerald-400' },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 md:p-4 text-center">
                                        <p className={`text-lg font-black ${item.color}`}>✓</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30 mt-1 leading-tight">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 md:mt-8">
                                <Link
                                    to="/practice"
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20"
                                >
                                    Start Your First Practice
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                                <p className="text-[10px] text-white/20 font-medium">
                                    {statsData.totalPracticed > 0
                                        ? `${statsData.totalPracticed} question${statsData.totalPracticed !== 1 ? 's' : ''} completed so far`
                                        : 'No questions attempted yet'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h2 className="flex items-center gap-2 text-sm md:text-lg font-black tracking-tighter text-white mb-3 md:mb-4 px-0.5">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    {quickActions.map((item) => (
                        <QuickActionCard key={item.title} {...item} />
                    ))}
                </div>
            </div>

            {availableExams.some(e => e.active) && (
                <div>
                    <h2 className="flex items-center gap-2 text-sm md:text-lg font-black tracking-tighter text-white mb-3 md:mb-4 px-0.5">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        Exam Paths
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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
                                    className={`group rounded-xl border border-white/5 border-l-4 ${accentColor} bg-surface p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:border-l-primary/80 active:scale-[0.98]`}
                                >
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/25">Available</p>
                                    <h3 className="mt-1 text-xl md:text-2xl font-black tracking-tighter text-white">{exam.label}</h3>
                                    <p className="mt-2 text-[10px] md:text-xs font-medium text-white/30 leading-relaxed line-clamp-2">{exam.note}</p>
                                </Link>
                            ) : (
                                <div key={exam.id} className="rounded-xl border border-white/5 bg-surface p-4 md:p-5 opacity-60">
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/20">Coming soon</p>
                                    <h3 className="mt-1 text-xl md:text-2xl font-black tracking-tighter text-white">{exam.label}</h3>
                                    <p className="mt-2 text-[10px] md:text-xs font-medium text-white/20">{exam.note}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
