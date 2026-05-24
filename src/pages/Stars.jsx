import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, CheckCircle, Clock, Sparkles, Brain, Zap, BookOpen } from 'lucide-react';
import { getMistakeGroups, startReviewSession, startAllReviewSession, REVIEW_INTERVALS } from '../services/review';
import { getUserStats } from '../services/levels';
import { useAuth } from '../context/AuthContext';

const Stars = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ total_xp: 0, total_stars: 0 });

  useEffect(() => {
    if (user?.id) {
      setStats(getUserStats(user.id));
    }
  }, [user]);

  useEffect(() => {
    setGroups(getMistakeGroups());
  }, []);

  useEffect(() => {
    const refresh = () => setGroups(getMistakeGroups());
    window.addEventListener('mistakeReviewUpdated', refresh);
    return () => window.removeEventListener('mistakeReviewUpdated', refresh);
  }, []);

  const handleReview = (stage) => {
    const count = startReviewSession(stage);
    if (count > 0) {
      navigate(`/quiz/review?reviewMode=true&reviewStage=${stage}`);
    }
  };

  const handleReviewAll = () => {
    const count = startAllReviewSession();
    if (count > 0) {
      navigate(`/quiz/review?reviewMode=true&reviewStage=all`);
    }
  };

  const totalMistakes = groups.reduce((sum, g) => sum + g.total, 0);
  const totalDue = groups.reduce((sum, g) => sum + g.dueNow, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-surface border border-white/5 rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Total XP
          </div>
          <div className="text-2xl font-black tracking-tighter text-primary">
            {stats.total_xp}
          </div>
        </div>
        <div className="bg-surface border border-white/5 rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-1">
            <Star className="w-3 h-3" />
            To Review
          </div>
          <div className="text-2xl font-black tracking-tighter text-yellow-300">
            {totalMistakes}
          </div>
        </div>
        <div className="bg-surface border border-white/5 rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Due Now
          </div>
          <div className="text-2xl font-black tracking-tighter text-yellow-400">
            {totalDue}
          </div>
        </div>
        <div className="bg-surface border border-white/5 rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            All Time Stars
          </div>
          <div className="text-2xl font-black tracking-tighter text-white/60">
            {stats.total_stars}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300/30" />
            Star Review
          </h1>
          <p className="text-white/40 text-sm font-medium mt-1">
            {totalDue > 0
              ? `${totalDue} question${totalDue !== 1 ? 's' : ''} due for review`
              : 'All caught up! No mistakes due for review.'}
          </p>
        </div>

        {totalDue > 0 && (
          <button
            onClick={handleReviewAll}
            className="inline-flex items-center gap-2 bg-primary text-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-primary-hover active:scale-[0.98] border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Review All Due
          </button>
        )}
      </div>

      {totalMistakes > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {groups.map((group) => (
            <div
              key={group.stage}
              className={`bg-surface border border-white/5 rounded-2xl p-4 text-center transition-all ${
                group.dueNow > 0 ? 'hover:border-primary/30' : ''
              }`}
            >
              <p className={`text-2xl font-black tracking-tighter ${
                group.dueNow > 0 ? 'text-yellow-300' : 'text-emerald-400'
              }`}>
                {group.dueNow}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">{group.label}</p>
              <p className="text-[8px] text-white/20 mt-0.5">/ {group.total} total</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.stage}
            className="bg-surface border border-white/5 rounded-2xl p-5 md:p-6 transition-all hover:border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  group.stage === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                  group.stage <= 2 ? 'bg-primary/20 text-primary' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-black text-base">{group.label}</p>
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">{group.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-xl">
                  {group.dueNow > 0 ? (
                    <span className="text-yellow-300">{group.dueNow}</span>
                  ) : (
                    <span className="text-emerald-400">{group.dueNow}</span>
                  )}
                  <span className="text-white/30 text-base">/{group.total}</span>
                </p>
                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">due/total</p>
              </div>
            </div>

            {group.total > 0 && (
              <button
                onClick={() => handleReview(group.stage)}
                disabled={group.dueNow === 0}
                className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  group.dueNow > 0
                    ? 'bg-primary text-black hover:bg-primary-hover active:scale-[0.98]'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                {group.dueNow > 0 ? (
                  <><Brain className="w-3.5 h-3.5" /> Start Quiz</>
                ) : (
                  <><CheckCircle className="w-3.5 h-3.5" /> All reviewed</>
                )}
              </button>
            )}
          </div>
        ))}

        {totalMistakes === 0 && (
          <div className="text-center py-16 bg-surface border border-white/5 rounded-2xl">
            <Star className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-black uppercase tracking-widest text-[10px]">No mistakes yet</p>
            <p className="text-white/10 text-sm mt-2 font-medium">Keep practicing to build your review queue</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 px-1">
        <Clock className="w-3 h-3" />
        Spaced repetition: today &rarr; 3d &rarr; 7d &rarr; 14d &rarr; 30d
      </div>
    </div>
  );
};

export default Stars;
