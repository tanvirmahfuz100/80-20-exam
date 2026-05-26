import React, { useState, useCallback } from 'react';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';

const BengaliLabels = ['ক', 'খ', 'গ', 'ঘ'];

const CreativeQuestionExercise = ({ cq, onContinue, onWrongAttempt, fontSize = 16 }) => {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const questions = cq.questions || [];
  const totalQ = questions.length;

  const handleSelect = (qIdx, key) => {
    if (checked[qIdx] || finished) return;
    setAnswers(prev => ({ ...prev, [qIdx]: key }));
    setChecked(prev => ({ ...prev, [qIdx]: true }));

    const q = questions[qIdx];
    const isCorrect = key === q.answer;
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setWrongAttempts(w => w + 1);
      onWrongAttempt?.();
    }
  };

  const allChecked = Object.keys(checked).length === totalQ;

  const handleContinue = useCallback(() => {
    setFinished(true);
    onContinue?.(score, totalQ, wrongAttempts);
  }, [score, totalQ, wrongAttempts, onContinue]);

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2 p-1">
      <div className="bg-surface-alt border border-primary/20 rounded-xl p-3 shrink-0 overflow-y-auto max-h-[30vh]">
        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 bn-text">
          {cq.stem_label || 'প্রশ্নটি পড়ো এবং সঠিক উত্তরটি নির্বাচন করো'}
        </p>
        <p className="text-text leading-relaxed font-medium whitespace-pre-wrap" style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}>
          {cq.stem}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1 space-y-2">
        {questions.map((q, qIdx) => {
          const isChecked = checked[qIdx];
          const selected = answers[qIdx];
          const isCorrect = isChecked && selected === q.answer;

          return (
            <motion.div
              key={qIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.05 }}
            className={`bg-surface-alt border rounded-xl p-3 transition-colors ${
              isChecked
                ? isCorrect
                  ? 'border-emerald-500/20'
                  : 'border-yellow-500/20'
                : 'border'
            }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 border ${
                  isChecked
                    ? isCorrect
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    : 'bg-primary/15 text-primary border-primary/30'
                }`}>
                  {q.label || BengaliLabels[qIdx] || `(${qIdx + 1})`}
                </span>
                <p className="font-bold text-white leading-snug flex-1" style={{ fontSize: `${fontSize}px` }}>
                  {q.question}
                </p>
              </div>

              <div className="space-y-1 pl-8">
                {Object.entries(q.options || {}).map(([key, text]) => {
                  const optSelected = selected === key;
                  let state = 'idle';
                  if (isChecked) {
                    if (key === q.answer) state = 'correct';
                    else if (optSelected) state = 'wrong';
                    else state = 'dimmed';
                  } else if (optSelected) {
                    state = 'selected';
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(qIdx, key)}
                      disabled={isChecked || finished}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                    state === 'correct'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : state === 'wrong'
                        ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
                        : state === 'selected'
                          ? 'bg-primary/15 border-primary text-white'
                          : state === 'dimmed'
                            ? 'bg-surface-alt border-transparent opacity-30'
                            : 'bg-surface-alt border text-text-muted hover:border-text-dim hover:text-text'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-black border shrink-0 ${
                        state === 'correct'
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : state === 'wrong'
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : state === 'selected'
                              ? 'bg-primary text-white border-primary'
                              : 'bg-black/40 border text-text-dim'
                      }`}>
                        {key}
                      </span>
                      <span className="font-medium flex-1 leading-snug" style={{ fontSize: `${Math.max(11, fontSize - 1)}px` }}>
                        {text}
                      </span>
                      {state === 'correct' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {state === 'wrong' && <Star className="w-3.5 h-3.5 text-yellow-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {isChecked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mt-2 ml-8 text-xs leading-relaxed pl-2 border-l-2 ${
                    isCorrect
                      ? 'text-emerald-300/70 border-emerald-500/30'
                      : 'text-yellow-300/70 border-yellow-500/30'
                  }`}
                  style={{ fontSize: `${Math.max(10, fontSize - 3)}px` }}
                >
                  <p className="font-medium">{q.explanation}</p>
                  {q.explanation_bn && !q.explanation && (
                    <p className="font-medium">{q.explanation_bn}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="shrink-0 pt-1">
        <div className="flex items-center gap-2 mb-1.5">
          {totalQ > 0 && (
            <div className="flex items-center gap-1 flex-1">
              {Array.from({ length: totalQ }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    checked[i]
                      ? checked[i] && answers[i] === questions[i]?.answer
                        ? 'bg-emerald-400'
                        : 'bg-yellow-400'
                      : 'bg-surface/50'
                  }`}
                />
              ))}
            </div>
          )}
          <p className="text-[8px] font-bold text-text-dim tabular-nums">
            {Object.keys(checked).length}/{totalQ}
          </p>
        </div>
        <button
          onClick={allChecked ? handleContinue : undefined}
          disabled={!allChecked}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
            allChecked
              ? 'bg-primary hover:bg-primary-hover text-white'
              : 'bg-surface-alt text-text-dim cursor-not-allowed'
          }`}
        >
          {allChecked ? (
            <>Continue <ArrowRight className="w-3 h-3" /></>
          ) : (
            <>Answer all sub-questions to continue</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreativeQuestionExercise;
