import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMistakesDueCount } from '../services/review';
import { playSound } from '../utils/sounds';
import { useMistakeStore } from '../stores/mistakeStore';
import { useQuizLoader } from './useQuizLoader';
import { useQuizTimer } from './useQuizTimer';
import { useQuizAnswer } from './useQuizAnswer';
import { useQuizPersistence } from './useQuizPersistence';

export function useQuizSession() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const chapterIdFromParams = useParams().chapterId;

  const file = searchParams.get('file');
  const title = searchParams.get('title');
  const chapterId = chapterIdFromParams;
  const isTimedMode = searchParams.get('timed') === 'true';
  const isReviewMode = searchParams.get('reviewMode') === 'true';
  const isChallenge = searchParams.get('challenge') === 'daily' || searchParams.get('challenge') === 'weekly';
  const challengeType = searchParams.get('challenge');
  const isMock = searchParams.get('isMock') === 'true';

  const {
    questions, loading, error, historicalAnswered, totalQuestionCount, currentLevel,
    setQuestions, setCurrentLevel, setTotalQuestionCount, setHistoricalAnswered,
  } = useQuizLoader();

  const { elapsed, setElapsed, questionStartRef, formatTime } = useQuizTimer(
    !loading && questions.length > 0
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [levelSessionSaved, setLevelSessionSaved] = useState(false);
  const [modelTestTotal, setModelTestTotal] = useState(0);
  const scoredIdsRef = useRef(new Set<string>());

  const mistakeRefreshKey = useMistakeStore((s) => s.refreshKey);
  const [mistakeCount, setMistakeCount] = useState(0);

  useEffect(() => {
    setMistakeCount(getMistakesDueCount());
  }, [mistakeRefreshKey]);

  const {
    selectedOption, isAnswered, score, results, flyingStars, balanceGlow,
    wrongAttempts, showReportModal, reportReason, reportDetails, showExitConfirm,
    quizFontSize, starTargetRef, finishSoundPlayedRef,
    shuffledOptions, gapFillGroup, currentQuestion,
    selectedOriginalIdx, isCurrentCorrect, correctAnswerText, isManyOptions,
    totalXpSoFar, isReviewSession, nextModelFile,
    streakBonusXp, consecutiveCorrect,
    setScore, setSelectedOption, setIsAnswered,
    setResults, setWrongAttempts,
    setFlyingStars, setBalanceGlow,
    setShowExitConfirm, setShowReportModal,
    setReportReason, setReportDetails, setQuizFontSize,
    createFlyingStar, getQuestionKey,
    handleOptionSelect, handleSubmitReport, handleNext, handleBackWithConfirm,
  } = useQuizAnswer({
    questions, currentIndex, setCurrentIndex, setIsFinished,
    file, title, chapterId, user, questionStartRef,
  });

  const earnedXp = questions.reduce((sum, q, i) => {
    const r = results[i];
    if (!r?.isCorrect) return sum;
    const difficulty = (r as any).difficulty || 'medium';
    const xpMap: Record<string, number> = { easy: 5, medium: 10, hard: 20 };
    return sum + (xpMap[difficulty] || 10);
  }, 0) + streakBonusXp;

  useQuizPersistence({
    isFinished, questions, score, chapterId, title, file,
    isTimedMode, isReviewMode, currentLevel, levelSessionSaved,
    isChallenge, challengeType, modelTestTotal, wrongAttempts,
    earnedXp, setLevelSessionSaved,
  });

  // Reset quiz state when questions reload
  useEffect(() => {
    if (!loading && questions.length > 0) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
      setResults([]);
      setWrongAttempts(0);
      setLevelSessionSaved(false);
      finishSoundPlayedRef.current = false;
    }
  }, [loading, questions]);

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

  return {
    questions, loading, error,
    currentIndex, selectedOption, isAnswered, score, isFinished, results,
    mistakeCount, flyingStars, balanceGlow,
    showReportModal, reportReason, reportDetails,
    showExitConfirm, elapsed, wrongAttempts,
    currentLevel, levelSessionSaved,
    historicalAnswered, totalQuestionCount,
    quizFontSize,
    starTargetRef, scoredIdsRef,
    currentQuestion, shuffledOptions, gapFillGroup,
    totalXpSoFar, isReviewSession,
    selectedOriginalIdx, isCurrentCorrect, correctAnswerText, isManyOptions,
    nextModelFile, modelTestTotal,
    file, title, chapterId, user, isTimedMode,
    setScore, setCurrentIndex, setSelectedOption, setIsAnswered,
    setResults, setWrongAttempts, setMistakeCount,
    setModelTestTotal, setFlyingStars, setBalanceGlow,
    setIsFinished, setShowExitConfirm, setShowReportModal,
    setReportReason, setReportDetails, setQuizFontSize,
    formatTime, getQuestionKey,
    createFlyingStar,
    handleOptionSelect, handleSubmitReport, handleNext,
    handleBackWithConfirm, navigate,
  };
}
