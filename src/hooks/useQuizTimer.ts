import { useState, useEffect, useRef, useCallback } from 'react';

export function useQuizTimer(isActive: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef(Date.now());

  useEffect(() => {
    if (!isActive) return;
    questionStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

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

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return { elapsed, setElapsed, timerRef, questionStartRef, formatTime };
}
