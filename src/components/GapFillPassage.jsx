import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, X } from 'lucide-react';

const BLANK_REGEX = /_*\(([a-z])\)\s*_+|\(([a-z])\)\s*_+/g;

const GapFillPassage = ({ passage, blanks, boxWords, difficulty, onBlankAnswer, onContinue }) => {
  const [answers, setAnswers] = useState({});
  const [activePopover, setActivePopover] = useState(null);
  const [explanationPanel, setExplanationPanel] = useState(null);
  const blankRefs = useRef({});
  const popoverRef = useRef(null);
  const explanationRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  const shuffledOptionsMap = useMemo(() => {
    const map = {};
    blanks.forEach(blank => {
      const id = blank.blankId || blank.id;
      const opts = [...(blank.options || [])];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      map[id] = opts;
    });
    return map;
  }, [blanks]);

  const getBlankData = useCallback((blankId) => {
    return blanks.find(b => b.blankId === blankId || b.id === blankId);
  }, [blanks]);

  const handleBlankClick = useCallback((blankId, event) => {
    const blankData = getBlankData(blankId);
    if (!blankData) return;
    const currentAnswer = answers[blankId];
    if (currentAnswer?.isCorrect) return;

    if (isMobile) {
      setActivePopover(prev => prev?.blankId === blankId ? null : { blankId, isMobile: true });
      setExplanationPanel(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const gap = 8;
    const padding = 16;
    const popoverWidth = Math.min(220, window.innerWidth - padding * 2);
    const maxHeight = Math.min(280, window.innerHeight - gap * 2);
    const optCount = blankData.options?.length || 1;
    const popoverHeight = Math.min(maxHeight, optCount * 48 + 16);
    const centerX = rect.left + rect.width / 2;
    const halfWidth = popoverWidth / 2;
    let top = rect.bottom + gap;
    let left = Math.max(halfWidth + padding, Math.min(centerX, window.innerWidth - halfWidth - padding));
    if (top + popoverHeight > window.innerHeight - gap) {
      top = Math.max(gap, rect.top - popoverHeight - gap);
    }
    setActivePopover(prev => prev?.blankId === blankId ? null : { blankId, top, left, width: popoverWidth });
    setExplanationPanel(null);
  }, [answers, getBlankData, isMobile]);

  const closeExplanationPanel = useCallback(() => {
    setExplanationPanel(null);
  }, []);

  const handleOptionSelect = useCallback((blankId, optionText, isCorrect, explanationBn, explanationEn) => {
    const blankData = getBlankData(blankId);
    if (!blankData) return;
    
    const blankEl = blankRefs.current[blankId];
    const rect = blankEl?.getBoundingClientRect();
    
    const finalExplanationBn = explanationBn || blankData?.explanation_bn || '';
    const finalExplanationEn = explanationEn || blankData?.explanation_en || '';
    
    setAnswers(prev => ({ 
      ...prev, 
      [blankId]: { 
        selected: optionText, 
        isCorrect, 
        explanationBn: finalExplanationBn,
        explanationEn: finalExplanationEn
      } 
    }));
    
    if (rect && !isMobile) {
      setExplanationPanel({
        blankId,
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        explanationBn: finalExplanationBn,
        explanationEn: finalExplanationEn,
        isCorrect
      });
    } else {
      // On mobile, show full-screen explanation
      setExplanationPanel({
        blankId,
        isMobile: true,
        explanationBn: finalExplanationBn,
        explanationEn: finalExplanationEn,
        isCorrect
      });
    }
    
    setActivePopover(null);
    
    if (isCorrect) {
      onBlankAnswer?.(blankId, true, optionText);
    }
  }, [getBlankData, onBlankAnswer, isMobile]);

  const closePopover = useCallback(() => setActivePopover(null), []);

  useEffect(() => {
    if (!activePopover || activePopover.isMobile) return;
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
    <div className="flex-1 flex flex-col min-h-0 gap-3" role="group" aria-label="Fill in the blanks exercise">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
        <p className="text-text text-sm xs:text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
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
                onKeyDown={hasData ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleBlankClick(seg.blankId, e); } : undefined}
                role={hasData ? 'button' : undefined}
                tabIndex={hasData ? 0 : undefined}
                aria-label={hasData ? `Blank ${seg.blankId}${isAnswered ? `, selected: ${answer.selected}` : ', not answered'}` : undefined}
                className={`
                  relative inline-flex items-center gap-1 mx-0.5 px-2.5 py-1
                  min-w-[48px] md:min-w-[64px] min-h-touch justify-center
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
                  <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider ${hasData ? '' : 'opacity-40'}`}>
                    ({seg.blankId})
                  </span>
                )}
              </span>
            );
          })}
        </p>

        {boxWords?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Available words">
            <span className="text-[9px] md:text-[9px] font-black uppercase tracking-[0.2em] text-text-dim mr-0.5">Box:</span>
            {boxWords.map((word) => (
              <span key={word} className="px-1.5 md:px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] md:text-[9px] font-black uppercase tracking-widest">
                {word}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className={`text-[8px] md:text-[7px] font-black px-2 py-1 rounded-full uppercase border ${
            difficulty === 'hard' ? 'text-yellow-300 border-yellow-300/20 bg-yellow-300/10' :
            difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
            'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
          }`}>
            {difficulty}
          </span>
        </div>
      </div>

      <div className="shrink-0 sticky bottom-3 px-0 safe-bottom">
        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-xs md:text-[10px] transition-all active:scale-[0.98] min-h-touch"
        >
          {answeredCount > 0 ? `Continue (${answeredCount}/${totalBlanks})` : 'Skip'}
        </button>
      </div>

      {/* Desktop popover */}
      {activePopover && activeBlankData && !activePopover.isMobile && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[100]"
          style={{ top: activePopover.top, left: activePopover.left }}
        >
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.12 }}
            className="-translate-x-1/2 bg-surface border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-1.5 overflow-hidden"
            style={{ width: activePopover.width || 'auto', minWidth: 200 }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-surface border-t border-l border-white/10 rotate-45" aria-hidden="true" />
            <div className="relative pt-1">
              {(shuffledOptionsMap[activeBlankData.blankId || activeBlankData.id] || activeBlankData.options).map((opt, idx) => {
                const optionText = typeof opt === 'string' ? opt : opt.text;
                const isCorrect = typeof opt === 'string' ? optionText === activeBlankData.correct_answer : opt.isCorrect;
                const explanationBn = opt?.explanationBn || opt?.explanation_bn || '';
                const explanationEn = opt?.explanationEn || opt?.explanation_en || '';
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(activePopover.blankId, optionText, isCorrect, explanationBn, explanationEn)}
                    className="w-full text-left px-3 py-3 rounded-xl text-sm font-bold text-text-muted hover:text-text hover:bg-white/10 transition-colors min-h-touch"
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

      {/* Mobile bottom sheet */}
      {activePopover && activeBlankData && activePopover.isMobile && createPortal(
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/60" onClick={closePopover} aria-hidden="true" />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl shadow-2xl p-5 safe-bottom max-h-[60vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">
                Blank ({activePopover.blankId})
              </span>
              <button onClick={closePopover} className="p-1.5 text-white/40 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              {(shuffledOptionsMap[activeBlankData.blankId || activeBlankData.id] || activeBlankData.options).map((opt, idx) => {
                const optionText = typeof opt === 'string' ? opt : opt.text;
                const isCorrect = typeof opt === 'string' ? optionText === activeBlankData.correct_answer : opt.isCorrect;
                const explanationBn = opt?.explanationBn || opt?.explanation_bn || '';
                const explanationEn = opt?.explanationEn || opt?.explanation_en || '';
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(activePopover.blankId, optionText, isCorrect, explanationBn, explanationEn)}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-base font-bold text-text-muted hover:text-text hover:bg-white/10 transition-colors min-h-touch border border-white/5 mb-1.5"
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

      {/* Desktop explanation */}
      {explanationPanel && !explanationPanel.isMobile && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            onClick={() => setExplanationPanel(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Explanation"
          >
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
            <motion.div
              ref={explanationRef}
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-sm bg-surface rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExplanationPanel(null)}
                className="absolute top-3 right-3 p-2 rounded-full text-text-dim hover:text-text hover:bg-white/10 transition-colors"
                aria-label="Close explanation"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center gap-1 mb-4">
                {explanationPanel.isCorrect ? (
                  <CheckCircle size={40} className="text-emerald-400" aria-hidden="true" />
                ) : (
                  <XCircle size={40} className="text-rose-400" aria-hidden="true" />
                )}
                <span className={`text-lg font-black uppercase tracking-wider ${explanationPanel.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {explanationPanel.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {explanationPanel.explanationBn && (
                  <div>
                    <p className="font-bold text-text-dim uppercase tracking-wider text-[10px] mb-1">বাংলা ব্যাখ্যা</p>
                    <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationBn}</p>
                  </div>
                )}
                
                {explanationPanel.explanationEn && (
                  <div>
                    <p className="font-bold text-text-dim uppercase tracking-wider text-[10px] mb-1">English Explanation</p>
                    <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationEn}</p>
                  </div>
                )}

                {!explanationPanel.explanationBn && !explanationPanel.explanationEn && (
                  <p className="text-text-dim italic text-xs">No explanation available.</p>
                )}
              </div>

              <button
                onClick={() => setExplanationPanel(null)}
                className="w-full mt-5 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.97] min-h-touch"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Mobile full-screen explanation */}
      {explanationPanel && explanationPanel.isMobile && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-background safe-top safe-bottom"
            role="dialog"
            aria-modal="true"
            aria-label="Explanation"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
              <span className={`text-sm font-black uppercase tracking-wider ${explanationPanel.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {explanationPanel.isCorrect ? 'Correct!' : 'Keep going!'}
              </span>
              <button
                onClick={() => setExplanationPanel(null)}
                className="p-2 text-white/40 hover:text-white"
                aria-label="Close explanation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex flex-col items-center gap-2 py-4">
                {explanationPanel.isCorrect ? (
                  <CheckCircle size={48} className="text-emerald-400" aria-hidden="true" />
                ) : (
                  <XCircle size={48} className="text-rose-400" aria-hidden="true" />
                )}
              </div>

              {explanationPanel.explanationBn && (
                <div className="bg-surface rounded-xl p-4 border border-white/5">
                  <p className="font-bold text-text-dim uppercase tracking-wider text-2xs mb-1.5">বাংলা ব্যাখ্যা</p>
                  <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationBn}</p>
                </div>
              )}
              
              {explanationPanel.explanationEn && (
                <div className="bg-surface rounded-xl p-4 border border-white/5">
                  <p className="font-bold text-text-dim uppercase tracking-wider text-2xs mb-1.5">English Explanation</p>
                  <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationEn}</p>
                </div>
              )}

              {!explanationPanel.explanationBn && !explanationPanel.explanationEn && (
                <p className="text-text-dim italic text-sm text-center">No explanation available.</p>
              )}
            </div>

            <div className="p-4 border-t border-white/5 shrink-0 safe-bottom">
              <button
                onClick={() => setExplanationPanel(null)}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.97] min-h-touch"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default GapFillPassage;
