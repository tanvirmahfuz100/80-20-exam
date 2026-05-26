import { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  addMistake, advanceStage, resetStage,
  getMistakesDueCount,
} from '../services/review';
import { playSound } from '../utils/sounds';
import { useMistakeStore } from '../stores/mistakeStore';
import { REPORT_CONFIG } from '../config/report';
import type { NormalizedQuestion } from '../types';

interface ShuffledOption {
  text: string;
  originalIdx: number;
}

interface AnswerResult {
  id: string;
  isCorrect: boolean;
  selected: number;
  selectedOriginalIdx: number;
  time_spent: number;
}

interface UseQuizAnswerParams {
  questions: NormalizedQuestion[];
  currentIndex: number;
  setCurrentIndex: (n: number | ((prev: number) => number)) => void;
  setIsFinished: (b: boolean | ((prev: boolean) => boolean)) => void;
  file: string | null;
  title: string | null;
  chapterId: string | undefined;
  user: any;
  questionStartRef: React.MutableRefObject<number>;
  setElapsed?: (n: number | ((prev: number) => number)) => void;
}

export function useQuizAnswer({
  questions, currentIndex, setCurrentIndex, setIsFinished,
  file, title, chapterId, user, questionStartRef,
}: UseQuizAnswerParams) {
  const navigate = useNavigate();
  const { api } = {} as any; // Not needed here but kept for type compat

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [flyingStars, setFlyingStars] = useState<any[]>([]);
  const [balanceGlow, setBalanceGlow] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [quizFontSize, setQuizFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('quiz-font-size')!) || 16; } catch { return 16; }
  });
  const starTargetRef = useRef<HTMLDivElement | null>(null);
  const finishSoundPlayedRef = useRef(false);

  const shuffledOptions = useMemo(() => {
    if (!questions[currentIndex]) return null;
    const q = questions[currentIndex];
    const opts: ShuffledOption[] = (q.options || []).map((text: string, idx: number) => ({ text, originalIdx: idx }));
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [questions, currentIndex]);

  const gapFillGroup = useMemo(() => {
    const q = questions[currentIndex];
    if (!q?.passage || !(q as any).blankId) return null;

    const blanks: any[] = [];

    for (let i = currentIndex; i < questions.length; i++) {
      const ni = questions[i];
      if (!(ni as any).blankId || ni.passage !== q.passage) break;
      blanks.push({
        blankId: (ni as any).blankId,
        id: (ni as any).blankId,
        questionId: ni.id,
        correct: ni.options?.[ni.correct] || '',
        correct_answer: ni.options?.[ni.correct] || '',
        explanation_bn: (ni as any).explanation_bn || (ni as any).explanation || '',
        explanation_en: (ni as any).explanation_en || '',
        options: (ni.options || []).map((opt: string, idx: number) => ({
          text: opt,
          isCorrect: idx === ni.correct,
          explanationBn: (ni as any).explanation_bn || (ni as any).explanation || '',
          explanationEn: (ni as any).explanation_en || '',
        })),
        correctText: ni.options?.[ni.correct] || '',
      });
    }

    if (blanks.length === 0) return null;

    return {
      passage: q.passage,
      boxWords: (q as any).boxWords || [],
      difficulty: (q as any).difficulty || 'medium',
      blanks,
      startIndex: currentIndex,
      endIndex: currentIndex + blanks.length - 1,
    };
  }, [questions, currentIndex]);

  const currentQuestion = questions[currentIndex];
  const totalXpSoFar = results.reduce((acc, r) => acc + (r.isCorrect ? 10 : 0), 0);
  const isReviewSession = false;

  const selectedOriginalIdx = isAnswered && selectedOption !== null ? shuffledOptions?.[selectedOption]?.originalIdx : -1;
  const isCurrentCorrect = selectedOriginalIdx === currentQuestion?.correct;
  const correctAnswerText = shuffledOptions?.find(o => o.originalIdx === currentQuestion?.correct)?.text;
  const isManyOptions = (shuffledOptions?.length || 0) >= 5;

  const nextModelFile = useMemo(() => {
    if (!file) return null;
    const match = file.match(/model_(\d+)\.json$/);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    const next = String(num + 1).padStart(match[1].length, '0');
    return file.replace(/model_\d+\.json$/, `model_${next}.json`);
  }, [file]);

  const getQuestionKey = useCallback((question: any) =>
    question.uuid || question.id || question.text || `question-${currentIndex}`,
  [currentIndex]);

  const createFlyingStar = useCallback((buttonRect: DOMRect | null, clickX: number, clickY: number) => {
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
  }, []);

  const handleOptionSelect = useCallback(async (index: number, event?: React.MouseEvent) => {
    if (isAnswered) return;

    const currentQ = questions[currentIndex];
    const selectedObj = shuffledOptions?.[index];
    const origIdx = selectedObj?.originalIdx ?? -1;
    const correct = origIdx === currentQ.correct;
    const questionKey = getQuestionKey(currentQ);

    setSelectedOption(index);
    setIsAnswered(true);

    if (correct) {
      setScore(s => s + 1);
      playSound('correctAnswer');

      if ((currentQ as any)._mistakeId) {
        advanceStage((currentQ as any)._mistakeId);
      }
    }

    if (!correct) {
      playSound('star');
      setWrongAttempts(w => w + 1);
      if ((currentQ as any)._mistakeId) {
        resetStage((currentQ as any)._mistakeId);
      } else {
        addMistake(questionKey, currentQ, { file, title: title || undefined, chapterId });
      }
      const rect = (event as any)?.currentTarget?.getBoundingClientRect();
      createFlyingStar(rect, (event as any)?.clientX, (event as any)?.clientY);
      setMistakeCount(getMistakesDueCount());
    }

    const questionTime = Math.round((Date.now() - questionStartRef.current) / 1000);

    const newResult: AnswerResult = {
      id: currentQ.id,
      isCorrect: correct,
      selected: index,
      selectedOriginalIdx: origIdx,
      time_spent: questionTime,
    };

    setResults(prev => [...prev, newResult]);

    const { api: localApi } = await import('../services/localApi');
    await localApi.saveResponse({
      user_id: user.id,
      question_id: currentQ.uuid || currentQ.id || null,
      chapter_id: chapterId || null,
      chapter_title: title || null,
      source_file: file || null,
      question_text: currentQ.text || null,
      selected_option_index: origIdx,
      selected_option_text: selectedObj?.text || null,
      correct_option_index: currentQ.correct,
      correct_option_text: (currentQ.options || [])[currentQ.correct] || null,
      is_correct: correct,
      time_spent: questionTime,
      status: 'answered',
    });
  }, [isAnswered, questions, currentIndex, shuffledOptions, file, title, chapterId, user?.id, getQuestionKey, createFlyingStar, questionStartRef]);

  const handleSubmitReport = useCallback(() => {
    const currentQ = questions[currentIndex];
    const optionsText = currentQ?.options
      ? currentQ.options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')
      : 'N/A';
    const questionLink = window.location.href;
    const parts = [
      '📝 *Problem Report*',
      '',
      `*Reason:* ${reportReason || 'N/A'}`,
      '',
      `*Question:* ${currentQ?.text || currentQ?.question || 'N/A'}`,
      '',
      `*Options:*\n${optionsText}`,
      '',
      `*Link:* ${questionLink}`,
    ];
    if (reportDetails) {
      parts.push('', `*Details:* ${reportDetails}`);
    }
    const message = parts.join('\n');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${REPORT_CONFIG.whatsappNumber}?text=${encoded}`, '_blank');
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
  }, [questions, currentIndex, reportReason, reportDetails]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      questionStartRef.current = Date.now();
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, questions.length, setCurrentIndex, setIsFinished, questionStartRef]);

  const handleBackWithConfirm = useCallback(() => {
    if (questions.length > 0 && !isAnswered) {
      setShowExitConfirm(true);
    } else {
      navigate('/practice');
    }
  }, [questions.length, isAnswered, navigate]);

  return {
    selectedOption, isAnswered, score, results, mistakeCount,
    flyingStars, balanceGlow, wrongAttempts,
    showReportModal, reportReason, reportDetails, showExitConfirm,
    quizFontSize,
    starTargetRef, finishSoundPlayedRef,
    shuffledOptions, gapFillGroup, currentQuestion,
    selectedOriginalIdx, isCurrentCorrect, correctAnswerText, isManyOptions,
    totalXpSoFar, isReviewSession, nextModelFile,
    setScore, setSelectedOption, setIsAnswered,
    setResults, setWrongAttempts, setMistakeCount,
    setFlyingStars, setBalanceGlow,
    setShowExitConfirm, setShowReportModal,
    setReportReason, setReportDetails, setQuizFontSize,
    createFlyingStar, getQuestionKey,
    handleOptionSelect, handleSubmitReport, handleNext, handleBackWithConfirm,
  };
}
