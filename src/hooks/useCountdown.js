import { useState, useEffect } from 'react';

export function useCountdown(expiryFns) {
  const [countdown, setCountdown] = useState(() => {
    const initial = {};
    for (const key of Object.keys(expiryFns)) {
      initial[key] = expiryFns[key]();
    }
    return initial;
  });

  useEffect(() => {
    const tick = () => {
      const next = {};
      for (const key of Object.keys(expiryFns)) {
        next[key] = expiryFns[key]();
      }
      setCountdown(next);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [expiryFns]);

  return countdown;
}
