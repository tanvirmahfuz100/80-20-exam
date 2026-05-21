import { useEffect } from 'react';

const THRESHOLD_CORES = 4;
const THRESHOLD_MEMORY = 2;

export function useLowEndDevice() {
  useEffect(() => {
    const cores = navigator.hardwareConcurrency;
    const memory = navigator.deviceMemory;

    let lowEnd = false;
    if (cores !== undefined && cores <= THRESHOLD_CORES) lowEnd = true;
    if (memory !== undefined && memory <= THRESHOLD_MEMORY) lowEnd = true;

    if (lowEnd) {
      document.body.classList.add('low-end');
    }

    return () => {
      if (lowEnd) {
        document.body.classList.remove('low-end');
      }
    };
  }, []);
}
