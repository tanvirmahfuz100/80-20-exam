import React from 'react';
import { Flame, Star, Target, Clock, ArrowRight, TrendingUp, Brain, Lock, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, subtitle, icon: Icon, color, isLocked }) => (
    <div className={`bg-surface border border-white/5 rounded-3xl p-6 transition-all group relative overflow-hidden shadow-xl ${isLocked ? 'grayscale' : 'hover:border-white/10'}`}>
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Icon size={120} />
        </div>
        <div className={`relative z-10 ${isLocked ? 'blur-sm select-none' : ''}`}>
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
        {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20">
                <Lock className="w-5 h-5 text-white/30" />
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();

    // Mock data - in real app fetched from user_responses
    const recentActivity = [
        { id: 1, subject: "English", topic: "Noun", score: 8, total: 10, time: "2 hours ago", xp: 120 },
        { id: 2, subject: "Math", topic: "Algebra Basics", score: 12, total: 20, time: "Yesterday", xp: 240 },
        { id: 3, subject: "Analytical", topic: "Puzzle", score: 4, total: 5, time: "Yesterday", xp: 90 },
    ];

    const stats = [
        { title: "Current Streak", value: user ? "5 Days" : "0 Days", subtitle: "Active Pulse", icon: Flame, color: "bg-orange-500 text-orange-500" },
        { title: "Total XP", value: user ? "1,450" : "0", subtitle: "Level Registry", icon: Star, color: "bg-yellow-500 text-yellow-500" },
        { title: "Overall Accuracy", value: user ? "82%" : "??%", subtitle: "Global Percentile", icon: Target, color: "bg-emerald-500 text-emerald-500" },
        { title: "Time Invested", value: user ? "12h 30m" : "0h 0m", subtitle: "Focused Time", icon: Clock, color: "bg-blue-500 text-blue-500" },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface-alt/20 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full group-hover:bg-primary/10 transition-all duration-700"></div>

                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-3 italic tracking-tighter">
                        {user ? 'CONTINUE' : 'START'} <span className="text-primary not-italic">SIMULATION</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        {user ? (
                            <>OPERATOR: {user.user_metadata?.username || user.email} • PATH: IBA ADMISSION</>
                        ) : (
                            <>GUEST ACCESS GRANTED • ANALYTICS DISABLED</>
                        )}
                    </p>
                </div>
                <Link to="/practice" className="relative z-10 inline-flex items-center gap-3 px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-95 shadow-[0_20px_50px_rgba(94,106,210,0.3)]">
                    {user ? 'Resume Laboratory' : 'Enter Arena'}
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} isLocked={!user} />
                ))}
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6 relative">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                            <TrendingUp className="text-primary w-6 h-6" />
                            HISTORICAL DATA
                        </h2>
                    </div>
                    <div className="bg-surface border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        {recentActivity.map((item, idx) => (
                            <div key={item.id} className={`p-8 flex items-center justify-between group ${idx !== recentActivity.length - 1 ? 'border-b border-white/5' : ''} ${!user ? 'blur-md opacity-20 select-none grayscale' : 'hover:bg-white/5'}`}>
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

                        {!user && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-6 z-30">
                                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20 shadow-2xl">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Registry Required</h3>
                                    <p className="text-white/30 text-xs font-medium leading-relaxed">
                                        Simulation history and performance mapping require an active operator profile.
                                    </p>
                                </div>
                                <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all">
                                    <UserPlus className="w-4 h-4" /> Initialize Registry
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3 px-2">
                        <Brain className="text-primary w-6 h-6" />
                        WEAK POINTS
                    </h2>
                    <div className="bg-surface border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                        <div className={`space-y-10 ${!user ? 'blur-lg opacity-10 select-none grayscale' : ''}`}>
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
                                Generate Full Audit
                            </button>
                        </div>

                        {!user && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/20 backdrop-blur-[1px]">
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] italic">Intelligence Locked</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
