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
        <div className="bg-surface border rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            মোট এক্সপি
          </div>
          <div className="text-2xl font-black tracking-tighter text-primary">
            {stats.total_xp}
          </div>
        </div>
        <div className="bg-surface border rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-1">
            <Star className="w-3 h-3" />
            রিভিউ বাকি
          </div>
          <div className="text-2xl font-black tracking-tighter text-yellow-300">
            {totalMistakes}
          </div>
        </div>
        <div className="bg-surface border rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            আজকে
          </div>
          <div className="text-2xl font-black tracking-tighter text-yellow-400">
            {totalDue}
          </div>
        </div>
        <div className="bg-surface border rounded-xl p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            সর্বকালের স্টার
          </div>
          <div className="text-2xl font-black tracking-tighter text-text">
            {stats.total_stars}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-text tracking-tighter flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300/30" />
            স্টার রিভিউ
          </h1>
          <p className="text-text-muted text-sm font-medium mt-1">
            {totalDue > 0
              ? `${totalDue}টি প্রশ্ন রিভিউ করার বাকি`
              : 'সব রিভিউ করা হয়েছে! কোনো ভুল নেই।'}
          </p>
        </div>

        {totalDue > 0 && (
          <button
            onClick={handleReviewAll}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-primary-hover active:scale-[0.98] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            বাকি স্টার রিভিউ করো
          </button>
        )}
      </div>

      {totalMistakes > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {groups.map((group) => (
            <div
              key={group.stage}
              className={`bg-surface border rounded-2xl p-4 text-center transition-all ${
                group.dueNow > 0 ? 'hover:border-primary/30' : ''
              }`}
            >
              <p className={`text-2xl font-black tracking-tighter ${
                group.dueNow > 0 ? 'text-yellow-300' : 'text-emerald-400'
              }`}>
                {group.dueNow}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">{group.label}</p>
              <p className="text-[8px] text-text-dim mt-0.5">/ {group.total} total</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.stage}
            className="bg-surface border rounded-2xl p-5 md:p-6 transition-all hover:border"
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
                  <p className="text-text font-black text-base">{group.label}</p>
                  <p className="text-text-dim text-[9px] font-black uppercase tracking-widest">{group.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-text font-black text-xl">
                  {group.dueNow > 0 ? (
                    <span className="text-yellow-300">{group.dueNow}</span>
                  ) : (
                    <span className="text-emerald-400">{group.dueNow}</span>
                  )}
                  <span className="text-text-muted text-base">/{group.total}</span>
                </p>
                <p className="text-text-dim text-[9px] font-black uppercase tracking-widest">বাকি/মোট</p>
              </div>
            </div>

            {group.total > 0 && (
              <button
                onClick={() => handleReview(group.stage)}
                disabled={group.dueNow === 0}
                className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  group.dueNow > 0
                    ? 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]'
                    : 'bg-surface-alt text-text-dim cursor-not-allowed'
                }`}
              >
                {group.dueNow > 0 ? (
                  <><Brain className="w-3.5 h-3.5" /> রিভিউ শুরু করো</>
                ) : (
                  <><CheckCircle className="w-3.5 h-3.5" /> সব রিভিউ করা হয়েছে</>
                )}
              </button>
            )}
          </div>
        ))}

        {totalMistakes === 0 && (
          <div className="text-center py-16 bg-surface border rounded-2xl">
            <Star className="w-16 h-16 text-text-dim mx-auto mb-4" />
            <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">এখনো কোনো ভুল নেই</p>
            <p className="text-text-dim text-sm mt-2 font-medium">প্রাক্টিস করতে থাকো, রিভিউ লিস্ট তৈরি হবে</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-dim px-1">
        <Clock className="w-3 h-3" />
        স্পেসড রিপিটিশন: আজকে &rarr; ৩ দিন পর &rarr; ৭ দিন পর &rarr; ১৪ দিন পর &rarr; ৩০ দিন পর
      </div>
    </div>
  );
};

export default Stars;
