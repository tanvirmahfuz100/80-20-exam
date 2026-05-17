import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { CheckCircle, Star, X } from 'lucide-react';

const BLANK_REGEX = /_*\(([a-z])\)\s*_+|\(([a-z])\)\s*_+/g;

const GapFillPassage = ({ passage, blanks, boxWords, difficulty, onBlankAnswer, onContinue, fontSize = 16 }) => {
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

  const getDisplayOptions = useCallback((blankData) => {
    if (!blankData) return [];
    const id = blankData.blankId || blankData.id;
    const fromMap = shuffledOptionsMap[id];
    if (fromMap) return fromMap;
    const opts = [...(blankData.options || [])];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [shuffledOptionsMap]);

  const handleBlankClick = useCallback((blankId, event) => {
    const blankData = getBlankData(blankId);
    const currentAnswer = answers[blankId];

    if (currentAnswer?.isCorrect) {
      const blankEl = blankRefs.current[blankId];
      const rect = blankEl?.getBoundingClientRect();
      if (rect && !isMobile) {
        setExplanationPanel({
          blankId,
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          explanationBn: currentAnswer.explanationBn || blankData?.explanation_bn || '',
          explanationEn: currentAnswer.explanationEn || blankData?.explanation_en || '',
          isCorrect: currentAnswer.isCorrect
        });
      } else {
        setExplanationPanel({
          blankId,
          isMobile: true,
          explanationBn: currentAnswer.explanationBn || blankData?.explanation_bn || '',
          explanationEn: currentAnswer.explanationEn || blankData?.explanation_en || '',
          isCorrect: currentAnswer.isCorrect
        });
      }
      setActivePopover(null);
      return;
    }

    if (!blankData) return;

    if (isMobile) {
      setActivePopover({ blankId, isMobile: true });
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
      setExplanationPanel({
        blankId,
        isMobile: true,
        explanationBn: finalExplanationBn,
        explanationEn: finalExplanationEn,
        isCorrect
      });
    }
    
    setActivePopover(null);
    
    onBlankAnswer?.(blankId, isCorrect, optionText, finalExplanationBn, finalExplanationEn);
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
    <div className="flex-1 flex flex-col min-h-0 gap-4" role="group" aria-label="Fill in the blanks exercise">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-5 px-0.5">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${
            difficulty === 'hard' ? 'text-yellow-300 border-yellow-300/20 bg-yellow-300/10' :
            difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
            'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
          }`}>
            {difficulty}
          </span>
        </div>
        <p className="text-text leading-loose font-medium whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return <span key={i}>{seg.content}</span>;
            }
            const answer = answers[seg.blankId];
            const blankData = getBlankData(seg.blankId);
            const isAnswered = !!answer;
            const hasData = !!blankData;

            const isActive = activePopover?.blankId === seg.blankId;

            return (
              <span
                key={i}
                ref={el => { blankRefs.current[seg.blankId] = el; }}
                onClick={(e) => handleBlankClick(seg.blankId, e)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBlankClick(seg.blankId, e); }}
                role="button"
                tabIndex={0}
                aria-label={`Blank ${seg.blankId}${isAnswered ? `, selected: ${answer.selected}` : ', not answered'}`}
                className={`
                  relative inline-flex items-center gap-1 mx-0.5 px-2 py-0.5
                  min-w-[48px] md:min-w-[64px] min-h-[32px] justify-center
                  font-bold leading-relaxed
                  transition-all duration-200 select-none
                  border-b-2
                  cursor-pointer
                  ${isAnswered
                    ? answer.isCorrect
                      ? 'border-emerald-500/70 text-emerald-400'
                      : 'border-amber-500/70 text-amber-400'
                    : hasData && isActive
                      ? 'border-white text-text bg-white/[0.06] rounded-t-sm'
                      : hasData
                        ? 'border-dashed border-white/30 text-text-muted hover:border-white/60'
                        : 'border-white/10 text-text-dim/30'
                  }
                `}
              >
                  {isAnswered ? (
                    answer.isCorrect ? (
                      <span className="text-emerald-400 font-bold">{blankData?.correct || blankData?.correct_answer || answer.selected || `(${seg.blankId})`}</span>
                    ) : (
                      <span className="text-amber-400 font-bold line-through decoration-amber-400/70">
                        {answer.selected || `(${seg.blankId})`}
                      </span>
                    )
                ) : (
                  <span className="font-black uppercase tracking-wider" style={{ fontSize: `${Math.max(9, fontSize * 0.65)}px`, opacity: hasData ? 1 : 0.4 }}>
                    ({seg.blankId})
                  </span>
                )}
              </span>
            );
          })}
        </p>

        {boxWords?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2 pb-1" aria-label="Available words">
            {boxWords.map((word) => (
              <span key={word} className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/25 text-primary text-[11px] font-black uppercase tracking-widest shadow-sm">
                {word}
              </span>
            ))}
          </div>
        )}

      </div>

      <div className="shrink-0 sticky bottom-3 px-0 safe-bottom pt-0.5">
        {answeredCount > 0 ? (
          <button
            onClick={() => onContinue(answeredCount, totalBlanks)}
            className="w-full py-3.5 px-6 bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white font-black rounded-xl text-sm uppercase tracking-widest transition-all active:scale-[0.97] shadow-lg shadow-[#2F80ED]/20"
          >
            Continue ({answeredCount}/{totalBlanks})
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => onContinue(0, totalBlanks)}
              className="px-4 py-2 text-white/40 hover:text-white/70 font-medium text-xs transition-colors active:scale-[0.97]"
            >
              Skip
            </button>
          </div>
        )}
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
              {getDisplayOptions(activeBlankData).map((opt, idx) => {
                const optionText = typeof opt === 'string' ? opt : opt.text;
                const isCorrect = typeof opt === 'string' ? optionText === activeBlankData.correct_answer : opt.isCorrect;
                const explanationBn = opt?.explanationBn || opt?.explanation_bn || '';
                const explanationEn = opt?.explanationEn || opt?.explanation_en || '';
                
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        handleOptionSelect(activePopover.blankId, optionText, isCorrect, explanationBn, explanationEn);
                      }}
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
                {getDisplayOptions(activeBlankData).map((opt, idx) => {
                  const optionText = typeof opt === 'string' ? opt : opt.text;
                  const isCorrect = typeof opt === 'string' ? optionText === activeBlankData.correct_answer : opt.isCorrect;
                  const explanationBn = opt?.explanationBn || opt?.explanation_bn || '';
                  const explanationEn = opt?.explanationEn || opt?.explanation_en || '';
                  
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        handleOptionSelect(activePopover.blankId, optionText, isCorrect, explanationBn, explanationEn);
                      }}
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

      {/* Unified explanation modal */}
      {explanationPanel && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setExplanationPanel(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Explanation"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

            <motion.div
              ref={explanationRef}
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`relative w-full max-w-sm md:max-w-md bg-surface rounded-2xl p-6 shadow-2xl ${
                explanationPanel.isCorrect ? 'border border-emerald-500/20 shadow-emerald-500/5' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {explanationPanel.isCorrect && (
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              )}

              <button
                onClick={() => setExplanationPanel(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full text-text-dim hover:text-text hover:bg-white/10 transition-colors z-10"
                aria-label="Close explanation"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center gap-2 mb-5">
                {explanationPanel.isCorrect ? (
                  <CheckCircle size={40} className="text-emerald-400" aria-hidden="true" />
                ) : (
                  <Star size={40} className="text-yellow-300 fill-yellow-300" aria-hidden="true" />
                )}
                <div>
                  <span className={`text-lg font-black uppercase tracking-wider ${explanationPanel.isCorrect ? 'text-emerald-400' : 'text-yellow-300'}`}>
                    {explanationPanel.isCorrect ? 'Good job!' : 'Star collected!'}
                  </span>
                  {!explanationPanel.isCorrect && (
                    <p className="text-3xs text-text-dim font-medium mt-0.5">Review your mistakes to earn it back</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-[35vh] overflow-y-auto">
                {explanationPanel.explanationBn && (
                  <div>
                    <p className="font-bold text-text-dim uppercase tracking-wider text-2xs mb-1">বাংলা ব্যাখ্যা</p>
                    <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationBn}</p>
                  </div>
                )}
                
                {explanationPanel.explanationEn && (
                  <div>
                    <p className="font-bold text-text-dim uppercase tracking-wider text-2xs mb-1">English Explanation</p>
                    <p className="text-text leading-relaxed text-sm">{explanationPanel.explanationEn}</p>
                  </div>
                )}

                {!explanationPanel.explanationBn && !explanationPanel.explanationEn && (
                  <p className="text-text-dim italic text-xs text-center">No explanation available.</p>
                )}
              </div>

              <button
                onClick={() => setExplanationPanel(null)}
                className="w-full mt-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.97]"
              >
                {explanationPanel.isCorrect ? 'Continue' : 'Got it!'}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default React.memo(GapFillPassage);
