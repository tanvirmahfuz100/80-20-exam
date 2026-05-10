import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-white/10 animate-spin" />
        <p className="text-sm font-bold text-white/70">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
