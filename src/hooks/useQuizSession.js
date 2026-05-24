import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import {
  addMistake, advanceStage, resetStage,
  getMistakesDueCount, getReviewSession, clearReviewSession
} from '../services/review';
import { playSound } from '../utils/sounds';
import { computeLevels, saveLevelProgress, addXp, addStars, completeDailyChallengeById, advanceWeeklyChallenge } from '../services/levels';
import { normalizeQuizQuestions } from '../services/quizUtils';

export function useQuizSession() {
  const { user, updateProfileFields } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const chapterIdFromParams = useParams().chapterId;

  const file = searchParams.get('file');
  const title = searchParams.get('title');
  const chapterId = chapterIdFromParams;
  const isTimedMode = searchParams.get('timed') === 'true';
  const isReviewMode = searchParams.get('reviewMode') === 'true';
  const levelParam = searchParams.get('level');
  const isChallenge = searchParams.get('challenge') === 'daily' || searchParams.get('challenge') === 'weekly';
  const challengeType = searchParams.get('challenge');
  const isMock = searchParams.get('isMock') === 'true';

  // ── State ──
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
  const finishSoundPlayedRef = useRef(false);

  // ── Derived ──
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

  const currentQuestion = questions[currentIndex];
  const totalXpSoFar = results.reduce((acc, r) => acc + (r.isCorrect ? 10 : 0), 0);
  const isReviewSession = isReviewMode;

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

  // ── Effects ──
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
  }, [file, chapterId, isMock, isReviewMode, levelParam, user?.id]);

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

  // ── Handlers ──
  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const getQuestionKey = useCallback((question) => question.uuid || question.id || question.text || `question-${currentIndex}`, [currentIndex]);

  const createFlyingStar = useCallback((buttonRect, clickX, clickY) => {
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

  const handleOptionSelect = useCallback(async (index, event) => {
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
        addMistake(questionKey, currentQ, { file, title: title || undefined, chapterId });
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
  }, [isAnswered, questions, currentIndex, shuffledOptions, file, title, chapterId, user?.id, getQuestionKey, createFlyingStar]);

  const handleSubmitReport = useCallback(() => {
    const currentQ = questions[currentIndex];
    const text = `Report:%0A%0AReason: ${reportReason}%0A%0AQuestion: ${currentQ?.text || 'N/A'}%0AFile: ${file || 'N/A'}%0ADetails: ${reportDetails || 'N/A'}`;
    window.open(`https://wa.me/8801884581816?text=${text}`, '_blank');
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
  }, [questions, currentIndex, reportReason, reportDetails, file]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      questionStartRef.current = Date.now();
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, questions.length]);

  const handleBackWithConfirm = useCallback(() => {
    if (questions.length > 0 && !isFinished) {
      setShowExitConfirm(true);
    } else {
      navigate('/practice');
    }
  }, [questions.length, isFinished, navigate]);

  // ── Export ──
  return {
    // State
    questions, loading, error,
    currentIndex, selectedOption, isAnswered, score, isFinished, results,
    mistakeCount, flyingStars, balanceGlow,
    showReportModal, reportReason, reportDetails,
    showExitConfirm, elapsed, wrongAttempts,
    currentLevel, levelSessionSaved,
    historicalAnswered, totalQuestionCount,
    quizFontSize,
    // Refs
    starTargetRef, scoredIdsRef, questionStartRef,
    // Derived
    currentQuestion, shuffledOptions, gapFillGroup,
    totalXpSoFar, isReviewSession,
    selectedOriginalIdx, isCurrentCorrect, correctAnswerText, isManyOptions,
    nextModelFile, modelTestTotal,
    file, title, chapterId, user, isTimedMode,
    // Setters (exposed for child component callbacks)
    setScore, setCurrentIndex, setSelectedOption, setIsAnswered,
    setResults, setWrongAttempts, setMistakeCount,
    setModelTestTotal, setFlyingStars, setBalanceGlow,
    // Modal controls
    setShowExitConfirm, setShowReportModal,
    setReportReason, setReportDetails,
    // Preference
    setQuizFontSize,
    // Handlers
    formatTime, getQuestionKey, createFlyingStar,
    handleOptionSelect, handleSubmitReport, handleNext,
    handleBackWithConfirm,
    // Navigation
    navigate,
  };
}
