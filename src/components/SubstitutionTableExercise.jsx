import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCcw, ArrowRight, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
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

const SubstitutionTableExercise = ({ exercise, onContinue, onWrongAttempt, fontSize = 16 }) => {
  const { table_columns: columns, valid_sentences: validSentences, question_text: questionText } = exercise;
  const numCols = columns.length;

  const [selections, setSelections] = useState(Array(numCols).fill(null));
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [attemptedCombos, setAttemptedCombos] = useState(new Set());
  const [lastExplanation, setLastExplanation] = useState('');
  const [alreadyTried, setAlreadyTried] = useState(false);
  const [finished, setFinished] = useState(false);
  const [foundSet, setFoundSet] = useState(new Set());
  const [showContinueConfirm, setShowContinueConfirm] = useState(false);

  const validSet = useMemo(() => {
    const set = new Set();
    validSentences.forEach(v => set.add(v.sentence.trim().toLowerCase()));
    return set;
  }, [validSentences]);

  const colLabels = useMemo(() => {
    const defaults = ['Subject', 'Verb/Word', 'Object'];
    return columns.map((_, i) => defaults[i] || `Column ${i + 1}`);
  }, [columns]);

  const handleSelect = (colIdx, rowIdx) => {
    if (checked || finished) return;
    setSelections(prev => {
      const next = [...prev];
      if (next[colIdx] === rowIdx) {
        next[colIdx] = null;
      } else {
        next[colIdx] = rowIdx;
      }
      return next;
    });
    if (checked) {
      setChecked(false);
      setIsCorrect(false);
      setLastExplanation('');
      setAlreadyTried(false);
    }
  };

  const handleClear = useCallback(() => {
    setSelections(Array(numCols).fill(null));
    setChecked(false);
    setIsCorrect(false);
    setLastExplanation('');
    setAlreadyTried(false);
  }, [numCols]);

  const formedSentence = useMemo(() => {
    if (selections.some(s => s === null)) return '';
    return selections.map((rowIdx, colIdx) => columns[colIdx][rowIdx]).join(' ').replace(/\s+/g, ' ').trim();
  }, [selections, columns]);

  const allSelected = selections.every(s => s !== null);

  const handleCheck = useCallback(() => {
    if (!allSelected) return;
    const key = selections.join('|');
    if (attemptedCombos.has(key)) {
      setAlreadyTried(true);
      setChecked(true);
      setIsCorrect(false);
      setLastExplanation('You already tried this combination. Try a different one.');
      return;
    }

    const sentenceLower = formedSentence.trim().toLowerCase();
    const correct = validSet.has(sentenceLower);

    setIsCorrect(correct);
    setChecked(true);

    const newAttempted = new Set(attemptedCombos);
    newAttempted.add(key);
    setAttemptedCombos(newAttempted);

    if (correct) {
      const match = validSentences.find(v => v.sentence.trim().toLowerCase() === sentenceLower);
      setLastExplanation(match?.explanation_bn || match?.explanation_en || 'Correct!');
      if (!foundSet.has(sentenceLower)) {
        setFoundSet(prev => new Set(prev).add(sentenceLower));
        setFoundCount(prev => prev + 1);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
      setLastExplanation('This combination does not form a correct sentence. Try a different combination.');
      onWrongAttempt?.();
    }
  }, [selections, formedSentence, attemptedCombos, validSet, validSentences, allSelected, foundSet, onWrongAttempt]);

  const handleNext = useCallback(() => {
    handleClear();
  }, [handleClear]);

  const handleContinueClick = useCallback(() => {
    if (foundCount < validSentences.length) {
      setShowContinueConfirm(true);
    } else {
      finishAndContinue();
    }
  }, [foundCount, validSentences.length]);

  const finishAndContinue = useCallback(() => {
    setShowContinueConfirm(false);
    setFinished(true);
    onContinue?.(foundCount, validSentences.length, wrongAttempts);
  }, [foundCount, validSentences.length, wrongAttempts, onContinue]);

  const allFound = foundCount >= validSentences.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2">
      <ConfirmDialog
        show={showContinueConfirm}
        title="Almost there!"
        message={`You've found ${foundCount} out of ${validSentences.length} correct sentences. Are you sure you want to continue? You can try more combinations.`}
        confirmLabel="Continue Anyway"
        cancelLabel="Keep Trying"
        onConfirm={finishAndContinue}
        onCancel={() => setShowContinueConfirm(false)}
        danger
      />

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white/60 font-medium leading-relaxed flex-1" style={{ fontSize: `${fontSize - 2}px` }}>
            {questionText || 'Select one item from each column to form a correct sentence.'}
          </p>
          {selections.some(s => s !== null) && !finished && (
            <button
              onClick={handleClear}
              className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Clear all selections"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="space-y-0.5">
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-2 py-1.5 text-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">
                  {colLabels[colIdx]}
                </p>
              </div>
              <div className="space-y-0.5">
                {col.map((item, rowIdx) => {
                  const selected = selections[colIdx] === rowIdx;
                  const disabled = checked || finished;
                  return (
                    <button
                      key={rowIdx}
                      onClick={() => handleSelect(colIdx, rowIdx)}
                      disabled={disabled}
                      className={`w-full text-left px-2 py-1.5 rounded-lg border font-bold leading-tight transition-all min-h-[36px] ${
                        selected
                          ? 'bg-primary/20 border-primary text-white ring-1 ring-primary/40'
                          : disabled
                            ? 'bg-white/[0.02] border-white/5 text-white/15 cursor-default'
                            : 'bg-white/[0.05] border-white/10 text-white/50 hover:border-white/30 hover:text-white hover:bg-white/[0.1]'
                      }`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {selected && (
                        <Check className="w-3 h-3 inline-block mr-1 -mt-0.5 text-primary shrink-0" />
                      )}
                      <span className={selected ? 'text-white' : ''}>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selections.some(s => s !== null) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border ${
              !allSelected
                ? 'bg-white/[0.03] border-dashed border-white/10'
                : checked
                  ? isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                  : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className={`text-[8px] font-black uppercase tracking-widest ${
                checked
                  ? isCorrect ? 'text-emerald-400' : 'text-red-400'
                  : allSelected ? 'text-primary' : 'text-white/20'
              }`}>
                {checked ? (isCorrect ? 'Correct sentence' : 'Incorrect') : allSelected ? 'Sentence preview' : 'Building...'}
              </p>
              {allSelected && !checked && (
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-wider">Tap Check below</span>
              )}
            </div>
            <p className={`font-bold leading-relaxed ${
              checked
                ? isCorrect ? 'text-emerald-300' : 'text-red-300'
                : 'text-white/80'
            }`} style={{ fontSize: `${fontSize}px` }}>
              {allSelected || selections.some(s => s !== null) ? formedSentence || 'Select items from each column...' : ''}
            </p>
          </motion.div>
        )}

        {checked && lastExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-[8px] font-black uppercase tracking-widest mb-1 text-white/30">Explanation</p>
            <p className="text-white/60 font-medium leading-relaxed" style={{ fontSize: `${fontSize - 1}px` }}>{lastExplanation}</p>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-2 py-1">
          <div className="flex items-center gap-1">
            {validSentences.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < foundCount ? 'bg-emerald-400 shadow-sm shadow-emerald-400/30' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className={`text-[9px] font-bold ${
            allFound ? 'text-emerald-400' : 'text-white/30'
          }`}>
            {allFound
              ? `All ${foundCount} found`
              : `${foundCount} / ${validSentences.length}`
            }
          </p>
        </div>
      </div>

      <div className="shrink-0 sticky bottom-0 space-y-1.5 pt-1">
        {checked && !allFound && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            <RefreshCcw className="w-3 h-3" />
            Try Another Combination
          </button>
        )}
        <button
          onClick={checked ? handleContinueClick : handleCheck}
          disabled={!allSelected}
          className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
            !allSelected
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : checked
                ? allFound
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-white/10 hover:bg-white/15 text-white/80 border border-white/10'
                : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20'
          }`}
        >
          {!checked ? (
            <>Check Answer <ArrowRight className="w-3 h-3" /></>
          ) : allFound ? (
            <>Continue</>
          ) : (
            <>Continue ({foundCount}/{validSentences.length})</>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubstitutionTableExercise;
