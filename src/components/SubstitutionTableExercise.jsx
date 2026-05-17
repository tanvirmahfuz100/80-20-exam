import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const SubstitutionTableExercise = ({ exercise, onContinue, onWrongAttempt }) => {
  const { table_columns: columns, valid_sentences: validSentences, question_text: questionText } = exercise;
  const numCols = columns.length;

  const [selections, setSelections] = useState(Array(numCols).fill(null));
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [attemptedCombos, setAttemptedCombos] = useState(new Set());
  const [lastExplanation, setLastExplanation] = useState('');
  const [finished, setFinished] = useState(false);
  const [foundSet, setFoundSet] = useState(new Set());

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
    }
  };

  const handleClear = useCallback(() => {
    setSelections(Array(numCols).fill(null));
    setChecked(false);
    setIsCorrect(false);
    setLastExplanation('');
  }, [numCols]);

  const formedSentence = useMemo(() => {
    if (selections.some(s => s === null)) return '';
    return selections.map((rowIdx, colIdx) => columns[colIdx][rowIdx]).join(' ').replace(/\s+/g, ' ').trim();
  }, [selections, columns]);

  const allSelected = selections.every(s => s !== null);

  const handleCheck = useCallback(() => {
    if (!allSelected) return;
    const key = selections.join('|');
    if (attemptedCombos.has(key)) return;

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

  const handleContinue = useCallback(() => {
    setFinished(true);
    onContinue?.(foundCount, validSentences.length, wrongAttempts);
  }, [foundCount, validSentences.length, wrongAttempts, onContinue]);

  const allFound = foundCount >= validSentences.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-3">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] md:text-xs text-white/70 font-medium leading-relaxed flex-1">
            {questionText || 'Select one item from each column to form a correct sentence.'}
          </p>
          {selections.some(s => s !== null) && !finished && (
            <button
              onClick={handleClear}
              className="shrink-0 p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Clear all selections"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="space-y-1">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest text-center">
                {colLabels[colIdx]}
              </p>
              <div className="space-y-1">
                {col.map((item, rowIdx) => {
                  const selected = selections[colIdx] === rowIdx;
                  const disabled = checked || finished;
                  return (
                    <button
                      key={rowIdx}
                      onClick={() => handleSelect(colIdx, rowIdx)}
                      disabled={disabled}
                      className={`w-full text-left px-2.5 py-2 rounded-lg border text-[10px] md:text-xs font-bold leading-tight transition-all ${
                        selected
                          ? 'bg-primary/20 border-primary text-white'
                          : disabled
                            ? 'bg-white/[0.03] border-white/5 text-white/20 cursor-default'
                            : 'bg-white/[0.06] border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {formedSentence && (
          <div className={`p-3 rounded-xl border text-xs font-semibold leading-relaxed ${
            checked
              ? isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}>
            <p className="text-[8px] font-black uppercase tracking-widest mb-1 text-white/30">
              {checked ? (isCorrect ? '✓ Correct' : '✗ Incorrect') : 'Your sentence'}
            </p>
            {formedSentence}
          </div>
        )}

        {checked && lastExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-[8px] font-black uppercase tracking-widest mb-1 text-white/30">Explanation</p>
            <p className="text-[11px] text-white/70 font-medium leading-relaxed">{lastExplanation}</p>
          </motion.div>
        )}

        <div className="text-center">
          <p className="text-[9px] font-bold text-white/30">
            {allFound
              ? `✓ All ${foundCount} correct sentence${foundCount !== 1 ? 's' : ''} found!`
              : `Found ${foundCount}/${validSentences.length} correct sentence${validSentences.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>

      <div className="shrink-0 sticky bottom-0 space-y-2">
        {checked && !allFound && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97]"
          >
            Try Another Combination
          </button>
        )}
        <button
          onClick={checked ? handleContinue : handleCheck}
          disabled={!allSelected}
          className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] ${
            !allSelected
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : checked
                ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white shadow-lg shadow-[#2F80ED]/20'
                : 'bg-yellow-500 text-black hover:bg-yellow-400'
          }`}
        >
          {checked ? `Continue (${foundCount}/${validSentences.length})` : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default SubstitutionTableExercise;
