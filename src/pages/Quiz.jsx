import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, XCircle, ChevronRight,
    RefreshCw, AlertTriangle, Lightbulb, Timer,
    Trophy, Target, Zap, Clock, Lock, UserPlus,
    BarChart3, BrainCircuit, Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const Quiz = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const file = searchParams.get('file');
    const title = searchParams.get('title');
    const isTimedMode = searchParams.get('timed') === 'true';

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [results, setResults] = useState([]);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    // Shuffle options locally
    const shuffledOptions = useMemo(() => {
        if (!questions[currentIndex]) return null;
        const q = questions[currentIndex];

        // Map options to objects with original index to track correctness
        const opts = q.options.map((text, idx) => ({ text, originalIdx: idx }));

        // Shuffle
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        return opts;
    }, [questions, currentIndex]);

    useEffect(() => {
        if (!file) return;
        setLoading(true);
        fetch(file)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load questions");
                return res.json();
            })
            .then(data => {
                const qs = data.questions || [];
                setQuestions(qs);
                setLoading(false);
                if (isTimedMode) {
                    setTimeLeft(qs.length * 60);
                }
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [file, isTimedMode]);

    // Timer Logic
    useEffect(() => {
        if (isTimedMode && timeLeft > 0 && !isFinished && !loading) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsFinished(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isTimedMode, timeLeft, isFinished, loading]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleSubmitAnswer = async () => {
        if (selectedOption === null) return;

        const currentQ = questions[currentIndex];
        const selectedObj = shuffledOptions[selectedOption];
        const isCorrect = selectedObj.originalIdx === currentQ.correct;

        setIsAnswered(true);

        if (isCorrect) {
            setScore(s => s + 1);
        }

        const newResult = {
            id: currentQ.id,
            isCorrect: isCorrect,
            selected: selectedOption,
            time_spent: 0 // Will implement real timer tracking later
        };

        setResults([...results, newResult]);

        // If logged in, save to database
        if (user) {
            await supabase.from('user_responses').insert([{
                user_id: user.id,
                question_id: currentQ.uuid || null, // Handle UUID if available
                is_correct: isCorrect,
                time_spent: 0
            }]);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Loading practice session...</p>
        </div>
    );

    if (error) return (
        <div className="max-w-md mx-auto p-10 bg-red-500/5 border border-red-500/20 rounded-3xl text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white font-bold">{error}</p>
            <Link to="/practice" className="mt-6 inline-block text-primary text-xs font-black uppercase tracking-widest">Go Back</Link>
        </div>
    );

    if (isFinished) {
        const accuracy = Math.round((score / questions.length) * 100) || 0;

        return (
            <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
                <div className="bg-surface border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>

                    <div className="relative z-10 text-center space-y-8">
                        <div className="inline-flex p-5 bg-primary/10 rounded-full border border-primary/20 mb-2">
                            <Trophy className="w-12 h-12 text-primary" />
                        </div>

                        <div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 uppercase">Practice Complete!</h2>
                            <p className="text-white/30 font-bold uppercase tracking-widest text-xs">{title}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-surface-alt p-6 rounded-2xl border border-white/5">
                                <div className="text-primary font-black text-3xl mb-1">{accuracy}%</div>
                                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Accuracy</div>
                            </div>
                            <div className="bg-surface-alt p-6 rounded-2xl border border-white/5">
                                <div className="text-emerald-500 font-black text-3xl mb-1">{score}/{questions.length}</div>
                                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Correct Answers</div>
                            </div>
                            <div className="bg-surface-alt p-6 rounded-2xl border border-white/5">
                                <div className="text-yellow-500 font-black text-xl mb-1 italic uppercase tracking-tighter">
                                    {accuracy >= 80 ? 'Expert' : accuracy >= 50 ? 'Learner' : 'Beginner'}
                                </div>
                                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Title Earned</div>
                            </div>
                        </div>

                        {!user && (
                            <div className="bg-primary/5 border border-dashed border-primary/20 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                                    <Lock className="w-4 h-4" /> Keep your streak!
                                </div>
                                <p className="text-white/60 text-sm italic">
                                    Sign up to unlock 50,000+ questions, track your progress, and see where you rank on the leaderboard!
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-black uppercase tracking-widest text-[10px]"
                                >
                                    <UserPlus className="w-4 h-4" /> Register Now
                                </Link>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button onClick={() => navigate('/practice')} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 transition-all">
                                Back Home
                            </button>
                            <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const totalXpSoFar = results.reduce((acc, r) => acc + (r.isCorrect ? 10 : 0), 0);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
            {/* Simulation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/practice')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h4 className="text-white font-black italic tracking-tighter text-xl uppercase">{title}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Learning...</span>
                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_#5e6ad2]" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isTimedMode && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-sm ${timeLeft < 30 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 border-white/5 text-white'}`}>
                            <Clock className="w-4 h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-primary font-black text-sm tracking-tighter">{totalXpSoFar} POINTS</span>
                    </div>
                </div>
            </div>

            {/* Core Interaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-white/5 rounded-[40px] p-8 md:p-14 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <span className="text-8xl font-black italic tracking-tighter">{currentIndex + 1}</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-10">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${currentQ.difficulty === 'hard' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                                    currentQ.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
                                        'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                                    }`}>{currentQ.difficulty}</span>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-12 selection:bg-primary/30 tracking-tight">
                                {currentQ.text}
                            </h3>

                            <div className="space-y-4">
                                {shuffledOptions && shuffledOptions.map((option, idx) => {
                                    let state = 'idle';
                                    if (isAnswered) {
                                        if (option.originalIdx === currentQ.correct) state = 'correct';
                                        else if (idx === selectedOption) state = 'wrong';
                                        else state = 'dimmed';
                                    } else if (selectedOption === idx) {
                                        state = 'selected';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={isAnswered}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group/opt ${state === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-xl shadow-emerald-500/5' :
                                                state === 'wrong' ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-xl shadow-red-500/5' :
                                                    state === 'selected' ? 'bg-primary/20 border-primary text-white shadow-2xl shadow-primary/20 scale-[1.02]' :
                                                        state === 'dimmed' ? 'bg-white/5 border-transparent opacity-30 scale-[0.98]' :
                                                            'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${state === 'selected' ? 'bg-primary text-white border-primary' :
                                                    state === 'correct' ? 'bg-emerald-500 text-black border-emerald-500' :
                                                        state === 'wrong' ? 'bg-red-500 text-black border-red-500' :
                                                            'bg-black/50 border-white/5 group-hover/opt:border-white/20'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span className="font-bold tracking-tight text-lg">{option.text}</span>
                                            </div>
                                            {state === 'correct' && <CheckCircle className="w-6 h-6 animate-in zoom-in-0" />}
                                            {state === 'wrong' && <XCircle className="w-6 h-6 animate-in zoom-in-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        {!isAnswered ? (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={selectedOption === null}
                                className="px-14 py-5 bg-primary hover:bg-primary-hover disabled:opacity-20 disabled:grayscale text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-primary/40 active:scale-95 flex items-center gap-3"
                            >
                                <BrainCircuit className="w-4 h-4" /> Check Answer
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-14 py-5 bg-white text-black hover:bg-white/90 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 shadow-2xl shadow-white/5 active:scale-95"
                            >
                                {currentIndex < questions.length - 1 ? 'Continue' : 'Finish Lesson'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="space-y-8 sticky top-32">
                    {isAnswered ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
                            {user ? (
                                <div className="bg-surface border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 bg-yellow-500/10 text-yellow-500 rounded-bl-2xl">
                                        <Lightbulb className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        Explanation
                                    </h4>
                                    <div
                                        className="text-white/80 text-sm leading-relaxed font-medium space-y-4 prose-invert"
                                        dangerouslySetInnerHTML={{
                                            __html: (currentQ.explanation || 'No textual analysis available.')
                                                .replace(/<script.*?>.*?<\/script>/gi, '') // Basic anti-hack
                                                .replace(/\*\*(.*?)\*\*/g, '<span class="text-primary font-bold">$1</span>')
                                                .replace(/\n/g, '<br/>')
                                        }}
                                    >
                                    </div>

                                    {currentQ.explanation_video_url && (
                                        <div className="mt-8 pt-6 border-t border-white/5">
                                            <a
                                                href={currentQ.explanation_video_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-3 w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all font-black uppercase tracking-widest text-[9px] group"
                                            >
                                                <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Watch Video Breakdown
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-surface border-2 border-dashed border-white/5 rounded-[32px] p-10 text-center space-y-6 relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/2 blur-[80px] pointer-events-none"></div>
                                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
                                        <Lock className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-white font-black uppercase tracking-widest text-xs tracking-tighter">Locked Solution</h4>
                                        <p className="text-white/20 text-[11px] leading-relaxed font-bold italic">Join us to see the full explanation and video breakdowns!</p>
                                    </div>
                                    <Link
                                        to="/register"
                                        className="inline-block w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20 transition-all hover:scale-105"
                                    >
                                        Register to Unlock
                                    </Link>
                                </div>
                            )}

                            <div className="bg-surface border border-white/5 rounded-3xl p-6">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">
                                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Historical Precision</span>
                                    <span className="text-emerald-500">74%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500/30 transition-all duration-1000" style={{ width: `74%` }}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-alt/20 border border-dashed border-white/5 rounded-[32px] p-12 text-center space-y-6">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/5">
                                <BarChart3 className="w-6 h-6 text-white/10" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white/20 font-black uppercase tracking-widest text-[9px]">Ready to check?</h4>
                                <p className="text-white/10 text-[10px] leading-relaxed italic font-medium">Check your answer to see the explanation.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
