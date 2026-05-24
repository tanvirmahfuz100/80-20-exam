import React from 'react';
import { ArrowRight } from 'lucide-react';

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

      <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1 space-y-3">
        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="bg-white/[0.03] border border-white/10 rounded-xl p-3 space-y-2"
          >
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 border bg-primary/15 text-primary border-primary/30">
                {q.label || BengaliLabels[qIdx] || `(${qIdx + 1})`}
              </span>
              <p className="font-bold text-white leading-snug flex-1" style={{ fontSize: `${fontSize}px` }}>
                {q.question}
              </p>
            </div>

            {q.model_answer && (
              <div className="ml-8 text-xs leading-relaxed pl-3 border-l-2 border-primary/30 bg-primary/[0.03] rounded-r-lg p-2"
                style={{ fontSize: `${Math.max(10, fontSize - 3)}px` }}
              >
                <p className="font-medium text-white/80 whitespace-pre-wrap">{q.model_answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="shrink-0 pt-1">
        <button
          onClick={() => onContinue?.(0, 0, 0)}
          className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px]"
        >
          Continue <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default CreativeQuestionViewer;
