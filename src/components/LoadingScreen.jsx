import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LottieAnimation from './LottieAnimation';
import gameControllerAnimation from '../assets/game-controller.json';

const LoadingScreen = ({ message = 'Loading...' }) => {
  const tips = [
    "Students who review mistakes are 3x more likely to pass",
    "Practicing 20 minutes daily beats 2 hours once a week",
    "Your starred questions are waiting — review them to lock in the answers",
    "Consistency beats intensity. Show up every day.",
    "Master the essentials. Focus on what moves the needle.",
    "Wrong answers aren't failures — they're your study list",
  ];
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4"
    >
      <div className="w-28 h-28 md:w-36 md:h-36">
        <LottieAnimation src={gameControllerAnimation} className="w-full h-full" pingPong />
      </div>
      <p className="text-white/30 font-black uppercase tracking-[0.25em] text-[10px] md:text-[11px] text-center">
        {message}
      </p>
      <p className="text-white/50 text-sm max-w-xs text-center leading-relaxed font-medium">
        {tip}
      </p>
    </motion.div>
  );
};

export default LoadingScreen;
