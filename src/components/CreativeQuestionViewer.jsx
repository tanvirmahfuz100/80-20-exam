import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const BengaliLabels = ['ক', 'খ', 'গ', 'ঘ'];

const CreativeQuestionViewer = ({ cq, onContinue, fontSize = 16 }) => {
  const questions = cq.questions || [];

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2 p-1">
      <div className="bg-white/[0.04] border border-primary/20 rounded-xl p-3 shrink-0 overflow-y-auto max-h-[30vh]">
        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5">
          {cq.stem_label || 'উদ্দীপকটি পড়ে নিচের প্রশ্নগুলোর উত্তর দাও'}
        </p>
        <p className="text-white/80 leading-relaxed font-medium whitespace-pre-wrap" style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}>
          {cq.stem}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1 space-y-2">
        {questions.map((q, qIdx) => {
          const correctKey = q.answer;
          const hasExplanation = q.explanation || q.explanation_bn;

          return (
            <div
              key={qIdx}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-3"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 border bg-primary/15 text-primary border-primary/30">
                  {q.label || BengaliLabels[qIdx] || `(${qIdx + 1})`}
                </span>
                <p className="font-bold text-white leading-snug flex-1" style={{ fontSize: `${fontSize}px` }}>
                  {q.question}
                </p>
              </div>

              <div className="space-y-1 pl-8">
                {Object.entries(q.options || {}).map(([key, text]) => {
                  const isCorrect = key === correctKey;

                  return (
                    <div
                      key={key}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/[0.02] border-transparent text-white/40'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-black border shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-black/40 border-white/15 text-white/30'
                      }`}>
                        {key}
                      </span>
                      <span className="font-medium flex-1 leading-snug" style={{ fontSize: `${Math.max(11, fontSize - 1)}px` }}>
                        {text}
                      </span>
                      {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {hasExplanation && (
                <div className="mt-2 ml-8 text-xs leading-relaxed pl-2 border-l-2 border-primary/30 text-white/50"
                  style={{ fontSize: `${Math.max(10, fontSize - 3)}px` }}
                >
                  <p className="font-medium">{q.explanation || q.explanation_bn}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 pt-1">
        <button
          onClick={() => onContinue?.(0, 0, 0)}
          className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
        >
          Continue <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default CreativeQuestionViewer;
