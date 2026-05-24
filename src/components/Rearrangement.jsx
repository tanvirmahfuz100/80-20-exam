import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Check, X, RefreshCw, Eye, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-sm bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${danger ? 'bg-yellow-500/15' : 'bg-primary/15'}`}>
            {danger
              ? <AlertTriangle className="w-5 h-5 text-yellow-400" />
              : <Check className="w-5 h-5 text-primary" />
            }
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
            <p className="text-[11px] text-white/50 font-medium mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] border border-white/10"
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] ${
              danger
                ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

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
            <p className="text-white/80 font-medium leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
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
            <div className="p-1 rounded-lg bg-emerald-500/15">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
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
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : status === 'wrong'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-surface border border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0 || !!status || finished}
                    className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === order.length - 1 || !!status || finished}
                    className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[9px] font-black text-white/30 w-5 text-right shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {status && (
                      status === 'correct'
                        ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        : <X className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    )}
                    <p className="text-white/80 font-medium leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
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
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Reset & Try Again
          </button>
        )}

        {!showingAnswer && !finished && (
          <button
            onClick={handleShowAnswer}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/50 border border-white/5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
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
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            {checked ? 'Continue Anyway' : 'Check Order'}
            {!checked && <Check className="w-3 h-3" />}
          </button>
        ) : (
          <button
            onClick={() => onContinue?.(1, 1)}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px]"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default Rearrangement;
