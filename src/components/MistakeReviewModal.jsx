import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { getMistakeGroups, startReviewSession, REVIEW_INTERVALS } from '../services/review';

const MistakeReviewModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (isOpen) setGroups(getMistakeGroups());
  }, [isOpen]);

  useEffect(() => {
    const refresh = () => {
      if (isOpen) setGroups(getMistakeGroups());
    };
    window.addEventListener('mistakeReviewUpdated', refresh);
    return () => window.removeEventListener('mistakeReviewUpdated', refresh);
  }, [isOpen]);

  const handleReview = (stage) => {
    const count = startReviewSession(stage);
    if (count > 0) {
      onClose();
      navigate(`/quiz/review?reviewMode=true&reviewStage=${stage}`);
    }
  };

  if (!isOpen) return null;

  const totalMistakes = groups.reduce((sum, g) => sum + g.total, 0);
  const totalDue = groups.reduce((sum, g) => sum + g.dueNow, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-lg bg-background border rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border">
          <div>
            <h2 className="text-text font-black italic tracking-tighter text-xl">Mistake Review</h2>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
              {totalDue} due now &middot; {totalMistakes} total mistakes
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-alt rounded-xl text-text-muted hover:text-text hover:bg-surface-hover transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {groups.map((group) => (
            <div key={group.stage} className="bg-surface border rounded-2xl p-5 transition-all hover:border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    group.stage === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                    group.stage <= 2 ? 'bg-primary/20 text-primary' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-text font-black text-sm">{group.label}</p>
                    <p className="text-text-dim text-[9px] font-black uppercase tracking-widest">{group.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text font-black text-lg">
                    {group.dueNow > 0 ? (
                      <span className="text-yellow-300">{group.dueNow}</span>
                    ) : (
                      <span className="text-emerald-400">{group.dueNow}</span>
                    )}
                    <span className="text-text-muted">/{group.total}</span>
                  </p>
                  <p className="text-text-dim text-[9px] font-black uppercase tracking-widest">due/total</p>
                </div>
              </div>

              {group.total > 0 && (
                <button
                  onClick={() => handleReview(group.stage)}
                  disabled={group.dueNow === 0}
                  className={`w-full mt-3 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                    group.dueNow > 0
                      ? 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]'
                      : 'bg-surface-alt text-text-dim cursor-not-allowed'
                  }`}
                >
                  {group.dueNow > 0 ? (
                    <><ArrowRight className="w-3 h-3" /> Review Now</>
                  ) : (
                    <><CheckCircle className="w-3 h-3" /> All reviewed</>
                  )}
                </button>
              )}
            </div>
          ))}

          {totalMistakes === 0 && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-text-dim mx-auto mb-4" />
              <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">No mistakes yet</p>
              <p className="text-text-dim text-xs mt-2 font-medium">Keep practicing to build your review queue</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border bg-surface-alt">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-dim">
            <Clock className="w-3 h-3" />
            Spaced repetition: today &rarr; 3d &rarr; 7d &rarr; 14d &rarr; 30d
          </div>
        </div>
      </div>
    </div>
  );
};

export default MistakeReviewModal;
