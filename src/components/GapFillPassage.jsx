import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

const BLANK_REGEX = /_*\(([a-z])\)\s*_+|\(([a-z])\)\s*_+/g;

const GapFillPassage = ({ passage, blanks, boxWords, difficulty, onBlankAnswer, onContinue }) => {
  const [answers, setAnswers] = useState({});
  const [activePopover, setActivePopover] = useState(null);
  const [explanationPanel, setExplanationPanel] = useState(null);
  const blankRefs = useRef({});
  const popoverRef = useRef(null);
  const explanationRef = useRef(null);

  const segments = useMemo(() => {
    if (!passage) return [{ type: 'text', content: '' }];
    const parts = [];
    let lastIndex = 0;
    const regex = new RegExp(BLANK_REGEX.source, 'g');
    let match;
    while ((match = regex.exec(passage)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: passage.slice(lastIndex, match.index) });
      }
      const blankId = match[1] || match[2];
      parts.push({ type: 'blank', blankId });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < passage.length) {
      parts.push({ type: 'text', content: passage.slice(lastIndex) });
    }
    return parts;
  }, [passage]);

  const getBlankData = useCallback((blankId) => {
    return blanks.find(b => b.blankId === blankId || b.id === blankId);
  }, [blanks]);

  const handleBlankClick = useCallback((blankId, event) => {
    const blankData = getBlankData(blankId);
    if (!blankData) return;
    const currentAnswer = answers[blankId];
    // Prevent clicks if already answered correctly
    if (currentAnswer?.isCorrect) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const popoverWidth = 200;
    const popoverHeight = 160;
    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2;
    if (top + popoverHeight > window.innerHeight - 20) {
      top = Math.max(8, rect.top - popoverHeight - 8);
    }
    left = Math.max(popoverWidth / 2 + 12, Math.min(left, window.innerWidth - popoverWidth / 2 - 12));
    setActivePopover(prev => prev?.blankId === blankId ? null : { blankId, top, left });
    // Close explanation panel when opening blank popover
    setExplanationPanel(null);
  }, [answers]);

  const closeExplanationPanel = useCallback(() => {
    setExplanationPanel(null);
  }, []);

  const handleOptionSelect = useCallback((blankId, optionText, isCorrect, explanationBn, explanationEn) => {
    const blankData = getBlankData(blankId);
    if (!blankData) return;
    
    const blankEl = blankRefs.current[blankId];
    const rect = blankEl?.getBoundingClientRect();
    
    // Use option-level explanation, fall back to blank-level explanation
    const finalExplanationBn = explanationBn || blankData?.explanation_bn || '';
    const finalExplanationEn = explanationEn || blankData?.explanation_en || '';
    
    // Store the answer with explanation
    setAnswers(prev => ({ 
      ...prev, 
      [blankId]: { 
        selected: optionText, 
        isCorrect, 
        explanationBn: finalExplanationBn,
        explanationEn: finalExplanationEn
      } 
    }));
    
    // Show explanation panel below the blank
    if (rect) {
      setExplanationPanel({
        blankId,
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        explanationBn: finalExplanationBn,
        explanationEn: finalExplanationEn,
        isCorrect
      });
    }
    
    // Close the options popover
    setActivePopover(null);
    
    // Only call onBlankAnswer if correct
    if (isCorrect) {
      onBlankAnswer?.(blankId, true, optionText);
    }
  }, [getBlankData, onBlankAnswer]);

  const closePopover = useCallback(() => setActivePopover(null), []);

  useEffect(() => {
    if (!activePopover) return;
    const handleClickOutside = (e) => {
      const blankEl = blankRefs.current[activePopover.blankId];
      if (blankEl?.contains(e.target)) return;
      if (popoverRef.current?.contains(e.target)) return;
      closePopover();
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopover, closePopover]);

  const answeredCount = Object.keys(answers).length;
  const totalBlanks = blanks.length;
  const activeBlankData = activePopover ? getBlankData(activePopover.blankId) : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        <p className="text-text text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return <span key={i}>{seg.content}</span>;
            }
            const answer = answers[seg.blankId];
            const blankData = getBlankData(seg.blankId);
            const isAnswered = !!answer;

            const hasData = !!blankData;

            return (
              <span
                key={i}
                ref={el => { if (hasData) blankRefs.current[seg.blankId] = el; }}
                onClick={hasData ? (e) => handleBlankClick(seg.blankId, e) : undefined}
                className={`
                  relative inline-flex items-center gap-1 mx-0.5 px-2 py-0.5
                  min-w-[60px] justify-center
                  font-bold text-sm md:text-base leading-relaxed
                  transition-all duration-200 select-none
                  border-b-[3px]
                  ${hasData && (!isAnswered || !answer.isCorrect) ? 'cursor-pointer' : 'cursor-default'}
                  ${isAnswered
                    ? answer.isCorrect
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/[0.08] rounded-md'
                      : 'border-amber-500 text-amber-400 bg-amber-500/[0.08] rounded-md'
                    : hasData
                      ? 'border-white/40 text-text-muted hover:border-white hover:text-text bg-white/[0.02] rounded-md hover:bg-white/[0.06]'
                      : 'border-white/10 text-text-dim/30 bg-transparent'
                  }
                `}
              >
                {isAnswered ? (
                  answer.isCorrect ? (
                    <span className="text-emerald-400 font-bold">{blankData?.correct || blankData?.correct_answer}</span>
                  ) : (
                    <span className="text-amber-400 font-bold line-through decoration-amber-400/70">
                      {answer.selected}
                    </span>
                  )
                ) : (
                  <span className={`text-[10px] font-black uppercase tracking-wider ${hasData ? '' : 'opacity-40'}`}>
                    ({seg.blankId})
                  </span>
                )}
              </span>
            );
          })}
        </p>

        {boxWords?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-dim mr-0.5">Box:</span>
            {boxWords.map((word) => (
              <span key={word} className="px-1.5 md:px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                {word}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase border ${
            difficulty === 'hard' ? 'text-yellow-300 border-yellow-300/20 bg-yellow-300/10' :
            difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
            'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
          }`}>
            {difficulty}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <button
          onClick={onContinue}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98]"
        >
          {answeredCount > 0 ? `Continue (${answeredCount}/${totalBlanks})` : 'Skip'}
        </button>
      </div>

      {activePopover && activeBlankData && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[100]"
          style={{ top: activePopover.top, left: activePopover.left }}
        >
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.12 }}
            className="bg-surface border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-1.5 min-w-[200px] overflow-hidden"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-surface border-t border-l border-white/10 rotate-45" />
            <div className="relative pt-1">
              {activeBlankData.options.map((opt, idx) => {
                // Handle both object and string option formats
                const optionText = typeof opt === 'string' ? opt : opt.text;
                const isCorrect = typeof opt === 'string' ? optionText === activeBlankData.correct_answer : opt.isCorrect;
                // Handle both camelCase and snake_case explanation fields
                const explanationBn = opt?.explanationBn || opt?.explanation_bn || '';
                const explanationEn = opt?.explanationEn || opt?.explanation_en || '';
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(activePopover.blankId, optionText, isCorrect, explanationBn, explanationEn)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                  >
                    {optionText}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {explanationPanel && createPortal(
        <div
          ref={explanationRef}
          className="fixed z-[99]"
          style={{ 
            top: explanationPanel.top, 
            left: Math.max(8, explanationPanel.left - 50),
            maxWidth: 'calc(100vw - 16px)',
            width: Math.min(600, Math.max(300, explanationPanel.width + 100))
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-surface/98 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/60 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1" />
              <button
                type="button"
                onClick={closeExplanationPanel}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
              >
                Got it
              </button>
            </div>

            {explanationPanel.explanationBn && (
              <div>
                <p className="font-bold text-blue-400 uppercase tracking-wider text-[9px] mb-1.5">বাংলা ব্যাখ্যা</p>
                <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationBn}</p>
              </div>
            )}
            
            {explanationPanel.explanationEn && (
              <div className="pt-2 border-t border-white/10">
                <p className="font-bold text-orange-400 uppercase tracking-wider text-[9px] mb-1.5">English Explanation</p>
                <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationEn}</p>
              </div>
            )}

            {!explanationPanel.explanationBn && !explanationPanel.explanationEn && (
              <p className="text-text-dim italic text-xs">No explanation available.</p>
            )}
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GapFillPassage;
