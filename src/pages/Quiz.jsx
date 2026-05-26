import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle2, XCircle, RefreshCw, Flag,
    Zap, Clock, Video, Star, Sparkles, ChevronRight
} from 'lucide-react';
import {
    addMistake, advanceStage, resetStage,
    getMistakesDueCount
} from '../services/review';
import { api } from '../services/localApi';
import GapFillPassage from '../components/GapFillPassage';
import SubstitutionTableExercise from '../components/SubstitutionTableExercise';
import ModelTest from '../components/ModelTest';
import CreativeQuestionViewer from '../components/CreativeQuestionViewer';
import LoadingScreen from '../components/LoadingScreen';
import { playSound } from '../utils/sounds';
import { stripMath } from '../services/quizUtils';
import QuizResultScreen from '../components/QuizResultScreen';
import { ExitConfirmModal, ReportModal } from '../components/QuizModals';
import { useQuizSession } from '../hooks/useQuizSession';

const Quiz = () => {
    const {
        questions, loading, error,
        currentIndex, selectedOption, isAnswered, score, isFinished, results,
        mistakeCount, flyingStars, balanceGlow,
        showReportModal, reportReason, reportDetails,
        showExitConfirm, elapsed, wrongAttempts,
        currentLevel, levelSessionSaved,
        historicalAnswered, totalQuestionCount,
        quizFontSize, scoredIdsRef, questionStartRef,
        currentQuestion, shuffledOptions, gapFillGroup,
        totalXpSoFar, isReviewSession,
        selectedOriginalIdx, isCurrentCorrect, correctAnswerText, isManyOptions,
        nextModelFile, modelTestTotal,
        file, title, chapterId, user, isTimedMode,
        setScore, setCurrentIndex, setSelectedOption, setIsAnswered,
        setResults, setWrongAttempts, setMistakeCount,
        setModelTestTotal, setFlyingStars, setBalanceGlow,
        setShowExitConfirm, setShowReportModal,
        setReportReason, setReportDetails,
        setQuizFontSize,
        formatTime, createFlyingStar,
        handleOptionSelect, handleSubmitReport, handleNext,
        handleBackWithConfirm, navigate,
    } = useQuizSession();

    useEffect(() => {
        const html = document.documentElement;
        html.style.overflow = 'hidden';
        return () => { html.style.overflow = ''; };
    }, []);

    if (loading) return <LoadingScreen message="প্রাক্টিস সেশন লোড হচ্ছে..." />;

    if (error) return (
        <div className="max-w-md mx-auto p-6 md:p-10 bg-surface border rounded-2xl md:rounded-3xl text-center shadow-lg">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-5 rounded-2xl md:rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <h3 className="text-text font-black text-xl md:text-2xl tracking-tighter mb-3 bn-text">লেসন পথ বিরতি</h3>
            <p className="text-text-muted font-medium leading-relaxed">{error}</p>
            <Link to="/practice" className="mt-5 md:mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 md:px-8 py-3 text-sm font-bold text-white transition-all hover:bg-primary-hover active:scale-95">
                প্রাক্টিসে ফিরে যাও
            </Link>
        </div>
    );

    if (isFinished) {
        const totalQ = modelTestTotal || questions.length;
        const accuracy = Math.round((score / totalQ) * 100) || 0;
        const earnedXp = score * 10;
        const earnedStars = wrongAttempts;

        const handleNextModel = nextModelFile ? () => {
            const nextTitle = title?.replace(/Model Test \d+/, m => {
                const n = parseInt(m.match(/\d+/)?.[0] || '0', 10) + 1;
                return `Model Test ${String(n).padStart(2, '0')}`;
            });
            navigate(`/quiz/${chapterId}?file=${encodeURIComponent(nextModelFile)}&title=${encodeURIComponent(nextTitle || title || '')}&chapterId=${chapterId}`);
        } : null;

        return (
            <QuizResultScreen
                score={score}
                totalQuestions={totalQ}
                title={title}
                accuracy={accuracy}
                earnedXp={earnedXp}
                earnedStars={earnedStars}
                currentLevel={currentLevel}
                file={file}
                onGoHome={() => navigate('/practice')}
                onPracticeAgain={() => window.location.reload()}
                onNextLevel={accuracy >= 80 ? () => {
                    const nextLevel = currentLevel + 1;
                    navigate(`/quiz/${chapterId}?file=${encodeURIComponent(file || '')}&title=${encodeURIComponent(title || '')}&level=${nextLevel}`);
                } : null}
                onNextModel={handleNextModel}
            />
        );
    }

    const currentQ = currentQuestion;

    return (
        <div className="h-full flex flex-col overflow-hidden overscroll-contain px-0 w-full safe-bottom bg-surface" role="main" aria-label="Quiz session">
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
                        <Star className="w-full h-full text-bee" />
                    </motion.div>
                ))}
            </div>

            <div className="flex shrink-0 safe-top">
                <button
                    onClick={handleBackWithConfirm}
                    className="self-center p-1.5 ml-4 mb-2 mt-3 text-text-muted hover:text-text transition-all active:scale-95 shrink-0 flex items-center justify-center touch-target"
                    aria-label="Back to practice"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between gap-2 pr-4 pt-3 pb-2 flex-1 ml-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                            {currentLevel ? (
                                <>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-wider bn-text">লেভেল {currentLevel}</span>
                                        <span className="text-[10px] text-text-muted">·</span>
                                        <span className="text-[10px] font-medium text-text-muted">প্রশ্ন {currentIndex + 1} / {questions.length}</span>
                                    </div>
                                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
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
                                <div className="h-1.5 bg-background rounded-full overflow-hidden">
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
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex items-center gap-1.5 bg-surface border rounded-xl px-2.5 py-1.5 hover:bg-surface-hover transition-all active:scale-95"
                            aria-label="Report a problem"
                        >
                            <Flag className="w-3.5 h-3.5 text-cardinal" />
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Report</span>
                        </button>
                        <div className="hidden md:flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-background border">
                            <button
                                onClick={() => setQuizFontSize(s => Math.max(12, s - 2))}
                                className="text-text-muted hover:text-text transition-colors p-1 flex items-center justify-center"
                                style={{ minWidth: 28, minHeight: 28 }}
                                aria-label="Decrease font size"
                            >
                                <span className="text-[11px] font-black leading-none">A−</span>
                            </button>
                            <span className="w-px h-3 bg-wolf" aria-hidden="true" />
                            <button
                                onClick={() => setQuizFontSize(s => Math.min(24, s + 2))}
                                className="text-text-muted hover:text-text transition-colors p-1 flex items-center justify-center"
                                style={{ minWidth: 28, minHeight: 28 }}
                                aria-label="Increase font size"
                            >
                                <span className="text-[11px] font-black leading-none">A+</span>
                            </button>
                        </div>
                        {isTimedMode && (
                            <div className="px-2.5 py-1.5 rounded-xl bg-background border flex items-center gap-1.5 font-mono font-black text-sm text-text">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>{formatTime(elapsed)}</span>
                            </div>
                        )}
                        {isReviewSession && (
                            <div className="px-2.5 py-1.5 rounded-xl bg-background border flex items-center gap-1.5">
                                <RefreshCw className="w-3.5 h-3.5 text-macaw" />
                                <span className="text-macaw font-black text-[10px]">RVW</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 px-4 pb-3 mt-1">
                <div className="bg-surface border rounded-2xl md:rounded-3xl flex-1 flex flex-col p-4 md:p-6 overflow-hidden quiz-card shadow-sm" style={{ maxHeight: 'calc(var(--app-available-height, 100vh) - 112px)' }}>
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
                                } else {
                                    setIsFinished(true);
                                }
                            }}
                        />
                    ) : (
                        <>
                            {currentQ.passage && !currentQ.text?.includes(currentQ.passage) && (
                                <div className="mb-3 p-3 rounded-xl bg-background border space-y-2 shrink-0 max-h-24 overflow-y-auto">
                                    {currentQ.blankId && (
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                                            SSC Gap Filling - Blank ({currentQ.blankId})
                                        </p>
                                    )}
                                    <p className="text-text-muted leading-relaxed font-medium whitespace-pre-wrap" style={{ fontSize: `${quizFontSize - 2}px` }}>
                                        {stripMath(currentQ.passage)}
                                    </p>
                                    {(currentQ.boxWords || []).length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {currentQ.boxWords.map((word) => (
                                                <span key={word} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">
                                                    {stripMath(word)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mb-3 shrink-0">
                                <div className="bg-background border rounded-2xl p-4 md:p-5">
                                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase border ${currentQ.difficulty === 'hard' ? 'text-cardinal border-cardinal/20 bg-cardinal/10' :
                                            currentQ.difficulty === 'medium' ? 'text-bee border-bee/20 bg-bee/10' :
                                                'text-primary border-primary/20 bg-primary/10'
                                            }`}>{currentQ.difficulty}</span>
                                        {currentQ.source && currentQ.source !== 'unknown' && (
                                            <span className="text-[9px] font-bold px-2.5 py-1 rounded-full border bg-surface text-text-muted uppercase tracking-wider">
                                                {currentQ.source}
                                            </span>
                                        )}
                                        {currentQ.chapter_tag && (
                                            <span className="text-[9px] font-bold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary/60 uppercase tracking-wider">
                                                {currentQ.chapter_tag}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-text leading-snug selection:bg-primary/30" style={{ fontSize: `${quizFontSize}px` }}>
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
                                                        className={`w-full text-left flex-1 min-h-[56px] md:min-h-[64px] px-5 py-4 rounded-full border-2 transition-all flex items-center gap-4 group/opt ${state === 'correct' ? 'bg-primary/10 border-primary text-primary' :
                                                            state === 'wrong' ? 'bg-cardinal/10 border-cardinal text-cardinal' :
                                                                state === 'selected' ? 'bg-primary/10 border-primary text-primary' :
                                                                    state === 'dimmed' ? 'bg-background border-transparent opacity-30' :
                                                                        'bg-surface border text-text-muted hover:border-primary/40 hover:text-text hover:shadow-sm'
                                                            }`}
                                                        role="radio"
                                                        aria-checked={selectedOption === idx}
                                                        tabIndex={isAnswered ? -1 : 0}
                                                    >
                                                        <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all shrink-0 ${state === 'selected' ? 'bg-primary text-white border-primary' :
                                                            state === 'correct' ? 'bg-primary text-white border-primary' :
                                                                state === 'wrong' ? 'bg-cardinal text-white border-cardinal' :
                                                                    'bg-background border text-text-muted group-hover/opt:border-hare group-hover/opt:text-text'
                                                            }`}>
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        <span className="font-bold leading-snug flex-1 text-text" style={{ fontSize: `${quizFontSize}px` }}>
                                                            {stripMath(option.text)}
                                                        </span>
                                                        {state === 'correct' && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />}
                                                        {state === 'wrong' && <XCircle className="w-5 h-5 text-cardinal shrink-0" aria-hidden="true" />}
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
                                                <div className="flex-1 flex flex-col bg-primary/5 border border-primary/20 rounded-2xl p-4 md:p-5 gap-4">
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                                            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                                        </div>
                                                        <h4 className="text-primary font-black text-sm uppercase tracking-wider bn-text">সঠিক!</h4>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto min-h-0 space-y-3 text-xs md:text-sm">
                                                        {(currentQ.explanation_bn || currentQ.explanation) && (
                                                            <div className="bg-surface rounded-xl p-3 border border-primary/10">
                                                                <p className="font-bold text-primary/60 uppercase tracking-wider text-[10px] mb-1 bn-text">বাংলা ব্যাখ্যা</p>
                                                                <p className="text-text/80 leading-relaxed">{currentQ.explanation_bn || currentQ.explanation}</p>
                                                            </div>
                                                        )}
                                                        {currentQ.explanation_en && (
                                                            <div className="bg-surface rounded-xl p-3 border border-primary/10">
                                                                <p className="font-bold text-primary/60 uppercase tracking-wider text-[10px] mb-1 bn-text">ইংরেজি ব্যাখ্যা</p>
                                                                <p className="text-text/80 leading-relaxed">{currentQ.explanation_en}</p>
                                                            </div>
                                                        )}
                                                        {!currentQ.explanation_bn && !currentQ.explanation_en && !currentQ.explanation && (
                                                            <p className="text-text-muted text-sm">সাবাশ!</p>
                                                        )}
                                                        {currentQ.explanation_distractors && currentQ.explanation_distractors.length > 0 && (
                                                            <div className="bg-surface rounded-xl p-3 border border-primary/10">
                                                                <p className="font-bold text-primary/60 uppercase tracking-wider text-[10px] mb-2 bn-text">অন্য অপশনগুলো কেন ভুল</p>
                                                                {currentQ.explanation_distractors.map((d, i) => (
                                                                    <div key={i} className="mb-1.5 last:mb-0">
                                                                        <p className="text-text/90 text-[11px] font-medium mb-0.5">"{d.option}"</p>
                                                                        <p className="text-text-muted text-[10px] leading-relaxed pl-2 border-l border-primary/20">{d.reason}</p>
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
                                                            className="inline-flex items-center gap-1.5 text-primary/60 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors shrink-0 bn-text"
                                                        >
                                                            <Video className="w-3.5 h-3.5" />
                                                            ভিডিও দেখো
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={handleNext}
                                                        className="w-full py-3.5 bg-primary text-white rounded-full font-black text-sm shrink-0 active:scale-[0.97] transition-all hover:bg-primary-hover min-h-touch shadow-sm"
                                                    >
                                                        {currentIndex < questions.length - 1 ? 'চালিয়ে যাও' : 'লেসন শেষ করো'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col bg-cardinal/5 border border-cardinal/20 rounded-2xl p-4 md:p-5 gap-4">
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="w-8 h-8 bg-cardinal rounded-full flex items-center justify-center">
                                                            <XCircle className="w-5 h-5 text-white shrink-0" />
                                                        </div>
                                                        <h4 className="text-cardinal font-black text-sm uppercase tracking-wider bn-text">ভুল!</h4>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-cardinal/20">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-text-muted bn-text">সঠিক উত্তর:</span>
                                                            <span className="font-bold text-sm text-primary">{stripMath(correctAnswerText)}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-text-muted text-[11px] md:text-xs font-medium leading-relaxed shrink-0">
                                                        ভুল থেকে শেখার সুযোগ। একটি স্টার যোগ করা হয়েছে — রিভিউ করে সংগ্রহ করো।
                                                    </p>

                                                    <div className="flex-1 overflow-y-auto min-h-0 space-y-3 text-xs md:text-sm">
                                                        {(currentQ.explanation_bn || currentQ.explanation) && (
                                                            <div className="bg-surface rounded-xl p-3 border border-cardinal/10">
                                                                <p className="font-bold text-cardinal/60 uppercase tracking-wider text-[10px] mb-1 bn-text">বাংলা ব্যাখ্যা</p>
                                                                <p className="text-text/80 leading-relaxed">{currentQ.explanation_bn || currentQ.explanation}</p>
                                                            </div>
                                                        )}
                                                        {currentQ.explanation_en && (
                                                            <div className="bg-surface rounded-xl p-3 border border-cardinal/10">
                                                                <p className="font-bold text-cardinal/60 uppercase tracking-wider text-[10px] mb-1 bn-text">ইংরেজি ব্যাখ্যা</p>
                                                                <p className="text-text/80 leading-relaxed">{currentQ.explanation_en}</p>
                                                            </div>
                                                        )}
                                                        {currentQ.explanation_distractors && currentQ.explanation_distractors.length > 0 && (
                                                            <div className="bg-surface rounded-xl p-3 border border-cardinal/10">
                                                                <p className="font-bold text-cardinal/60 uppercase tracking-wider text-[10px] mb-2 bn-text">অন্য অপশনগুলো কেন ভুল</p>
                                                                {currentQ.explanation_distractors.map((d, i) => (
                                                                    <div key={i} className="mb-1.5 last:mb-0">
                                                                        <p className="text-text/90 text-[11px] font-medium mb-0.5">"{d.option}"</p>
                                                                        <p className="text-text-muted text-[10px] leading-relaxed pl-2 border-l border-cardinal/20">{d.reason}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={handleNext}
                                                        className="w-full py-3.5 bg-primary text-white rounded-full font-black text-sm shrink-0 active:scale-[0.97] transition-all hover:bg-primary-hover min-h-touch shadow-sm"
                                                    >
                                                        বুঝেছি
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

            <ExitConfirmModal
                show={showExitConfirm}
                onStay={() => setShowExitConfirm(false)}
                onLeave={() => { setShowExitConfirm(false); navigate('/practice'); }}
            />
            <ReportModal
                show={showReportModal}
                reason={reportReason}
                details={reportDetails}
                onReasonChange={setReportReason}
                onDetailsChange={setReportDetails}
                onSubmit={handleSubmitReport}
                onClose={() => setShowReportModal(false)}
            />
        </div>
    );
};

export default Quiz;
