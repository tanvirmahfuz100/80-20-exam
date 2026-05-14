import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, XCircle, ChevronRight,
    RefreshCw, Lightbulb, Timer,
    Trophy, Target, Zap, Clock,
    BarChart3, BrainCircuit, Video, Star, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
    addMistake, advanceStage, resetStage,
    getMistakesDueCount, getReviewSession, clearReviewSession
} from '../services/review';

const normalizeQuizQuestions = (payload) => {
    const sourceQuestions = Array.isArray(payload?.questions) ? payload.questions : [];

    return sourceQuestions.flatMap((question) => {
        // Handle gap-filling format (with blanks)
        if (Array.isArray(question.blanks) && question.blanks.length > 0) {
            return question.blanks.map((blank, blankIndex) => {
                const blankId = blank.blankId || blank.id || String(blankIndex + 1);
                const options = Array.isArray(blank.options)
                    ? blank.options.map((option) => (typeof option === 'string' ? option : option?.text || ''))
                    : [];

                let correct = -1;
                if (blank.correct_answer) {
                    correct = options.findIndex(
                        (option) => String(option).trim().toLowerCase() === String(blank.correct_answer).trim().toLowerCase()
                    );
                }
                if (correct === -1) {
                    correct = (blank.options || []).findIndex((option) => option?.isCorrect);
                }
                if (correct === -1 && options.length > 0) {
                    correct = 0;
                }

                return {
                    id: `${question.id}_${blankId}`,
                    text: `Choose the correct word for blank (${blankId})`,
                    passage: question.passage || question.passage_text || '',
                    boxWords: question.boxWords || [],
                    blankId,
                    options,
                    correct,
                    explanation: blank.explanation_bn || (blank.options || []).find((option) => option?.isCorrect)?.explanationBn || '',
                    difficulty: question.difficulty || 'medium'
                };
            });
        }

        // Handle changing sentences format (with subQuestions)
        if (Array.isArray(question.subQuestions) && question.subQuestions.length > 0) {
            return question.subQuestions.map((subQ) => ({
                id: subQ.id,
                text: `${subQ.instruction || 'Transform the sentence'}: "${subQ.sentence}"`,
                passage: subQ.sentence || '',
                options: (subQ.options || []).map((option) => option.text),
                correct: (subQ.options || []).findIndex((option) => option.isCorrect),
                explanation: (subQ.options || []).find((option) => option.isCorrect)?.explanationBn || '',
                difficulty: question.difficulty || 'medium'
            }));
        }

        // Handle options as object {A: "text", B: "text", ...}
        let options = [];
        let correct = question.correct || 0;
        if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
            options = Object.values(question.options);
            if (question.answer) {
                correct = ['A', 'B', 'C', 'D'].indexOf(question.answer.toUpperCase());
            }
        } else {
            options = (question.options || []).map((option) => option.text || option);
        }

        // Fallback for generic format
        return [{
            id: question.id,
            text: question.question || question.text || question.passage || 'Question',
            passage: question.passage || '',
            boxWords: question.boxWords || [],
            blankId: question.blankId || null,
            options,
            correct,
            explanation: question.explanation || '',
            difficulty: question.difficulty || 'medium'
        }];
    });
};

const Quiz = () => {
    const { user, updateProfileFields } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const file = searchParams.get('file');
    const title = searchParams.get('title');
    const isTimedMode = searchParams.get('timed') === 'true';
    const isReviewMode = searchParams.get('reviewMode') === 'true';

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [results, setResults] = useState([]);
    const [mistakeCount, setMistakeCount] = useState(0);
    const [flyingStars, setFlyingStars] = useState([]);
    const [balanceGlow, setBalanceGlow] = useState(false);
    const starTargetRef = useRef(null);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const sessionSavedRef = useRef(false);

    // Shuffle options locally
    const shuffledOptions = useMemo(() => {
        if (!questions[currentIndex]) return null;
        const q = questions[currentIndex];

        // Map options to objects with original index to track correctness
        const opts = (q.options || []).map((text, idx) => ({ text, originalIdx: idx }));

        // Shuffle
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        return opts;
    }, [questions, currentIndex]);

    const { chapterId } = useParams();
    const isMock = searchParams.get('isMock') === 'true';

    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true);
            sessionSavedRef.current = false;
            try {
                if (isReviewMode) {
                    const reviewQuestions = getReviewSession();
                    if (reviewQuestions.length > 0) {
                        setQuestions(reviewQuestions);
                    } else {
                        setError('No review questions found.');
                    }
                } else if (isMock && chapterId) {
                    const { data } = await api.getMockTestQuestions(chapterId);
                    setQuestions(data || []);
                } else if (file) {
                    let fileUrl = file || '';
                    if (fileUrl.startsWith('/')) {
                        const base = import.meta.env.BASE_URL || '/';
                        fileUrl = `${base}${fileUrl.replace(/^\//, '')}`;
                    }
                    const res = await fetch(fileUrl);
                    const data = await res.json();

                    let questionArray = [];
                    if (Array.isArray(data)) questionArray = data;
                    else if (Array.isArray(data.questions)) questionArray = data.questions;
                    else if (Array.isArray(data.passages)) questionArray = data.passages;
                    else if (Array.isArray(data.items)) questionArray = data.items;

                    setQuestions(normalizeQuizQuestions({ questions: questionArray }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, [file, chapterId, isMock, isReviewMode]);

    useEffect(() => {
        const persistPracticeSession = async () => {
            if (!isFinished || sessionSavedRef.current || !user?.id || questions.length === 0) return;

            const payload = {
                user_id: user.id,
                chapter_id: chapterId || file || 'unknown_chapter',
                chapter_title: title || 'Practice Session',
                source_file: file || null,
                total_questions: questions.length,
                correct_answers: score,
                wrong_answers: questions.length - score,
                accuracy: questions.length > 0 ? Number(((score / questions.length) * 100).toFixed(2)) : 0,
                mode: isTimedMode ? 'timed' : 'untimed'
            };

            await api.savePracticeSession(payload);

            if (isReviewMode) {
                clearReviewSession();
            }

            const earnedXp = score * 10;
            const raw = localStorage.getItem('exam_local_auth');
            if (raw) {
                const currentSession = JSON.parse(raw);
                const currentXp = currentSession.profile.total_xp || 0;
                updateProfileFields({ total_xp: currentXp + earnedXp });
            }

            sessionSavedRef.current = true;
        };

        persistPracticeSession();
    }, [isFinished, user, questions, score, chapterId, title, file, isTimedMode, isReviewMode]);

    useEffect(() => {
        const refresh = () => setMistakeCount(getMistakesDueCount());
        refresh();
        window.addEventListener('mistakeReviewUpdated', refresh);
        return () => window.removeEventListener('mistakeReviewUpdated', refresh);
    }, []);

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

    const getQuestionKey = (question) => question.uuid || question.id || question.text || `question-${currentIndex}`;

    const createFlyingStar = (buttonRect, clickX, clickY) => {
        const topbarIcon = document.querySelector('.topbar-star-icon');
        const topbarTarget = document.querySelector('.topbar-star-target');
        const targetRect = topbarIcon?.getBoundingClientRect() || topbarTarget?.getBoundingClientRect() || starTargetRef.current?.getBoundingClientRect();
        const starSize = 40;
        const targetOffset = starSize / 2;
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        const startX = buttonRect ? buttonRect.left + buttonRect.width / 2 - targetOffset : clickX - targetOffset;
        const startY = buttonRect ? buttonRect.top + buttonRect.height / 2 - targetOffset : clickY - targetOffset;
        const endX = targetRect ? targetRect.left + targetRect.width / 2 - targetOffset : startX;
        const endY = targetRect ? targetRect.top + targetRect.height / 2 - targetOffset : startY;

        setFlyingStars((prev) => [...prev, { id, startX, startY, endX, endY }]);
        setBalanceGlow(true);
        window.setTimeout(() => setBalanceGlow(false), 500);
        window.setTimeout(() => setFlyingStars((prev) => prev.filter((star) => star.id !== id)), 1200);
    };

    const handleOptionSelect = async (index, event) => {
        if (isAnswered) return;

        const currentQ = questions[currentIndex];
        const selectedObj = shuffledOptions[index];
        const selectedOriginalIdx = selectedObj?.originalIdx ?? -1;
        const isCorrect = selectedOriginalIdx === currentQ.correct;
        const questionKey = getQuestionKey(currentQ);

        setSelectedOption(index);
        setIsAnswered(true);

        if (isCorrect) {
            setScore(s => s + 1);

            if (currentQ._mistakeId) {
                advanceStage(currentQ._mistakeId);
            }
        }

        if (!isCorrect) {
            if (currentQ._mistakeId) {
                resetStage(currentQ._mistakeId);
            } else {
                addMistake(questionKey, currentQ, { file, title, chapterId });
            }
        }

        const newResult = {
            id: currentQ.id,
            isCorrect,
            selected: index,
            selectedOriginalIdx,
            time_spent: 0
        };

        setResults(prev => [...prev, newResult]);

        await api.saveResponse({
            user_id: user.id,
            question_id: currentQ.uuid || currentQ.id || null,
            chapter_id: chapterId || null,
            chapter_title: title || null,
            source_file: file || null,
            question_text: currentQ.text || null,
            selected_option_index: selectedOriginalIdx,
            selected_option_text: selectedObj?.text || null,
            correct_option_index: currentQ.correct,
            correct_option_text: (currentQ.options || [])[currentQ.correct] || null,
            is_correct: isCorrect,
            time_spent: 0
        });
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
        <div className="max-w-md mx-auto p-10 bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] text-center shadow-2xl shadow-black/20">
            <div className="w-16 h-16 mx-auto mb-5 rounded-3xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
            <h3 className="text-white font-black text-2xl italic tracking-tighter mb-3">Lesson path paused</h3>
            <p className="text-white/70 font-medium leading-relaxed">{error}</p>
            <Link to="/practice" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-yellow-400">
                Back to Practice
            </Link>
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
    const isReviewSession = isReviewMode;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
            <div className="pointer-events-none">
                {flyingStars.map((star) => (
                    <motion.div
                        key={star.id}
                        className="fixed z-[60] pointer-events-none"
                        initial={{ x: star.startX, y: star.startY, opacity: 1, scale: 1 }}
                        animate={{ x: star.endX, y: star.endY, opacity: 0, scale: 0.35 }}
                        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{ width: 40, height: 40 }}
                    >
                        <Star className="w-full h-full text-yellow-300 drop-shadow-xl" />
                    </motion.div>
                ))}
            </div>
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
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-sm ${timeLeft < 30 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300 animate-pulse' : 'bg-white/5 border-white/5 text-white'}`}>
                            <Clock className="w-4 h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-primary font-black text-sm tracking-tighter">{totalXpSoFar} POINTS</span>
                    </div>
                    {isReviewSession && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-black text-sm tracking-tighter">REVIEW</span>
                        </div>
                    )}
                    <div className={`bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${balanceGlow ? 'ring-2 ring-yellow-400/80 shadow-[0_0_20px_rgba(245,158,11,0.35)]' : ''}`}>
                        <Star className="w-4 h-4 text-yellow-300" />
                        <span className="text-yellow-300 font-black text-sm tracking-tighter">{mistakeCount}</span>
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
                            {currentQ.passage && (
                                <div className="mb-10 p-6 rounded-3xl border border-white/5 bg-white/5 space-y-4">
                                    {currentQ.blankId && (
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                                            SSC Gap Filling - Blank ({currentQ.blankId})
                                        </p>
                                    )}
                                    <p className="text-white/70 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                        {currentQ.passage}
                                    </p>
                                    {(currentQ.boxWords || []).length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {currentQ.boxWords.map((word) => (
                                                <span key={word} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-10">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${currentQ.difficulty === 'hard' ? 'text-yellow-300 border-yellow-300/20 bg-yellow-300/10' :
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
                                            onClick={(e) => handleOptionSelect(idx, e)}
                                            className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group/opt ${state === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-xl shadow-emerald-500/5' :
                                                state === 'wrong' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300 shadow-xl shadow-yellow-500/5' :
                                                    state === 'selected' ? 'bg-primary/20 border-primary text-white shadow-2xl shadow-primary/20 scale-[1.02]' :
                                                        state === 'dimmed' ? 'bg-white/5 border-transparent opacity-30 scale-[0.98]' :
                                                            'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${state === 'selected' ? 'bg-primary text-white border-primary' :
                                                    state === 'correct' ? 'bg-emerald-500 text-black border-emerald-500' :
                                                        state === 'wrong' ? 'bg-yellow-500 text-black border-yellow-500' :
                                                            'bg-black/50 border-white/5 group-hover/opt:border-white/20'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span className="font-bold tracking-tight text-lg">{option.text}</span>
                                            </div>
                                            {state === 'correct' && <CheckCircle className="w-6 h-6 animate-in zoom-in-0" />}
                                            {state === 'wrong' && <Star className="w-6 h-6 text-yellow-300 animate-in zoom-in-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        {isAnswered ? (
                            <button
                                onClick={handleNext}
                                className="px-14 py-5 bg-white text-black hover:bg-white/90 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 shadow-2xl shadow-white/5 active:scale-95"
                            >
                                {currentIndex < questions.length - 1 ? 'Continue' : 'Finish Lesson'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="px-14 py-5 bg-white/5 text-white/50 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 shadow-inner border border-white/5">
                                Select an answer to reveal the explanation
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="space-y-8 sticky top-32">
                    {isAnswered ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
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
                                            .replace(/<script.*?>.*?<\/script>/gi, '')
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
                                            className="flex items-center justify-center gap-3 w-full py-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 rounded-2xl border border-yellow-500/20 transition-all font-black uppercase tracking-widest text-[9px] group"
                                        >
                                            <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Watch Video Breakdown
                                        </a>
                                    </div>
                                )}
                            </div>

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
                                <Star className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white/20 font-black uppercase tracking-widest text-[9px]">Tap an answer</h4>
                                <p className="text-white/10 text-[10px] leading-relaxed italic font-medium">Select any option to check your knowledge.</p>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-4 text-[10px] text-yellow-100 font-black uppercase tracking-[0.2em]">
                                Wrong answers are saved for spaced repetition review.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
