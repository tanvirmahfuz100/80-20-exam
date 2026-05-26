import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import { clearReviewSession } from '../services/review';
import {
  saveLevelProgress, addXp, addStars,
  completeDailyChallengeById, advanceWeeklyChallenge,
} from '../services/levels';
import type { NormalizedQuestion } from '../types';

interface UseQuizPersistenceParams {
  isFinished: boolean;
  questions: NormalizedQuestion[];
  score: number;
  chapterId: string | undefined;
  title: string | null;
  file: string | null;
  isTimedMode: boolean;
  isReviewMode: boolean;
  currentLevel: number | null;
  levelSessionSaved: boolean;
  isChallenge: boolean;
  challengeType: string | null;
  modelTestTotal: number;
  wrongAttempts: number;
  setLevelSessionSaved: (b: boolean) => void;
}

export function useQuizPersistence(params: UseQuizPersistenceParams) {
  const {
    isFinished, questions, score, chapterId, title, file,
    isTimedMode, isReviewMode, currentLevel, levelSessionSaved,
    isChallenge, challengeType, modelTestTotal, wrongAttempts,
    setLevelSessionSaved,
  } = params;
  const { user, updateProfileFields } = useAuth();
  const sessionSavedRef = useRef(false);

  useEffect(() => {
    const persist = async () => {
      if (!isFinished || sessionSavedRef.current || !user?.id || questions.length === 0) return;

      const totalQ = modelTestTotal || questions.length;
      const accuracy = totalQ > 0 ? Number(((score / totalQ) * 100).toFixed(2)) : 0;

      await api.savePracticeSession({
        user_id: user.id,
        chapter_id: chapterId || file || 'unknown_chapter',
        chapter_title: title || 'Practice Session',
        source_file: file || null,
        total_questions: totalQ,
        correct_answers: score,
        wrong_answers: totalQ - score,
        accuracy,
        mode: isTimedMode ? 'timed' : 'untimed',
      });

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
        const levelAccuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
        saveLevelProgress(user.id, chapterId, currentLevel, {
          completed: true,
          accuracy: levelAccuracy,
          xpEarned: earnedXp,
          starsEarned: wrongAttempts,
        });
        addXp(user.id, earnedXp);
        if (wrongAttempts > 0) addStars(user.id, wrongAttempts);

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

    persist();
  }, [isFinished, user, questions, score, chapterId, title, file, isTimedMode, isReviewMode, currentLevel, levelSessionSaved, isChallenge, challengeType, modelTestTotal, wrongAttempts, updateProfileFields, setLevelSessionSaved]);
}
