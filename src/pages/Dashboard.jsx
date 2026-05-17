import React from 'react';
import { Flame, Star, Target, Clock, ArrowRight, TrendingUp, Brain, Zap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { api } from '../services/api';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-surface border border-white/5 rounded-3xl p-6 transition-all group relative overflow-hidden shadow-xl hover:border-white/10">
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Icon size={120} />
        </div>
        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-opacity-10 ${color}`}>
                    <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div className="flex items-center text-[10px] text-white/20 font-black uppercase tracking-widest">
                {subtitle}
            </div>
        </div>
    </div>
);

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

    const stats = [
        { title: "Questions Practiced", value: statsData.totalPracticed, subtitle: "Getting stronger!", icon: Brain, color: "bg-orange-500 text-orange-500" },
        { title: "Total XP", value: profile?.total_xp ?? "0", subtitle: "Points earned", icon: Star, color: "bg-yellow-500 text-yellow-500" },
        { title: "Accuracy Rate", value: `${statsData.accuracy}%`, subtitle: "Focus on precision!", icon: Target, color: "bg-emerald-500 text-emerald-500" },
        { title: "Learning Time", value: `${statsData.totalTimeInMinutes}m`, subtitle: "Time well spent", icon: Clock, color: "bg-blue-500 text-blue-500" },
    ];

    const recentActivity = [
        { id: 1, topic: 'Algebra Basics', subject: 'Math', score: 8, total: 10, time: '2h ago', xp: 80 },
        { id: 2, topic: 'Sentence Correction', subject: 'English', score: 12, total: 15, time: '5h ago', xp: 120 },
        { id: 3, topic: 'Critical Reasoning', subject: 'Analytical', score: 5, total: 5, time: 'Yesterday', xp: 50 },
    ];

    return (
        <div className="space-y-12">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface-alt/20 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full group-hover:bg-primary/10 transition-all duration-700"></div>

                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-3 italic tracking-tighter">
                        KEEP IT <span className="text-primary not-italic">GOING!</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <>STUDENT: {user.user_metadata?.username || user.email} • PICK YOUR EXAM BELOW</>
                    </p>
                </div>
                <Link to="/practice" className="relative z-10 inline-flex items-center gap-3 px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-95 shadow-[0_20px_50px_rgba(94,106,210,0.3)]">
                    Open Practice Hub
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            {/* Exam Launcher */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <BookOpen className="text-primary w-6 h-6" />
                        EXAM SECTIONS
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">SSC, HSC, IBA, BCS</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {availableExams.map((exam) => (
                        exam.active ? (
                            <Link
                                key={exam.id}
                                to={`/practice?exam=${exam.id}`}
                                className="bg-surface border border-white/5 rounded-[2rem] p-6 hover:border-primary/40 transition-all group shadow-2xl hover:translate-y-[-2px]"
                            >
                                <div className="flex items-start justify-between gap-4 mb-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Available</p>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter">{exam.label}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-white/30 text-sm leading-relaxed font-medium">{exam.note}</p>
                            </Link>
                        ) : (
                            <div key={exam.id} className="bg-surface border border-white/5 rounded-[2rem] p-6 opacity-60">
                                <div className="flex items-start justify-between gap-4 mb-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">Coming soon</p>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter">{exam.label}</h3>
                                    </div>
                                </div>
                                <p className="text-white/20 text-sm leading-relaxed font-medium">{exam.note}</p>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6 relative">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                            <TrendingUp className="text-primary w-6 h-6" />
                            RECENT LESSONS
                        </h2>
                    </div>
                    <div className="bg-surface border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        {recentActivity.map((item, idx) => (
                            <div key={item.id} className={`p-8 flex items-center justify-between group ${idx !== recentActivity.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5`}>
                                <div className="flex items-center gap-8">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-all font-black text-primary italic text-xl">
                                        {item.subject[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white italic tracking-tight text-xl">{item.topic}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{item.subject} • {item.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-black text-white text-2xl tracking-tighter italic">{item.score}/{item.total}</span>
                                    <span className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">+{item.xp} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3 px-2">
                        <Brain className="text-primary w-6 h-6" />
                        STUDY FOCUS
                    </h2>
                    <div className="bg-surface border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                        <div className="space-y-10">
                            {[
                                { label: "Vocabulary", status: "Critical", val: 32, color: "bg-red-500", text: "text-red-400" },
                                { label: "Geometry", status: "Average", val: 54, color: "bg-yellow-500", text: "text-yellow-400" },
                                { label: "Analytical", status: "Optimal", val: 88, color: "bg-emerald-500", text: "text-emerald-400" },
                            ].map((area, i) => (
                                <div key={i} className="group/item">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                                        <span className="text-white/40 group-hover/item:text-white transition-colors">{area.label}</span>
                                        <span className={`${area.text}`}>{area.status}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full ${area.color} rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
                                            style={{ width: `${area.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}

                            <button className="w-full py-5 mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white border border-primary/20 hover:bg-primary rounded-2xl transition-all duration-500 shadow-xl shadow-primary/5">
                                See Full Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
