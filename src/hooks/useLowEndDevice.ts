import { useState, useEffect } from 'react';

export function useLowEndDevice() {
  const [deviceInfo, setDeviceInfo] = useState({
    isLowEnd: false,
    isMobile: false,
    isSlowConnection: false,
  });

  useEffect(() => {
    const cores = navigator.hardwareConcurrency;
    const memory = navigator.deviceMemory;
    const connection = navigator.connection;
    const screenWidth = window.screen?.width || window.innerWidth;
    const ua = navigator.userAgent;

    const isMobile = screenWidth <= 480 || /Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData === true
    );
    const isLowEnd = (
      isSlowConnection ||
      (cores !== undefined && cores <= 4) ||
      (memory !== undefined && memory <= 2) ||
      (isMobile && cores !== undefined && cores <= 8)
    );

    setDeviceInfo({ isLowEnd, isMobile, isSlowConnection });

    if (isLowEnd) {
      document.body.classList.add('low-end');
    }

    const handleConnectionChange = () => {
      if (connection) {
        const slow = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
        if (slow) {
          document.body.classList.add('low-end');
          setDeviceInfo(prev => ({ ...prev, isLowEnd: true, isSlowConnection: true }));
        }
      }
    };

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      if (isLowEnd) {
        document.body.classList.remove('low-end');
      }
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return deviceInfo;
}
