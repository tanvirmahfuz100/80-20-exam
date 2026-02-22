import React, { useState, useEffect } from 'react';
import { Book, Calculator, Brain, ChevronRight, Play, Clock, AlertCircle, Timer, ShieldCheck, Lock, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubjectCard = ({ subject, isSelected, onClick }) => {
    const Icon = {
        english: Book,
        math: Calculator,
        analytical: Brain
    }[subject.id] || Book;

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 w-full text-center relative overflow-hidden group ${isSelected
                ? 'bg-primary/10 border-primary shadow-[0_0_40px_rgba(94,106,210,0.15)]'
                : 'bg-surface border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
        >
            {isSelected && <div className="absolute top-0 right-0 p-3 bg-primary/20 text-primary rounded-bl-2xl">
                <ShieldCheck className="w-4 h-4" />
            </div>}
            <div className={`p-5 rounded-2xl mb-5 transition-all duration-500 ${isSelected ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-surface-alt text-white/20 group-hover:text-white/40'}`}>
                <Icon className="w-10 h-10" />
            </div>
            <h3 className={`text-xl font-black mb-1 transition-colors tracking-tighter ${isSelected ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{subject.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{subject.topics?.reduce((acc, t) => acc + t.chapters.length, 0)} Modules</p>
        </button>
    );
};

const ChapterItem = ({ chapter, onClick }) => (
    <div className="flex items-center justify-between p-5 bg-surface border border-white/5 rounded-2xl hover:border-primary/30 transition-all group hover:bg-white/5">
        <div className="flex-1 min-w-0 pr-4">
            <h4 className="font-bold text-white text-lg truncate group-hover:text-primary transition-colors leading-tight mb-1">{chapter.name}</h4>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20 italic">Learning Goal</span>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/50">15 Questions</span>
            </div>
        </div>
        <button
            onClick={() => onClick(chapter)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all text-[10px] shadow-lg shadow-primary/10 active:scale-95 shrink-0"
        >
            <Play className="w-4 h-4 fill-current" />
            Start
        </button>
    </div>
);

const PracticeConfig = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isTimed, setIsTimed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/iba/index.json')
            .then(res => {
                if (!res.ok) throw new Error("Failed to load question index");
                return res.json();
            })
            .then(data => {
                setData(data);
                if (data.subjects.length > 0) setSelectedSubject(data.subjects[0]);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleStart = (chapter) => {
        navigate(`/quiz/${chapter.id}?file=${encodeURIComponent(chapter.file)}&title=${encodeURIComponent(chapter.name)}&timed=${isTimed}`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Getting ready...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-3xl flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-red-500/10 rounded-full">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
                <h3 className="text-white font-bold text-lg">Oops! Something went wrong</h3>
                <p className="text-red-500/60 text-sm max-w-sm mx-auto mt-2 font-medium">{error}. We couldn't load the lessons.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-4">
                        LET'S <span className="text-primary not-italic uppercase">PRACTICE!</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        {user ? 'Your progress is being saved!' : 'Guest Mode - Your score won\'t be saved'}
                    </p>
                </div>

                {/* Timed Toggle */}
                <div className="bg-surface border border-white/5 p-2 rounded-3xl flex items-center gap-2 shadow-2xl overflow-hidden">
                    <button
                        onClick={() => setIsTimed(false)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isTimed ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}
                    >
                        Untimed
                    </button>
                    <button
                        onClick={() => setIsTimed(true)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isTimed ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <Timer className="w-4 h-4" />
                        Timed Mode
                    </button>
                </div>
            </div>

            {!user && (
                <div className="bg-primary/5 border border-dashed border-primary/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 text-center md:text-left">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1 italic">Don't miss out!</h4>
                            <p className="text-white/30 text-[10px] font-medium leading-relaxed max-w-md uppercase tracking-tight">Sign up to unlock 50,000+ questions and track your progress. It only takes a second!</p>
                        </div>
                    </div>
                    <Link to="/register" className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-2xl">
                        <UserPlus className="w-4 h-4" /> Create Account
                    </Link>
                </div>
            )}

            {/* Subject Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.subjects.map(sub => (
                    <SubjectCard
                        key={sub.id}
                        subject={sub}
                        isSelected={selectedSubject?.id === sub.id}
                        onClick={() => setSelectedSubject(sub)}
                    />
                ))}
            </div>

            {/* Chapters Grid */}
            {selectedSubject && (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Choose a Lesson</span>
                        </div>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
                        {selectedSubject.topics.map(topic => (
                            <div key={topic.id} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-white/90 italic tracking-tight uppercase">{topic.name}</h3>
                                    <span className="flex-1 h-px bg-primary/20 shadow-[0_0_10px_rgba(94,106,210,0.1)]"></span>
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{topic.chapters.length} Units</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {topic.chapters.length > 0 ? (
                                        topic.chapters.map(chapter => (
                                            <ChapterItem key={chapter.id} chapter={chapter} onClick={handleStart} />
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                            <p className="text-xs text-white/10 font-black uppercase tracking-widest">Lessons Coming Soon!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeConfig;
