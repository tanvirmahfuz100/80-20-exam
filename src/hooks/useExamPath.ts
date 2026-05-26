import { useState, useCallback } from 'react';

const STORAGE_KEY = 'user_exam_path';

/** Reads & writes the user's exam path from localStorage.
 *
 *  Shape: { exam, group, class, medium }
 *  exam:   'SSC'|'HSC'|'BCS'|'IBA'|'Class1-8'
 *  group:  'Science'|'Business'|'Arts'|null
 *  class:  1-8|null
 *  medium: 'Bangla'|'English'|null
 *
 *  IMPORTANT: Quiz history, XP, stars, and mistake review data are keyed by question ID,
 *  NOT by exam path. Switching paths preserves all progress — it only changes which
 *  subjects appear on the home screen. */
export function useExamPath() {
  const [examPath, setExamPathState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setExamPath = useCallback((path) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(path));
    setExamPathState(path);
  }, []);

  const clearExamPath = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setExamPathState(null);
  }, []);

  return { examPath, setExamPath, clearExamPath };
}
