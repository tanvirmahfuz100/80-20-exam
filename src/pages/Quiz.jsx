import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, XCircle, ChevronRight,
    RefreshCw, Lightbulb, Timer, Flag,
    Trophy, Target, Zap, Clock,
    BarChart3, BrainCircuit, Video, Star, Sparkles, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
    addMistake, advanceStage, resetStage,
    getMistakesDueCount, getReviewSession, clearReviewSession
} from '../services/review';
import GapFillPassage from '../components/GapFillPassage';
import SubstitutionTableExercise from '../components/SubstitutionTableExercise';
import ModelTest from '../components/ModelTest';
import CreativeQuestionViewer from '../components/CreativeQuestionViewer';
import LoadingScreen from '../components/LoadingScreen';
import { playSound } from '../utils/sounds';
import { computeLevels, saveLevelProgress, addXp, addStars, completeDailyChallengeById, advanceWeeklyChallenge } from '../services/levels';

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



export const normalizeQuizQuestions = (payload) => {
    const sourceQuestions = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.questions)
            ? payload.questions
            : [];

    return sourceQuestions.flatMap((question) => {
        if (question._type === 'substitution_table' || question._type === 'model_test' || question._type === 'creative_question') {
            return [question];
        }
        if (Array.isArray(question.blanks) && question.blanks.length > 0) {
            const qId = question.id || question.question_id || 'q';
            return question.blanks.map((blank, blankIndex) => {
                const blankId = blank.blankId || blank.blank_id || blank.id || String(blankIndex + 1);
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

                const correctOption = Array.isArray(blank.options)
                    ? blank.options.find((option) => option?.isCorrect)
                    : undefined;
                const explanation_bn = correctOption?.explanationBn || correctOption?.explanation_bn || blank.explanation_bn || '';
                const explanation_en = correctOption?.explanationEn || correctOption?.explanation_en || blank.explanation_en || '';

                return {
                    id: `${qId}_${blankId}`,
                    text: `Choose the correct word for blank (${blankId})`,
                    passage: question.passage || question.passage_text || '',
                    boxWords: question.boxWords || [],
                    blankId,
                    options,
                    correct,
                    explanation: explanation_bn,
                    explanation_bn,
                    explanation_en,
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
        let correct = typeof question.correct === 'number' ? question.correct : 0;
        if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
            options = Object.values(question.options);
            if (question.answer) {
                correct = ['A', 'B', 'C', 'D'].indexOf(question.answer.toUpperCase());
            }
        } else {
            options = (question.options || []).map((option) => (
                typeof option === 'string' ? option : option.text || option.option_text || ''
            ));
        }

        if (question.correct_answer !== undefined && options.length > 0) {
            const found = options.findIndex(
                (opt) => String(opt).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase()
            );
            if (found !== -1) correct = found;
        }

        if (question.correct_tag !== undefined) {
            const found = options.findIndex(
                (opt) => String(opt).trim().toLowerCase() === String(question.correct_tag).trim().toLowerCase()
            );
            if (found !== -1) correct = found;
            else correct = 0;
        }

        return [{
            id: question.id || question.question_id || question._id || String(Math.random()),
            text: question.question || question.text || question.statement || question.stem || question.passage || 'Question',
            passage: question.passage || '',
            boxWords: question.boxWords || [],
            blankId: question.blankId || null,
            options,
            correct,
            explanation: (() => {
                const explanationBn = question.explanation_bn || question.explanationBn || '';
                const explanationEn = question.explanation_en || question.explanationEn || '';
                if (explanationBn && explanationEn) {
                    return `বাংলা ব্যাখ্যা:\n${explanationBn}\n\nEnglish Explanation:\n${explanationEn}`;
                }
                return explanationBn || explanationEn || question.explanation || '';
            })(),
            explanation_bn: question.explanation_bn || question.explanationBn || '',
            explanation_en: question.explanation_en || question.explanationEn || '',
            explanation_distractors: question.explanation_distractors || [],
            source: question.source || question.exam_appearance || '',
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
    const levelParam = searchParams.get('level');
    const isChallenge = searchParams.get('challenge') === 'daily' || searchParams.get('challenge') === 'weekly';
    const challengeType = searchParams.get('challenge');

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

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const [historicalAnswered, setHistoricalAnswered] = useState(0);
    const [totalQuestionCount, setTotalQuestionCount] = useState(0);

    const [currentLevel, setCurrentLevel] = useState(null);
    const [levelSessionSaved, setLevelSessionSaved] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [modelTestTotal, setModelTestTotal] = useState(0);
    const scoredIdsRef = useRef(new Set());
    const levelRef = useRef(null);

    const [quizFontSize, setQuizFontSize] = useState(() => {
        try { return parseInt(localStorage.getItem('quiz-font-size')) || 16; } catch { return 16; }
    });
    useEffect(() => {
        try { localStorage.setItem('quiz-font-size', String(quizFontSize)); } catch { /* ignore */ }
    }, [quizFontSize]);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);
    const questionStartRef = useRef(Date.now());
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

    const gapFillGroup = useMemo(() => {
        const q = questions[currentIndex];
        if (!q?.passage || !q?.blankId) return null;

        const blanks = [];
        let endIdx = currentIndex;

        for (let i = currentIndex; i < questions.length; i++) {
            const ni = questions[i];
            if (!ni.blankId || ni.passage !== q.passage) break;
            blanks.push({
                blankId: ni.blankId,
                id: ni.blankId,
                questionId: ni.id,
                correct: ni.options?.[ni.correct] || '',
                correct_answer: ni.options?.[ni.correct] || '',
                explanation_bn: ni.explanation_bn || ni.explanation || '',
                explanation_en: ni.explanation_en || '',
                options: (ni.options || []).map((opt, idx) => ({
                    text: opt,
                    isCorrect: idx === ni.correct,
                    explanationBn: ni.explanation_bn || ni.explanation || '',
                    explanationEn: ni.explanation_en || '',
                })),
                correctText: ni.options?.[ni.correct] || '',
            });
            endIdx = i;
        }

        if (blanks.length === 0) return null;

        return {
            passage: q.passage,
            boxWords: q.boxWords || [],
            difficulty: q.difficulty || 'medium',
            blanks,
            startIndex: currentIndex,
            endIndex: endIdx,
        };
    }, [questions, currentIndex]);

    const { chapterId } = useParams();
    const isMock = searchParams.get('isMock') === 'true';

    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true);
            setCurrentIndex(0);
            setSelectedOption(null);
            setIsAnswered(false);
            setScore(0);
            setIsFinished(false);
            setResults([]);
            setWrongAttempts(0);
            scoredIdsRef.current = new Set();
            sessionSavedRef.current = false;
            setLevelSessionSaved(false);
            finishSoundPlayedRef.current = false;
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
                    if (Array.isArray(data)) {
                        if (data.length > 0 && Array.isArray(data[0].items)) {
                            questionArray = data.flatMap(set =>
                                (set.items || []).map((item) => {
                                    const options = item.options || [];
                                    const correctAnswer = item.correct_answer || '';
                                    const correctIndex = options.indexOf(correctAnswer);
                                    return {
                                        id: item.id || `${set.id}_${item.item}`,
                                        text: [item.context, item.question_text].filter(Boolean).join(' '),
                                        options,
                                        correct: correctIndex >= 0 ? correctIndex : 0,
                                        explanation_bn: item.explanation_bn || '',
                                        explanation_en: item.explanation_en || '',
                                        explanation_distractors: item.explanation_distractors || [],
                                        difficulty: 'medium',
                                        source: set.source || '',
                                        year: set.year || '',
                                        item: item.item,
                                    };
                                })
                            );
                        } else {
                            questionArray = data;
                        }
                    } else if (Array.isArray(data.questions)) questionArray = data.questions;
                    else if (Array.isArray(data.passages)) questionArray = data.passages;
                    else if (Array.isArray(data.items)) questionArray = data.items;

                    if (data._type === 'model_test') {
                        questionArray = [{
                            _type: 'model_test',
                            id: data.modelId || file,
                            modelId: data.modelId || file,
                            name: data.title || 'Model Test',
                            chapters: data.chapters || [],
                        }];
                    }

                    const normalized = normalizeQuizQuestions({ questions: questionArray });

                    const existing = await api.getUserResponses(user?.id);
                    const answeredIds = new Set(
                        (existing.data || [])
                            .filter(r => r.chapter_id === chapterId || r.source_file === file)
                            .map(r => r.question_id)
                            .filter(Boolean)
                    );
                    const fresh = normalized.filter(q => !answeredIds.has(q.id) || q.blankId);
                    setTotalQuestionCount(normalized.length);
                    setHistoricalAnswered(answeredIds.size);

                    const target = fresh.length > 0 ? fresh : normalized;

                    if (levelParam) {
                        const computed = computeLevels(target);
                        const levelNum = parseInt(levelParam, 10);
                        const matchedLevel = computed.find(l => l.levelNumber === levelNum);
                        if (matchedLevel) {
                            setCurrentLevel(levelNum);
                            setQuestions(matchedLevel.questions);
                        } else {
                            setQuestions(target);
                        }
                    } else {
                        setQuestions(target);
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, [file, chapterId, isMock, isReviewMode, levelParam]);

    useEffect(() => {
        const persistPracticeSession = async () => {
            if (!isFinished || sessionSavedRef.current || !user?.id || questions.length === 0) return;

            const payload = {
                user_id: user.id,
                chapter_id: chapterId || file || 'unknown_chapter',
                chapter_title: title || 'Practice Session',
                source_file: file || null,
                total_questions: modelTestTotal || questions.length,
                correct_answers: score,
                wrong_answers: (modelTestTotal || questions.length) - score,
                accuracy: (modelTestTotal || questions.length) > 0 ? Number(((score / (modelTestTotal || questions.length)) * 100).toFixed(2)) : 0,
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
                const newXp = currentXp + earnedXp;
                updateProfileFields({ total_xp: newXp });
            }

            if (currentLevel && chapterId && !levelSessionSaved) {
                const totalQ = modelTestTotal || questions.length;
                const accuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
                const levelStars = wrongAttempts;
                saveLevelProgress(user.id, chapterId, currentLevel, {
                    completed: true,
                    accuracy,
                    xpEarned: earnedXp,
                    starsEarned: levelStars,
                });
                addXp(user.id, earnedXp);
                if (levelStars > 0) addStars(user.id, levelStars);

                if (isChallenge && challengeType === 'daily') {
                    const challengeId = `daily_${challengeType}_${chapterId}`;
                    completeDailyChallengeById(user.id, challengeId);
                }
                if (isChallenge && challengeType === 'weekly') {
                    advanceWeeklyChallenge(user.id, chapterId);
                }
                setLevelSessionSaved(true);
            }

            sessionSavedRef.current = true;
        };

        persistPracticeSession();
    }, [isFinished, user, questions, score, chapterId, title, file, isTimedMode, isReviewMode, currentLevel, levelSessionSaved, isChallenge, challengeType]);

    useEffect(() => {
        const refresh = () => setMistakeCount(getMistakesDueCount());
        refresh();
        window.addEventListener('mistakeReviewUpdated', refresh);
        return () => window.removeEventListener('mistakeReviewUpdated', refresh);
    }, []);

    useEffect(() => {
        if (loading || questions.length === 0) return;
        questionStartRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [loading, questions.length]);

    // Track actual viewport height (handles mobile browser chrome)
    useEffect(() => {
        const updateHeight = () => {
            const vh = window.innerHeight;
            document.documentElement.style.setProperty('--app-available-height', `${vh}px`);
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        window.addEventListener('orientationchange', () => setTimeout(updateHeight, 100));
        return () => {
            window.removeEventListener('resize', updateHeight);
            window.removeEventListener('orientationchange', updateHeight);
        };
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (!isFinished && questions.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isFinished, questions.length]);

    const handleBackWithConfirm = () => {
        if (questions.length > 0 && !isFinished) {
            setShowExitConfirm(true);
        } else {
            navigate('/practice');
        }
    };

    const finishSoundPlayedRef = React.useRef(false);
    useEffect(() => {
        if (isFinished && questions.length > 0 && !finishSoundPlayedRef.current) {
            const totalQ = modelTestTotal || questions.length;
            const accuracy = Math.round((score / totalQ) * 100);
            if (accuracy === 100) {
                playSound('bonus');
            } else if (accuracy >= 80) {
                playSound('rank');
            }
            finishSoundPlayedRef.current = true;
        }
    }, [isFinished, score, questions.length]);

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
            playSound('correctAnswer');

            if (currentQ._mistakeId) {
                advanceStage(currentQ._mistakeId);
            }
        }

        if (!isCorrect) {
            playSound('star');
            setWrongAttempts(w => w + 1);
            if (currentQ._mistakeId) {
                resetStage(currentQ._mistakeId);
            } else {
                addMistake(questionKey, currentQ, { file, title, chapterId });
            }
            const rect = event?.currentTarget?.getBoundingClientRect();
            createFlyingStar(rect, event?.clientX, event?.clientY);
            setMistakeCount(getMistakesDueCount());
        }

        const questionTime = Math.round((Date.now() - questionStartRef.current) / 1000);

        const newResult = {
            id: currentQ.id,
            isCorrect,
            selected: index,
            selectedOriginalIdx,
            time_spent: questionTime,
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
            time_spent: questionTime,
            status: 'answered',
        });
    };

    const handleSubmitReport = () => {
        const currentQ = questions[currentIndex];
        const text = `Report:%0A%0AReason: ${reportReason}%0A%0AQuestion: ${currentQ?.text || 'N/A'}%0AFile: ${file || 'N/A'}%0ADetails: ${reportDetails || 'N/A'}`;
        window.open(`https://wa.me/8801884581816?text=${text}`, '_blank');
        setShowReportModal(false);
        setReportReason('');
        setReportDetails('');
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            questionStartRef.current = Date.now();
        } else {
            setIsFinished(true);
        }
    };

    const nextModelFile = useMemo(() => {
        if (!file) return null;
        const match = file.match(/model_(\d+)\.json$/);
        if (!match) return null;
        const num = parseInt(match[1], 10);
        const next = String(num + 1).padStart(match[1].length, '0');
        return file.replace(/model_\d+\.json$/, `model_${next}.json`);
    }, [file]);

    if (loading) return <LoadingScreen message="Loading practice session..." />;

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
        const totalQ = modelTestTotal || questions.length;
        const accuracy = Math.round((score / totalQ) * 100) || 0;
        const earnedXp = score * 10;
        const earnedStars = wrongAttempts;

        if (currentLevel) {
            return (
                <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
                    <div className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-lg relative overflow-hidden">
                        <div className="relative z-10 text-center space-y-4 md:space-y-8">
                            <div className="inline-flex p-3 md:p-5 bg-primary/10 rounded-full border border-primary/20 mb-1 md:mb-2">
                                <Trophy className="w-6 h-6 md:w-12 md:h-12 text-primary" />
                            </div>

                            <div>
                                <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter mb-1 uppercase">Level {currentLevel} Complete!</h2>
                                <p className="text-white/30 font-bold uppercase tracking-widest text-[9px] md:text-xs truncate px-2">{title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-4">
                                <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                                    <div className={`font-black text-lg md:text-3xl mb-0.5 ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-white/50'}`}>{accuracy}%</div>
                                    <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">Accuracy</div>
                                </div>
                                <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                                    <div className="text-emerald-500 font-black text-lg md:text-3xl mb-0.5">{score}/{modelTestTotal || questions.length}</div>
                                    <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">Correct</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-4">
                                <div className="bg-primary/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-primary/20">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Zap className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                                        <span className="text-primary font-black text-lg md:text-3xl">+{earnedXp}</span>
                                    </div>
                                    <div className="text-[8px] md:text-[10px] text-primary/50 font-black uppercase tracking-widest mt-0.5">XP Earned</div>
                                </div>
                                {earnedStars === 0 ? (
                                <div className="bg-emerald-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-emerald-500/20">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Trophy className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" />
                                        <span className="text-emerald-400 font-black text-lg md:text-3xl">Perfect Run!</span>
                                    </div>
                                    <div className="text-[8px] md:text-[10px] text-emerald-400/50 font-black uppercase tracking-widest mt-0.5">No mistakes</div>
                                </div>
                                ) : (
                                <div className="bg-yellow-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-yellow-500/20">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                                        <span className="text-yellow-400 font-black text-lg md:text-3xl">{earnedStars}</span>
                                    </div>
                                    <div className="text-[8px] md:text-[10px] text-yellow-400/50 font-black uppercase tracking-widest mt-0.5">Stars to Review</div>
                                    <div className="text-[6px] md:text-[8px] text-yellow-400/30 font-black uppercase tracking-widest mt-0.5">Review these to master them</div>
                                </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-6">
                                <button
                                    onClick={() => navigate('/practice')}
                                    className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border border-white/5 transition-all active:scale-[0.98] min-h-touch"
                                >
                                    Go Home
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch"
                                >
                                    <RefreshCw className="w-4 h-4" aria-hidden="true" /> Practice Again
                                </button>
                                {accuracy >= 80 && (
                                <button
                                    onClick={() => {
                                        const nextLevel = currentLevel + 1;
                                        navigate(`/quiz/${chapterId}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(title)}&level=${nextLevel}`);
                                    }}
                                    className="flex-1 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch"
                                >
                                    <Trophy className="w-4 h-4" /> Next Level
                                </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
                    <div className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 text-center space-y-4 md:space-y-8">
                        <div className="inline-flex p-3 md:p-5 bg-primary/10 rounded-full border border-primary/20 mb-1 md:mb-2">
                            <Trophy className="w-6 h-6 md:w-12 md:h-12 text-primary" />
                        </div>

                        <div>
                            <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter mb-1 uppercase">Practice Complete!</h2>
                            <p className="text-white/30 font-bold uppercase tracking-widest text-[9px] md:text-xs truncate px-2">{title}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:gap-6">
                            <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                                <div className="text-primary font-black text-lg md:text-3xl mb-0.5">{accuracy}%</div>
                                <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">Accuracy</div>
                            </div>
                            <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                                <div className="text-emerald-500 font-black text-lg md:text-3xl mb-0.5">{score}/{modelTestTotal || questions.length}</div>
                                <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">Correct</div>
                            </div>
                            {earnedStars === 0 ? (
                            <div className="bg-emerald-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-emerald-500/20">
                                <div className="flex items-center justify-center gap-1.5">
                                    <div className="text-emerald-400 font-black text-lg md:text-3xl">Clean!</div>
                                </div>
                                <div className="text-[8px] md:text-[10px] text-emerald-400/50 font-black uppercase tracking-widest mt-0.5">No mistakes</div>
                            </div>
                            ) : (
                            <div className="bg-yellow-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-yellow-500/20">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                                    <span className="text-yellow-400 font-black text-lg md:text-3xl">{earnedStars}</span>
                                </div>
                                <div className="text-[8px] md:text-[10px] text-yellow-400/50 font-black uppercase tracking-widest mt-0.5">Stars to Review</div>
                                <div className="text-[6px] md:text-[8px] text-yellow-400/30 font-black uppercase tracking-widest mt-0.5">Review these to master them</div>
                            </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-6">
                            <button onClick={() => navigate('/practice')} className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border border-white/5 transition-all active:scale-[0.98] min-h-touch">
                                Back Home
                            </button>
                            <button onClick={() => window.location.reload()} className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch">
                                <RefreshCw className="w-4 h-4 md:w-4 md:h-4" aria-hidden="true" /> Try Again
                            </button>
                            {nextModelFile && (
                                <button
                                    onClick={() => {
                                        const nextTitle = title?.replace(/Model Test \d+/, m => {
                                            const n = parseInt(m.match(/\d+/)?.[0] || '0', 10) + 1;
                                            return `Model Test ${String(n).padStart(2, '0')}`;
                                        });
                                        navigate(`/quiz/${chapterId}?file=${encodeURIComponent(nextModelFile)}&title=${encodeURIComponent(nextTitle || title)}&chapterId=${chapterId}`);
                                    }}
                                    className="flex-1 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch"
                                >
                                    Next Model
                                </button>
                            )}
                        </div>
                        {file?.includes('model_') && (
                            <button onClick={() => navigate('/practice')} className="text-[9px] font-bold text-white/20 hover:text-white/40 transition-colors mt-2">
                                ← All Model Tests
                            </button>
                        )}
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
    const isManyOptions = (shuffledOptions?.length || 0) >= 5;

    return (
        <div className="h-dvh flex flex-col overflow-hidden px-0 w-full safe-bottom" role="main" aria-label="Quiz session">
            <div className="pointer-events-none fixed inset-0 z-[60] motion-safe-only">
                {flyingStars.map((star) => (
                    <motion.div
                        key={star.id}
                        className="fixed z-[60] pointer-events-none"
                        initial={{ x: star.startX, y: star.startY, opacity: 1, scale: 1 }}
                        animate={{ x: star.endX, y: star.endY, opacity: 0, scale: 0.35 }}
                        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{ width: 40, height: 40 }}
                    >
                        <Star className="w-full h-full text-yellow-300" />
                    </motion.div>
                ))}
            </div>

            <div className="flex items-center justify-between gap-2 px-3 md:px-4 pt-1 md:pt-3 shrink-0 safe-top">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                        onClick={handleBackWithConfirm}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all border border-white/5 active:scale-95 shrink-0 flex items-center justify-center"
                        style={{ minWidth: 40, minHeight: 40 }}
                        aria-label="Back to practice"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0 flex-1 max-w-[160px] xs:max-w-[200px]">
                        {currentLevel ? (
                            <>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[8px] font-black text-primary uppercase tracking-wider">Level {currentLevel}</span>
                                    <span className="text-[8px] text-white/20">·</span>
                                    <span className="text-[8px] font-medium text-white/40">Question {currentIndex + 1} of {questions.length}</span>
                                </div>
                                <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${((currentIndex + 1) / questions.length) * 100}%`
                                        }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="h-2 bg-white/15 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min(((historicalAnswered + currentIndex + 1) / (totalQuestionCount || questions.length)) * 100, 100)}%`
                                    }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
                        aria-label="Report a problem"
                        title="Report a problem"
                    >
                        <Flag className="w-3.5 h-3.5" />
                    </button>
                    <div className="hidden md:flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        <button
                            onClick={() => setQuizFontSize(s => Math.max(12, s - 2))}
                            className="text-white/50 hover:text-white transition-colors p-1 flex items-center justify-center"
                            style={{ minWidth: 28, minHeight: 28 }}
                            aria-label="Decrease font size"
                        >
                            <span className="text-[11px] font-black leading-none">A−</span>
                        </button>
                        <span className="w-px h-3 bg-white/10" aria-hidden="true" />
                        <button
                            onClick={() => setQuizFontSize(s => Math.min(24, s + 2))}
                            className="text-white/50 hover:text-white transition-colors p-1 flex items-center justify-center"
                            style={{ minWidth: 28, minHeight: 28 }}
                            aria-label="Increase font size"
                        >
                            <span className="text-[11px] font-black leading-none">A+</span>
                        </button>
                    </div>
                    {isTimedMode && (
                        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 font-mono font-black text-[11px] text-white">
                            <Clock className="w-3 h-3 text-primary" />
                            <span>{formatTime(elapsed)}</span>
                        </div>
                    )}
                    <div className="hidden items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-white font-black text-[10px] tabular-nums">{totalXpSoFar}</span>
                    </div>
                    {isReviewSession ? (
                        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-black text-[9px] leading-none">RVW</span>
                        </div>
                    ) : (
                        <div ref={starTargetRef} className={`px-2 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 transition-all topbar-star-target ${balanceGlow ? 'ring-2 ring-yellow-400/80' : ''}`} title="Stars to review">
                            <svg className="w-3 h-3 text-yellow-300 topbar-star-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-yellow-300 font-black text-[10px] tabular-nums">{mistakeCount}</span>
                            <span className="text-[6px] text-yellow-300/40 font-black uppercase tracking-widest leading-none hidden xs:inline">to review</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 px-3 md:px-4 pb-2 md:pb-3 mt-1.5">
                <div className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl flex-1 flex flex-col p-3 md:p-5 overflow-hidden quiz-card" style={{ maxHeight: 'calc(var(--app-available-height, 100vh) - 112px)' }}>
                    {currentQ?._type === 'model_test' ? (
                        <ModelTest
                            key={currentQ.modelId}
                            chapters={currentQ.chapters}
                            fontSize={quizFontSize}
                            onCorrectAttempt={() => playSound('correctAnswer')}
                            onWrongAttempt={() => {
                                playSound('star');
                                addMistake(currentQ.id || currentQ.modelId, currentQ, { file, title, chapterId });
                                createFlyingStar(null, window.innerWidth / 2, window.innerHeight / 2);
                                setMistakeCount(getMistakesDueCount());
                            }}
                            onContinue={(found, total) => {
                                setScore(s => s + found);
                                setModelTestTotal(total);
                                setResults(prev => [...prev, {
                                    id: currentQ.id || currentQ.modelId,
                                    isCorrect: found > 0,
                                    time_spent: 0,
                                    status: found === total ? 'answered' : 'partial',
                                }]);
                                const idx = questions.findIndex(q => q.id === currentQ.id);
                                if (idx >= 0 && idx < questions.length - 1) {
                                    setCurrentIndex(idx + 1);
                                    setSelectedOption(null);
                                    setIsAnswered(false);
                                    questionStartRef.current = Date.now();
                                } else {
                                    setIsFinished(true);
                                }
                            }}
                        />
                    ) : currentQ?._type === 'creative_question' ? (
                        <CreativeQuestionViewer
                            key={currentQ.id || currentQ._id || 'cq'}
                            cq={currentQ}
                            fontSize={quizFontSize}
                            onContinue={(found, total) => {
                                const idx = questions.findIndex(q => q.id === currentQ.id);
                                if (idx >= 0 && idx < questions.length - 1) {
                                    setCurrentIndex(idx + 1);
                                    setSelectedOption(null);
                                    setIsAnswered(false);
                                    questionStartRef.current = Date.now();
                                } else {
                                    navigate('/practice');
                                }
                            }}
                        />
                    ) : currentQ?._type === 'substitution_table' ? (
                        <SubstitutionTableExercise
                            key={currentQ.id}
                            exercise={currentQ.exercise}
                            fontSize={quizFontSize}
                            onWrongAttempt={() => {
                                playSound('star');
                                addMistake(currentQ.id || 'sub_table', currentQ, { file, title, chapterId });
                                createFlyingStar(null, window.innerWidth / 2, window.innerHeight / 2);
                                setMistakeCount(getMistakesDueCount());
                            }}
                            onContinue={(found, total) => {
                                setScore(s => s + found);
                                setResults(prev => [...prev, {
                                    id: currentQ.id,
                                    isCorrect: found > 0,
                                    time_spent: 0,
                                    status: found === total ? 'answered' : 'partial',
                                }]);
                                const idx = questions.findIndex(q => q.id === currentQ.id);
                                if (idx >= 0 && idx < questions.length - 1) {
                                    setCurrentIndex(idx + 1);
                                    setSelectedOption(null);
                                    setIsAnswered(false);
                                    questionStartRef.current = Date.now();
                                } else {
                                    setIsFinished(true);
                                }
                            }}
                        />
                    ) : gapFillGroup ? (
                        <GapFillPassage
                            key={gapFillGroup.startIndex}
                            passage={gapFillGroup.passage}
                            blanks={gapFillGroup.blanks}
                            boxWords={gapFillGroup.boxWords}
                            difficulty={gapFillGroup.difficulty}
                            fontSize={quizFontSize}
                            onBlankAnswer={(blankId, isCorrect, selectedText, explanationBn, explanationEn) => {
                                const blankIdx = gapFillGroup.blanks.findIndex(b => b.blankId === blankId);
                                if (blankIdx < 0) return;
                                const actualQ = questions[gapFillGroup.startIndex + blankIdx];
                                if (!actualQ) return;

                                const isFirstAttempt = !scoredIdsRef.current.has(actualQ.id);
                                if (isFirstAttempt) {
                                    scoredIdsRef.current.add(actualQ.id);
                                    if (isCorrect) {
                                        setScore(s => s + 1);
                                    } else {
                                        setWrongAttempts(w => w + 1);
                                        if (actualQ._mistakeId) {
                                            resetStage(actualQ._mistakeId);
                                        } else {
                                            addMistake(actualQ.id || blankId, actualQ, { file, title, chapterId });
                                        }
                                        setMistakeCount(getMistakesDueCount());
                                    }
                                }

                                const blankTime = Math.round((Date.now() - questionStartRef.current) / 1000);

                                setResults(prev => [...prev, {
                                    id: actualQ.id,
                                    isCorrect,
                                    selected: selectedText,
                                    time_spent: blankTime,
                                    status: 'answered',
                                }]);

                                api.saveResponse({
                                    user_id: user.id,
                                    question_id: actualQ.id,
                                    chapter_id: chapterId,
                                    chapter_title: title,
                                    source_file: file,
                                    question_text: actualQ.text,
                                    selected_option_text: selectedText,
                                    correct_option_text: actualQ.options?.[actualQ.correct] || '',
                                    is_correct: isCorrect,
                                    explanation_bn: explanationBn || '',
                                    explanation_en: explanationEn || '',
                                    time_spent: blankTime,
                                    status: 'answered',
                                });
                            }}
                            onContinue={(answeredCount, totalBlanks) => {
                                const blanksDone = answeredCount || 0;
                                const status = blanksDone === 0 ? 'skipped' : blanksDone < totalBlanks ? 'partial' : 'answered';
                                api.saveResponse({
                                    user_id: user.id,
                                    chapter_id: chapterId,
                                    chapter_title: title,
                                    source_file: file,
                                    question_id: gapFillGroup.passage,
                                    question_text: gapFillGroup.passage,
                                    is_correct: status === 'answered',
                                    time_spent: Math.round((Date.now() - questionStartRef.current) / 1000),
                                    status,
                                    blanks_answered: blanksDone,
                                    blanks_total: totalBlanks,
                                });
                                const nextIndex = gapFillGroup.endIndex + 1;
                                if (nextIndex < questions.length) {
                                    setCurrentIndex(nextIndex);
                                    setSelectedOption(null);
                                    setIsAnswered(false);
                                    questionStartRef.current = Date.now();
                                } else {
                                    setIsFinished(true);
                                }
                            }}
                        />
                    ) : (
                        <>
                            {currentQ.passage && !currentQ.text?.includes(currentQ.passage) && (
                                <div className="mb-2 p-2.5 rounded-xl border border-white/5 bg-white/5 space-y-2 shrink-0 max-h-20 overflow-y-auto">
                                    {currentQ.blankId && (
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/60">
                                            SSC Gap Filling - Blank ({currentQ.blankId})
                                        </p>
                                    )}
                                    <p className="text-white/70 leading-relaxed font-medium whitespace-pre-wrap" style={{ fontSize: `${quizFontSize - 2}px` }}>
                                        {stripMath(currentQ.passage)}
                                    </p>
                                    {(currentQ.boxWords || []).length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {currentQ.boxWords.map((word) => (
                                                <span key={word} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                                                    {stripMath(word)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mb-1.5 shrink-0">
                                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${currentQ.difficulty === 'hard' ? 'text-yellow-300 border-yellow-300/20 bg-yellow-300/10' :
                                            currentQ.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
                                                'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                                            }`}>{currentQ.difficulty}</span>
                                        {currentQ.source && currentQ.source !== 'unknown' && (
                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/30 uppercase tracking-wider">
                                                {currentQ.source}
                                            </span>
                                        )}
                                        {currentQ.chapter_tag && (
                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary/50 uppercase tracking-wider">
                                                {currentQ.chapter_tag}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-white leading-snug selection:bg-primary/30" style={{ fontSize: `${quizFontSize}px` }}>
                                        {stripMath(currentQ.text)}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar -mx-1 px-1">
                                <AnimatePresence mode="wait">
                                    {!isAnswered ? (
                                        <motion.div
                                            key="options"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.2 }}
                                            className={`${isManyOptions ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr' : 'flex flex-col gap-3'}`}
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
                                                    <motion.button
                                                        key={idx}
                                                        whileTap={!isAnswered ? { scale: 0.98 } : undefined}
                                                        disabled={isAnswered}
                                                        onClick={(e) => handleOptionSelect(idx, e)}
                                                        className={`w-full text-left flex-1 min-h-[56px] md:min-h-[64px] px-4 py-4 rounded-xl border-2 transition-all flex items-center gap-3 group/opt ${state === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                                                            state === 'wrong' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300' :
                                                                state === 'selected' ? 'bg-primary/20 border-primary text-white' :
                                                                    state === 'dimmed' ? 'bg-white/5 border-transparent opacity-30' :
                                                                        'bg-white/[0.10] border-white/20 text-white/80 hover:border-white/40 hover:bg-white/[0.16] hover:text-white'
                                                            }`}
                                                        role="radio"
                                                        aria-checked={selectedOption === idx}
                                                        tabIndex={isAnswered ? -1 : 0}
                                                    >
                                                        <span className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-xs font-black border transition-all shrink-0 ${state === 'selected' ? 'bg-primary text-white border-primary' :
                                                            state === 'correct' ? 'bg-emerald-500 text-black border-emerald-500' :
                                                                state === 'wrong' ? 'bg-yellow-500 text-black border-yellow-500' :
                                                                    'bg-white/10 border-white/20 text-white/70 group-hover/opt:border-white/30 group-hover/opt:text-white'
                                                            }`}>
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        <span className="font-bold leading-snug flex-1" style={{ fontSize: `${quizFontSize}px` }}>
                                                            {stripMath(option.text)}
                                                        </span>
                                                        {state === 'correct' && <CheckCircle className="w-5 h-5 text-emerald-400 animate-in zoom-in-0 shrink-0" aria-hidden="true" />}
                                                        {state === 'wrong' && (
                                                            <svg className="w-5 h-5 text-yellow-300 animate-in zoom-in-0 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                            </svg>
                                                        )}
                                                    </motion.button>
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
                                            className="flex flex-col h-full"
                                        >
                                            {isCurrentCorrect ? (
                                                <div className="flex-1 flex flex-col bg-emerald-500/[0.07] border border-emerald-500/20 rounded-xl p-4 gap-3">
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                                        <h4 className="text-emerald-400 font-black text-xs uppercase tracking-wider">Correct!</h4>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2 text-xs md:text-sm">
                                                        {(currentQ.explanation_bn || currentQ.explanation) && (
                                                            <div>
                                                                <p className="font-bold text-emerald-300/70 uppercase tracking-wider text-[10px] mb-1">বাংলা ব্যাখ্যা</p>
                                                                <p className="text-white/80 leading-relaxed">{currentQ.explanation_bn || currentQ.explanation}</p>
                                                            </div>
                                                        )}
                                                        {currentQ.explanation_en && (
                                                            <div>
                                                                <p className="font-bold text-emerald-300/70 uppercase tracking-wider text-[10px] mb-1">English Explanation</p>
                                                                <p className="text-white/80 leading-relaxed">{currentQ.explanation_en}</p>
                                                            </div>
                                                        )}
                                                        {!currentQ.explanation_bn && !currentQ.explanation_en && !currentQ.explanation && (
                                                            <p className="text-white/60 text-sm">Well done!</p>
                                                        )}
                                                        {currentQ.explanation_distractors && currentQ.explanation_distractors.length > 0 && (
                                                            <div className="border-t border-emerald-500/15 pt-2 mt-2">
                                                                <p className="font-bold text-emerald-300/70 uppercase tracking-wider text-[10px] mb-1.5">Why the other options are wrong</p>
                                                                {currentQ.explanation_distractors.map((d, i) => (
                                                                    <div key={i} className="mb-1.5 last:mb-0">
                                                                        <p className="text-white/90 text-[11px] font-medium mb-0.5">"{d.option}"</p>
                                                                        <p className="text-white/50 text-[10px] leading-relaxed pl-2 border-l border-emerald-500/20">{d.reason}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                     </div>

                                                    {currentQ.explanation_video_url && (
                                                        <a
                                                            href={currentQ.explanation_video_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-emerald-400/70 hover:text-emerald-400 text-[9px] font-black uppercase tracking-widest transition-colors shrink-0"
                                                        >
                                                            <Video className="w-3 h-3" />
                                                            Watch Video Breakdown
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={handleNext}
                                                        className="w-full py-3.5 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest text-[11px] shrink-0 active:scale-[0.98] transition-all hover:bg-emerald-400 min-h-touch"
                                                    >
                                                        {currentIndex < questions.length - 1 ? 'Continue' : 'Finish Lesson'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col bg-yellow-500/[0.07] border border-yellow-500/20 rounded-xl p-4 gap-3">
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
                                                            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 2 }}
                                                        >
                                                            <svg className="w-5 h-5 text-yellow-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                            </svg>
                                                        </motion.div>
                                                        <h4 className="text-yellow-300 font-black text-xs uppercase tracking-wider">Keep going!</h4>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/25">
                                                            <CheckCircle className="w-3 h-3 text-yellow-300 shrink-0" />
                                                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-yellow-300/60">Correct answer:</span>
                                                            <span className="math-font text-yellow-300 font-bold text-xs md:text-sm">{stripMath(correctAnswerText)}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-white/60 text-[11px] md:text-xs font-medium leading-relaxed shrink-0">
                                                        Mistakes are opportunities to learn. A star has been added to your balance — review it to collect.
                                                    </p>

                                                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2 text-xs md:text-sm">
                                                        {(currentQ.explanation_bn || currentQ.explanation) && (
                                                            <div>
                                                                <p className="font-bold text-yellow-300/70 uppercase tracking-wider text-[10px] mb-1">বাংলা ব্যাখ্যা</p>
                                                                <p className="text-white/80 leading-relaxed">{currentQ.explanation_bn || currentQ.explanation}</p>
                                                            </div>
                                                        )}
                                                        {currentQ.explanation_en && (
                                                            <div>
                                                                <p className="font-bold text-yellow-300/70 uppercase tracking-wider text-[10px] mb-1">English Explanation</p>
                                                                <p className="text-white/80 leading-relaxed">{currentQ.explanation_en}</p>
                                                            </div>
                                                        )}
                                                        {currentQ.explanation_distractors && currentQ.explanation_distractors.length > 0 && (
                                                            <div className="border-t border-yellow-500/15 pt-2 mt-2">
                                                                <p className="font-bold text-yellow-300/70 uppercase tracking-wider text-[10px] mb-1.5">Why the other options are wrong</p>
                                                                {currentQ.explanation_distractors.map((d, i) => (
                                                                    <div key={i} className="mb-1.5 last:mb-0">
                                                                        <p className="text-white/90 text-[11px] font-medium mb-0.5">"{d.option}"</p>
                                                                        <p className="text-white/50 text-[10px] leading-relaxed pl-2 border-l border-yellow-500/20">{d.reason}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={handleNext}
                                                        className="w-full py-3.5 bg-yellow-500 text-black rounded-xl font-black uppercase tracking-widest text-[11px] shrink-0 active:scale-[0.98] transition-all hover:bg-yellow-400 min-h-touch"
                                                    >
                                                        Got it
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            
                        </>
                    )}
                </div>
            </div>

            {showExitConfirm && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowExitConfirm(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full sm:max-w-sm bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-yellow-500/15 shrink-0">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Are you sure?</h3>
                                <p className="text-[11px] text-white/50 font-medium mt-1 leading-relaxed">
                                    You'll lose your progress on this lesson if you leave. Your answers so far are saved.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] border border-white/10"
                            >
                                Stay
                            </button>
                            <button
                                onClick={() => { setShowExitConfirm(false); navigate('/practice'); }}
                                className="flex-1 py-3 bg-yellow-500 text-black hover:bg-yellow-400 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97]"
                            >
                                Leave
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowReportModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full sm:max-w-sm bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Report a Problem</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-white/30 hover:text-white transition-colors p-1">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-white/40 font-medium">What's wrong with this question?</p>
                        <div className="space-y-1.5">
                            {['Wrong answer', 'Typo', 'Confusing question', 'Other'].map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setReportReason(reason)}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                        reportReason === reason
                                            ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                    }`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reportDetails}
                            onChange={e => setReportDetails(e.target.value)}
                            placeholder="Optional details..."
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 resize-none outline-none focus:border-primary/40 transition-colors"
                        />
                        <button
                            onClick={handleSubmitReport}
                            disabled={!reportReason}
                            className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] ${
                                reportReason
                                    ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                        >
                            Send via WhatsApp
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Quiz;
