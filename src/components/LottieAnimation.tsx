import React, { useRef, useCallback, useEffect } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

interface LottieAnimationProps {
  src: unknown;
  className?: string;
  lottieStyle?: React.CSSProperties;
  loop?: boolean;
  autoplay?: boolean;
  pingPong?: boolean;
  delay?: number;
  renderer?: 'svg' | 'canvas' | 'html';
}

const LottieAnimation = ({ src, className = 'w-48 h-48', lottieStyle, loop = true, autoplay = true, pingPong = false, delay = 2500, renderer = 'svg' }: LottieAnimationProps) => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const directionRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = useCallback(() => {
    const anim = lottieRef.current;
    if (!anim) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (directionRef.current === 1) {
      directionRef.current = -1;
      timerRef.current = setTimeout(() => {
        anim.setDirection(-1);
        anim.play();
      }, delay);
    } else {
      directionRef.current = 1;
      anim.setDirection(1);
      anim.play();
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (pingPong) {
    return (
      <div className={className}>
        <Lottie
          lottieRef={lottieRef}
          animationData={src}
          loop={false}
          autoplay={true}
          onComplete={handleComplete}
          style={lottieStyle}
          renderer={renderer}
        />
      </div>
    );
  }

  return <div className={className}><Lottie animationData={src} loop={loop} autoplay={autoplay} style={lottieStyle} renderer={renderer} /></div>;
};

export default LottieAnimation;
