import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, RefreshCw, Flag,
    Zap, Clock, Video, Star, Sparkles
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
        quizFontSize, starTargetRef, scoredIdsRef, questionStartRef,
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
