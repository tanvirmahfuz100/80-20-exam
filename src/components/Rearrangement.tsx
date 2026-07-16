import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Check, X, RefreshCw, Eye } from 'lucide-react';
import { ConfirmDialog } from './ui';

const Rearrangement = ({ sentences, correctOrder, reconstructedParagraph, fontSize = 16, onWrongAttempt, onContinue }) => {
  const initialOrder = useMemo(() => sentences.map(s => s.id), [sentences]);
  const [order, setOrder] = useState(initialOrder);
  const [checked, setChecked] = useState(false);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const isAllCorrect = useMemo(() => {
    return order.every((id, idx) => id === correctOrder[idx]);
  }, [order, correctOrder]);

  const getItemStatus = useCallback((id, idx) => {
    if (!checked && !showingAnswer) return null;
    return id === correctOrder[idx] ? 'correct' : 'wrong';
  }, [checked, showingAnswer, correctOrder]);

  const handleMoveUp = useCallback((index) => {
    if (index === 0 || checked || showingAnswer || finished) return;
    setOrder(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, [checked, showingAnswer, finished]);

  const handleMoveDown = useCallback((index) => {
    if (index === order.length - 1 || checked || showingAnswer || finished) return;
    setOrder(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, [order.length, checked, showingAnswer, finished]);

  const handleDragStart = useCallback((e, idx) => {
    if (checked || showingAnswer || finished) return;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  }, [checked, showingAnswer, finished]);

  const handleDragOver = useCallback((e, idx) => {
    if (dragIdx === null || dragIdx === idx || checked || showingAnswer || finished) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  }, [dragIdx, checked, showingAnswer, finished]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragIdx(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
  }, []);

  const handleCheck = useCallback(() => {
    setChecked(true);
    if (isAllCorrect) {
      setFinished(true);
      onContinue?.(1, 1);
    } else {
      onWrongAttempt?.();
    }
  }, [isAllCorrect, onContinue, onWrongAttempt]);

  const handleShowAnswer = useCallback(() => {
    setShowingAnswer(true);
    setOrder([...correctOrder]);
    setChecked(true);
    onWrongAttempt?.();
  }, [correctOrder, onWrongAttempt]);

  const handleReset = useCallback(() => {
    setOrder(initialOrder);
    setChecked(false);
    setShowingAnswer(false);
  }, [initialOrder]);

  const handleContinueAnyway = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmContinue = useCallback(() => {
    setShowConfirm(false);
    setFinished(true);
    onContinue?.(0, 1);
  }, [onContinue]);

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2">
      <ConfirmDialog
        show={showConfirm}
        title="Continue anyway?"
        message="You haven't arranged the sentences correctly yet. Are you sure you want to continue?"
        confirmLabel="Continue Anyway"
        cancelLabel="Keep Trying"
        onConfirm={confirmContinue}
        onCancel={() => setShowConfirm(false)}
        danger
      />

      <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 px-0.5">
        {showingAnswer && reconstructedParagraph && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-3"
          >
            <p className="text-[8px] font-black uppercase tracking-widest mb-1.5 text-primary">Reconstructed Paragraph</p>
            <p className="text-text font-medium leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
              {reconstructedParagraph}
            </p>
          </motion.div>
        )}

        {finished && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-1 pb-1"
          >
            <div className="p-1 rounded-lg bg-surface-hover">
              <Check className="w-3.5 h-3.5 text-text" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text">
              Correct order!
            </span>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {order.map((id, idx) => {
            const sentence = sentences.find(s => s.id === id);
            const status = getItemStatus(id, idx);

            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                draggable={!checked && !showingAnswer && !finished}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  status === 'correct'
                    ? 'bg-surface border'
                    : status === 'wrong'
                      ? 'bg-surface-hover border'
                      : 'bg-surface border hover:border'
                }`}
              >
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0 || !!status || finished}
                    className="p-1 rounded-md text-text-dim hover:text-text hover:bg-surface-hover transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === order.length - 1 || !!status || finished}
                    className="p-1 rounded-md text-text-dim hover:text-text hover:bg-surface-hover transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[9px] font-black text-text-dim w-5 text-right shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {status && (
                      status === 'correct'
                        ? <Check className="w-3.5 h-3.5 text-text shrink-0" />
                        : <X className="w-3.5 h-3.5 text-text-dim shrink-0" />
                    )}
                    <p className="text-text font-medium leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                      {sentence?.text || id}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="shrink-0 sticky bottom-0 space-y-1.5 pt-1">
        {checked && !finished && (
          <button
            onClick={handleReset}
            className="w-full py-3 bg-surface-alt hover:bg-surface-hover text-text-muted border rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Reset & Try Again
          </button>
        )}

        {!showingAnswer && !finished && (
          <button
            onClick={handleShowAnswer}
            className="w-full py-3 bg-surface-alt hover:bg-surface-hover text-text-muted border rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3 h-3" />
            Show Answer
          </button>
        )}

        {!finished ? (
          <button
            onClick={checked ? handleContinueAnyway : handleCheck}
            className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
              checked
                ? 'bg-surface-hover text-text-muted border hover:bg-surface-hover'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            {checked ? 'Continue Anyway' : 'Check Order'}
            {!checked && <Check className="w-3 h-3" />}
          </button>
        ) : (
          <button
            onClick={() => onContinue?.(1, 1)}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px]"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default Rearrangement;
