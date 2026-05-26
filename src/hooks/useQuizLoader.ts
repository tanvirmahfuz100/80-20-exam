import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import { getReviewSession } from '../services/review';
import { normalizeQuizQuestions } from '../services/quizUtils';
import { computeLevels } from '../services/levels';
import type { NormalizedQuestion } from '../types';

interface QuizLoaderResult {
  questions: NormalizedQuestion[];
  loading: boolean;
  error: string | null;
  historicalAnswered: number;
  totalQuestionCount: number;
  currentLevel: number | null;
  setQuestions: (q: NormalizedQuestion[]) => void;
  setCurrentLevel: (l: number | null) => void;
  setTotalQuestionCount: (n: number) => void;
  setHistoricalAnswered: (n: number) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
}

export function useQuizLoader(): QuizLoaderResult {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const chapterIdFromParams = useParams().chapterId;

  const file = searchParams.get('file');
  const title = searchParams.get('title');
  const chapterId = chapterIdFromParams;
  const isReviewMode = searchParams.get('reviewMode') === 'true';
  const levelParam = searchParams.get('level');
  const isMock = searchParams.get('isMock') === 'true';
  const isDaily = searchParams.get('daily') === 'true';

  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalAnswered, setHistoricalAnswered] = useState(0);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        if (isReviewMode) {
          const reviewQuestions = getReviewSession();
          if (reviewQuestions.length > 0) {
            setQuestions(reviewQuestions as NormalizedQuestion[]);
          } else {
            setError('No review questions found.');
          }
        } else if (isMock && chapterId) {
          const { data } = await api.getMockTestQuestions(chapterId);
          setQuestions(data || []);
        } else if (file) {
          let fileUrl = file;
          if (fileUrl.startsWith('/')) {
            const base = import.meta.env.BASE_URL || '/';
            fileUrl = `${base}${fileUrl.replace(/^\//, '')}`;
          }
          const res = await fetch(fileUrl);
          const data = await res.json();

          let questionArray: any[] = [];
          if (Array.isArray(data)) {
            if (data.length > 0 && Array.isArray(data[0].items)) {
              questionArray = data.flatMap((set: any) =>
                (set.items || []).map((item: any) => {
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

          const normalized = normalizeQuizQuestions({ questions: questionArray }) as NormalizedQuestion[];

          const existing = await api.getUserResponses(user?.id);
          const answeredIds = new Set(
            (existing.data || [])
              .filter((r: any) => r.chapter_id === chapterId || r.source_file === file)
              .map((r: any) => r.question_id)
              .filter(Boolean)
          );
          const fresh = normalized.filter(q => !answeredIds.has(q.id) || (q as any).blankId);
          setTotalQuestionCount(normalized.length);
          setHistoricalAnswered(answeredIds.size);

          const target = fresh.length > 0 ? fresh : normalized;

          if (levelParam) {
            const computed = computeLevels(target);
            const levelNum = parseInt(levelParam, 10);
            const matchedLevel = computed.find(l => l.levelNumber === levelNum);
            if (matchedLevel) {
              setCurrentLevel(levelNum);
              setQuestions(matchedLevel.questions as NormalizedQuestion[]);
            } else {
              setQuestions(target);
            }
          } else {
            setQuestions(target);
          }
        } else if (isDaily) {
          const { getDailyQuizQuestions } = await import('../services/dailyQuiz');
          const raw = await getDailyQuizQuestions();
          const normalized = raw.map((q: any) => ({
            id: q.id || Math.random().toString(36),
            text: q.question || '',
            options: q.options?.map((o: any) => o.text) || [],
            correct: (() => {
              if (!q.answer || !q.options) return 0;
              const letter = q.answer.toUpperCase();
              const keys = q.options.map((o: any) => o.key.toUpperCase());
              const idx = keys.indexOf(letter);
              return idx >= 0 ? idx : 0;
            })(),
            explanation: q.explanation || '',
            source: q.source || '',
            difficulty: 'medium',
          }));
          setQuestions(normalized);
          setTotalQuestionCount(normalized.length);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [file, chapterId, isMock, isReviewMode, levelParam, isDaily, user?.id]);

  return {
    questions, loading, error, historicalAnswered, totalQuestionCount, currentLevel,
    setQuestions, setCurrentLevel, setTotalQuestionCount, setHistoricalAnswered,
    setLoading, setError,
  };
}
