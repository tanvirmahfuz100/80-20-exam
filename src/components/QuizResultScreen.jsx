import { Trophy, Star, Zap, RefreshCw } from 'lucide-react';

export default function QuizResultScreen({
  score,
  totalQuestions,
  title,
  accuracy,
  earnedXp,
  earnedStars,
  currentLevel,
  file,
  onGoHome,
  onPracticeAgain,
  onNextLevel,
  onNextModel,
}) {
  if (currentLevel) {
    return (
      <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
        <div className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 text-center space-y-4 md:space-y-8">
            <div className="flex justify-center mb-2">
            <img
              src={`${import.meta.env.BASE_URL || '/'}mascot-celebrating.png`}
              alt="Mascot celebrating"
              className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl"
            />
          </div>

          <div className="inline-flex p-3 md:p-5 bg-primary/10 rounded-full border border-primary/20 mb-1 md:mb-2">
              <Trophy className="w-6 h-6 md:w-12 md:h-12 text-primary" />
            </div>

            <div>
              <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter mb-1 uppercase">লেভেল {currentLevel} সম্পন্ন!</h2>
              <p className="text-white/30 font-bold uppercase tracking-widest text-[9px] md:text-xs truncate px-2">{title}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                <div className={`font-black text-lg md:text-3xl mb-0.5 ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-white/50'}`}>{accuracy}%</div>
                <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">একিউরেসি</div>
              </div>
              <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                <div className="text-emerald-500 font-black text-lg md:text-3xl mb-0.5">{score}/{totalQuestions}</div>
                <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">সঠিক</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-primary/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-primary/20">
                <div className="flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                  <span className="text-primary font-black text-lg md:text-3xl">+{earnedXp}</span>
                </div>
                <div className="text-[8px] md:text-[10px] text-primary/50 font-black uppercase tracking-widest mt-0.5">এক্সপি অর্জিত</div>
              </div>
              {earnedStars === 0 ? (
                <div className="bg-emerald-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center justify-center gap-1.5">
                    <Trophy className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" />
                    <span className="text-emerald-400 font-black text-lg md:text-3xl">পারফেক্ট!</span>
                  </div>
                  <div className="text-[8px] md:text-[10px] text-emerald-400/50 font-black uppercase tracking-widest mt-0.5">কোনো ভুল নেই</div>
                </div>
              ) : (
                <div className="bg-yellow-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-yellow-500/20">
                  <div className="flex items-center justify-center gap-1.5">
                    <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                    <span className="text-yellow-400 font-black text-lg md:text-3xl">{earnedStars}</span>
                  </div>
                  <div className="text-[8px] md:text-[10px] text-yellow-400/50 font-black uppercase tracking-widest mt-0.5">স্টার রিভিউ বাকি</div>
                  <div className="text-[6px] md:text-[8px] text-yellow-400/30 font-black uppercase tracking-widest mt-0.5">বাকি স্টার রিভিউ করো</div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-6">
              <button
                onClick={onGoHome}
                className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border border-white/5 transition-all active:scale-[0.98] min-h-touch"
              >
                হোম
              </button>
              <button
                onClick={onPracticeAgain}
                className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" /> আবার প্রাক্টিস করো
              </button>
              {accuracy >= 80 && onNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="flex-1 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch"
                >
                  <Trophy className="w-4 h-4" /> পরবর্তী লেভেল
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
      <div className="bg-surface border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 text-center space-y-4 md:space-y-8">
          <div className="flex justify-center mb-2">
            <img
              src={`${import.meta.env.BASE_URL || '/'}mascot-celebrating.png`}
              alt="Mascot celebrating"
              className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl"
            />
          </div>

          <div className="inline-flex p-3 md:p-5 bg-primary/10 rounded-full border border-primary/20 mb-1 md:mb-2">
            <Trophy className="w-6 h-6 md:w-12 md:h-12 text-primary" />
          </div>

          <div>
            <h2 className="text-xl md:text-4xl font-black text-white tracking-tighter mb-1 uppercase">প্রাক্টিস সম্পন্ন!</h2>
            <p className="text-white/30 font-bold uppercase tracking-widest text-[9px] md:text-xs truncate px-2">{title}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-6">
            <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
              <div className="font-black text-lg md:text-3xl mb-0.5" style={{ color: accuracy >= 80 ? '#34d399' : accuracy >= 50 ? '#fbbf24' : '#ffffff80' }}>{accuracy}%</div>
              <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">Accuracy</div>
            </div>
            <div className="bg-surface-alt p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
              <div className="text-emerald-500 font-black text-lg md:text-3xl mb-0.5">{score}/{totalQuestions}</div>
              <div className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">সঠিক</div>
            </div>
            {earnedStars === 0 ? (
              <div className="bg-emerald-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-emerald-500/20">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="text-emerald-400 font-black text-lg md:text-3xl">ক্লিন!</div>
                </div>
                <div className="text-[8px] md:text-[10px] text-emerald-400/50 font-black uppercase tracking-widest mt-0.5">কোনো ভুল নেই</div>
              </div>
            ) : (
              <div className="bg-yellow-500/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-yellow-500/20">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-black text-lg md:text-3xl">{earnedStars}</span>
                </div>
                <div className="text-[8px] md:text-[10px] text-yellow-400/50 font-black uppercase tracking-widest mt-0.5">স্টার রিভিউ বাকি</div>
                <div className="text-[6px] md:text-[8px] text-yellow-400/30 font-black uppercase tracking-widest mt-0.5">বাকি স্টার রিভিউ করো</div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-6">
            <button onClick={onGoHome} className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border border-white/5 transition-all active:scale-[0.98] min-h-touch">
              হোম
            </button>
            <button onClick={onPracticeAgain} className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch">
              <RefreshCw className="w-4 h-4" aria-hidden="true" /> আবার চেষ্টা করো
            </button>
            {onNextModel && (
              <button
                onClick={onNextModel}
                className="flex-1 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-[10px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-touch"
              >
                পরবর্তী মডেল
              </button>
            )}
          </div>
          {file?.includes('model_') && (
            <button onClick={onGoHome} className="text-[9px] font-bold text-white/20 hover:text-white/40 transition-colors mt-2">
              â† সব মডেল টেস্ট
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
