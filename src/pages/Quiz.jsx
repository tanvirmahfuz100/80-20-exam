import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const stripMath = (text) => {
  if (!text) return '';
  return text
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^}]*)\}/g, '√$1')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\Rightarrow/g, '→')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\implies/g, '⇒')
    .replace(/\\therefore/g, '∴');
};

const formatExplanation = (text) => {
  if (!text) return '';
  return text
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/\$(.*?)\$/g, '<span class="text-primary font-semibold font-mono">$1</span>')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '<span class="text-primary font-semibold font-mono">$1</span><span class="text-white/30 mx-0.5">/</span><span class="text-primary font-semibold font-mono">$2</span>')
    .replace(/\\sqrt\{([^}]*)\}/g, '<span class="text-primary font-semibold font-mono">√$1</span>')
    .replace(/\\cdot/g, '<span class="text-white/50">·</span>')
    .replace(/\\Rightarrow/g, '<span class="text-white/50">→</span>')
    .replace(/\\implies/g, '<span class="text-white/50">⇒</span>')
    .replace(/\\therefore/g, '<span class="text-white/50">∴</span>')
    .replace(/\\times/g, '<span class="text-white/50">×</span>')
    .replace(/\\approx/g, '<span class="text-white/50">≈</span>')
    .replace(/\\neq/g, '<span class="text-white/50">≠</span>')
    .replace(/\\ge/g, '<span class="text-white/50">≥</span>')
    .replace(/\\le/g, '<span class="text-white/50">≤</span>')
    .replace(/\*\*(.*?)\*\*/g, '<span class="text-primary font-bold">$1</span>')
    .replace(/\n/g, '<br/>');
};

const normalizeQuizQuestions = (payload) => {
    const sourceQuestions = Array.isArray(payload?.questions) ? payload.questions : [];

    return sourceQuestions.flatMap((question) => {
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

    const [userAccuracy, setUserAccuracy] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const sessionSavedRef = useRef(false);

    const shuffledOptions = useMemo(() => {
        if (!questions[currentIndex]) return null;
        const q = questions[currentIndex];

        const opts = (q.options || []).map((text, idx) => ({ text, originalIdx: idx }));

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
        api.getUserStats(user?.id).then(({ data }) => {
            if (data?.accuracy != null) setUserAccuracy(data.accuracy);
        }).catch(() => {});
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
            const rect = event?.currentTarget?.getBoundingClientRect();
            createFlyingStar(rect, event?.clientX, event?.clientY);
            setMistakeCount(getMistakesDueCount());
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
        <div className="max-w-md mx-auto p-6 md:p-10 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl md:rounded-[2rem] text-center shadow-lg">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-5 rounded-2xl md:rounded-3xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
            </div>
            <h3 className="text-white font-black text-xl md:text-2xl tracking-tighter mb-3">Lesson path paused</h3>
            <p className="text-white/70 font-medium leading-relaxed">{error}</p>
            <Link to="/practice" className="mt-5 md:mt-6 inline-flex items-center justify-center rounded-xl md:rounded-2xl bg-yellow-500 px-5 md:px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-yellow-400 active:scale-95">
                Back to Practice
            </Link>
        </div>
    );

    if (isFinished) {
        const accuracy = Math.round((score / questions.length) * 100) || 0;

        return (
            <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
                <div className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 text-center space-y-6 md:space-y-8">
                        <div className="inline-flex p-4 md:p-5 bg-primary/10 rounded-full border border-primary/20 mb-1 md:mb-2">
                            <Trophy className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                        </div>

                        <div>
                            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-1 uppercase">Practice Complete!</h2>
                            <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] md:text-xs">{title}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                            <div className="bg-surface-alt p-5 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                                <div className="text-primary font-black text-2xl md:text-3xl mb-1">{accuracy}%</div>
                                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Accuracy</div>
                            </div>
                            <div className="bg-surface-alt p-5 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                                <div className="text-emerald-500 font-black text-2xl md:text-3xl mb-1">{score}/{questions.length}</div>
                                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Correct Answers</div>
                            </div>
                            <div className="bg-surface-alt p-5 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                                <div className="text-yellow-500 font-black text-lg md:text-xl mb-1 uppercase tracking-tighter">
                                    {accuracy >= 80 ? 'Expert' : accuracy >= 50 ? 'Learner' : 'Beginner'}
                                </div>
                                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Title Earned</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                            <button onClick={() => navigate('/practice')} className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 transition-all active:scale-[0.98]">
                                Back Home
                            </button>
                            <button onClick={() => window.location.reload()} className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
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

    const selectedOriginalIdx = isAnswered && selectedOption !== null ? shuffledOptions?.[selectedOption]?.originalIdx : -1;
    const isCurrentCorrect = selectedOriginalIdx === currentQ?.correct;
    const correctAnswerText = shuffledOptions?.find(o => o.originalIdx === currentQ?.correct)?.text;

    return (
        <div className="max-w-3xl mx-auto h-dvh flex flex-col overflow-hidden px-4 md:px-0">
            <div className="pointer-events-none fixed inset-0 z-[60]">
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

            <div className="flex items-center justify-between gap-4 pt-3 md:pt-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => navigate('/practice')} className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl text-white/40 hover:text-white transition-all border border-white/5 active:scale-95 shrink-0">
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <h4 className="text-white font-black tracking-tighter text-sm md:text-lg uppercase truncate">{title}</h4>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    {isTimedMode && (
                        <div className="px-2.5 md:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 md:gap-2 font-mono font-black text-xs md:text-sm text-white">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <div className="px-2.5 md:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 md:gap-2">
                        <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                        <span className="text-white font-black text-[10px] md:text-sm tracking-tighter">{totalXpSoFar} XP</span>
                    </div>
                    {isReviewSession ? (
                        <div className="px-2.5 md:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 md:gap-2">
                            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-black text-[10px] md:text-sm tracking-tighter">REVIEW</span>
                        </div>
                    ) : (
                        <div ref={starTargetRef} className={`px-2.5 md:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 md:gap-2 transition-all topbar-star-target ${balanceGlow ? 'ring-2 ring-yellow-400/80' : ''}`}>
                            <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 topbar-star-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-yellow-300 font-black text-[10px] md:text-sm tracking-tighter">{mistakeCount}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 mt-2 shrink-0">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                </div>
                <span className="text-white/40 font-black text-[11px] md:text-sm tracking-tighter shrink-0">{currentIndex + 1}/{questions.length}</span>
            </div>

            <div className="flex-1 flex flex-col min-h-0 mt-3 md:mt-4">
                <div className="bg-surface border border-white/5 rounded-2xl md:rounded-[32px] flex-1 flex flex-col p-4 md:p-5 overflow-hidden">
                    {currentQ.passage && (
                        <div className="mb-3 p-3 rounded-xl border border-white/5 bg-white/5 space-y-2 shrink-0 max-h-24 overflow-y-auto">
                            {currentQ.blankId && (
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">
                                    SSC Gap Filling - Blank ({currentQ.blankId})
                                </p>
                            )}
                            <p className="text-white/70 text-xs leading-relaxed font-medium whitespace-pre-wrap">
                                {stripMath(currentQ.passage)}
                            </p>
                            {(currentQ.boxWords || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {currentQ.boxWords.map((word) => (
                                        <span key={word} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                                            {stripMath(word)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-2 flex-wrap shrink-0">
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase border ${currentQ.difficulty === 'hard' ? 'text-yellow-300 border-yellow-300/20 bg-yellow-300/10' :
                            currentQ.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
                                'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                            }`}>{currentQ.difficulty}</span>
                        {currentQ.source && currentQ.source !== 'unknown' && (
                            <span className="text-[7px] font-black px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/30 uppercase tracking-wider">
                                {currentQ.source}
                            </span>
                        )}
                        {currentQ.chapter_tag && (
                            <span className="text-[7px] font-black px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary/50 uppercase tracking-wider">
                                {currentQ.chapter_tag}
                            </span>
                        )}
                    </div>

                    <h3 className="font-black text-white leading-tight mb-2 selection:bg-primary/30 tracking-tight text-[15px] md:text-lg lg:text-xl line-clamp-2 shrink-0">
                        {stripMath(currentQ.text)}
                    </h3>

                    <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {!isAnswered ? (
                                <motion.div
                                    key="options"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 flex flex-col justify-center space-y-2"
                                >
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
                                                className={`w-full text-left px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-between group/opt active:scale-[0.99] ${state === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/5' :
                                                    state === 'wrong' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300 shadow-lg shadow-yellow-500/5' :
                                                        state === 'selected' ? 'bg-primary/20 border-primary text-white shadow-2xl shadow-primary/20 scale-[1.01]' :
                                                            state === 'dimmed' ? 'bg-white/5 border-transparent opacity-30 scale-[0.98]' :
                                                                'bg-white/[0.07] border-white/10 text-white/60 hover:border-white/30 hover:bg-white/[0.12] hover:text-white hover:shadow-lg hover:shadow-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <span className={`w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black border transition-all shrink-0 ${state === 'selected' ? 'bg-primary text-white border-primary' :
                                                        state === 'correct' ? 'bg-emerald-500 text-black border-emerald-500' :
                                                            state === 'wrong' ? 'bg-yellow-500 text-black border-yellow-500' :
                                                                'bg-black/40 border-white/15 text-white/40 group-hover/opt:border-white/30 group-hover/opt:text-white'
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="font-bold tracking-tight text-sm md:text-base">{stripMath(option.text)}</span>
                                                </div>
                                                {state === 'correct' && <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 animate-in zoom-in-0 shrink-0" />}
                                                {state === 'wrong' && (
                                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 animate-in zoom-in-0 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="feedback"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 flex flex-col"
                                >
                                    {isCurrentCorrect ? (
                                        <div className="flex-1 flex flex-col bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2 shrink-0">
                                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                                <h4 className="text-emerald-400 font-black text-sm uppercase tracking-wider">Correct!</h4>
                                            </div>
                                            <div
                                                className="flex-1 overflow-y-auto text-white/80 text-sm leading-relaxed font-medium min-h-0"
                                                dangerouslySetInnerHTML={{
                                                    __html: formatExplanation(currentQ.explanation) || 'Well done!'
                                                }}
                                            />
                                            {currentQ.explanation_video_url && (
                                                <a
                                                    href={currentQ.explanation_video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 inline-flex items-center gap-1.5 text-emerald-400/70 hover:text-emerald-400 text-[9px] font-black uppercase tracking-widest transition-colors shrink-0"
                                                >
                                                    <Video className="w-3 h-3" />
                                                    Watch Video Breakdown
                                                </a>
                                            )}
                                            <button
                                                onClick={handleNext}
                                                className="w-full mt-3 py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest text-[10px] shrink-0 active:scale-[0.98] transition-all hover:bg-emerald-400"
                                            >
                                                {currentIndex < questions.length - 1 ? 'Continue' : 'Finish Lesson'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2 shrink-0">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
                                                    transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 2 }}
                                                >
                                                    <svg className="w-5 h-5 text-yellow-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                </motion.div>
                                                <h4 className="text-yellow-300 font-black text-sm uppercase tracking-wider">Keep going!</h4>
                                            </div>
                                            <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
                                                <p className="text-white/80 text-xs font-medium leading-relaxed">
                                                    Mistakes are opportunities to learn. A star has been added to your balance — review it to collect.
                                                </p>
                                                <p className="text-white/90 text-sm font-medium">
                                                    Correct answer: <span className="font-bold text-yellow-300">{stripMath(correctAnswerText)}</span>
                                                </p>
                                                <div
                                                    className="text-white/70 text-sm leading-relaxed font-medium"
                                                    dangerouslySetInnerHTML={{
                                                        __html: formatExplanation(currentQ.explanation) || ''
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={handleNext}
                                                className="w-full mt-3 py-3 bg-yellow-500 text-black rounded-xl font-black uppercase tracking-widest text-[10px] shrink-0 active:scale-[0.98] transition-all hover:bg-yellow-400"
                                            >
                                                Got it
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isAnswered && (
                        <div className="mt-2 pt-2 border-t border-white/5 shrink-0">
                            <p className="text-[8px] text-white/20 font-medium text-center">
                                Wrong answers are saved for spaced repetition review
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
