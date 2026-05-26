import { Trophy, Star, Zap, RefreshCw, Sparkles, Home } from 'lucide-react';

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
  const ResultCard = ({ children, levelMode }) => (
    <div className="max-w-lg mx-auto">
      <div className="bg-surface border rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full border-2 border-primary/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-text tracking-tight mb-1 bn-text">
              {currentLevel ? `লেভেল ${currentLevel} সম্পন্ন!` : 'প্রাক্টিস সম্পন্ন!'}
            </h2>
            <p className="text-sm text-text-muted font-medium truncate px-2">{title}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );

  if (currentLevel) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-surface border rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 text-center space-y-5">
            <div className="flex justify-center mb-1">
              <img
                src={`${import.meta.env.BASE_URL || '/'}mascot-celebrating.png`}
                alt="Mascot celebrating"
                className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-lg"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-text tracking-tight mb-1 bn-text">
                লেভেল {currentLevel} সম্পন্ন!
              </h2>
              <p className="text-sm text-text-muted font-medium truncate px-2">{title}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-2xl p-4 border">
                <div className={`font-black text-xl mb-0.5 ${accuracy >= 80 ? 'text-primary' : accuracy >= 50 ? 'text-bee' : 'text-text-muted'}`}>{accuracy}%</div>
                <div className="text-[9px] text-text-muted font-black uppercase tracking-wider bn-text">একিউরেসি</div>
              </div>
              <div className="bg-background rounded-2xl p-4 border">
                <div className="text-primary font-black text-xl mb-0.5">{score}/{totalQuestions}</div>
                <div className="text-[9px] text-text-muted font-black uppercase tracking-wider bn-text">সঠিক</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center justify-center gap-1.5">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-primary font-black text-xl">+{earnedXp}</span>
                </div>
                <div className="text-[9px] text-primary/50 font-black uppercase tracking-wider mt-0.5 bn-text">এক্সপি</div>
              </div>
              {earnedStars === 0 ? (
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                  <div className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-primary font-black text-xl">পারফেক্ট!</span>
                  </div>
                  <div className="text-[9px] text-primary/50 font-black uppercase tracking-wider mt-0.5 bn-text">কোনো ভুল নেই</div>
                </div>
              ) : (
                <div className="bg-bee/5 rounded-2xl p-4 border border-bee/20">
                  <div className="flex items-center justify-center gap-1.5">
                    <Star className="w-5 h-5 text-bee" />
                    <span className="text-bee font-black text-xl">{earnedStars}</span>
                  </div>
                  <div className="text-[9px] text-bee/50 font-black uppercase tracking-wider mt-0.5 bn-text">স্টার রিভিউ</div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onGoHome}
                className="flex-1 py-3 bg-surface border text-text rounded-full font-bold text-sm hover:bg-background transition-all active:scale-[0.97] min-h-touch flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> হোম
              </button>
              <button
                onClick={onPracticeAgain}
                className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-hover active:scale-[0.97] transition-all flex items-center justify-center gap-2 min-h-touch shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> আবার করো
              </button>
              {accuracy >= 80 && onNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="flex-1 py-3 bg-peacock text-white rounded-full font-bold text-sm hover:bg-accent-dark transition-all active:scale-[0.97] flex items-center justify-center gap-2 min-h-touch shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> পরবর্তী লেভেল
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-surface border rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 text-center space-y-5">
          <div className="flex justify-center mb-1">
            <img
              src={`${import.meta.env.BASE_URL || '/'}mascot-celebrating.png`}
              alt="Mascot celebrating"
              className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-lg"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-text tracking-tight mb-1 bn-text">প্রাক্টিস সম্পন্ন!</h2>
            <p className="text-sm text-text-muted font-medium truncate px-2">{title}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background rounded-2xl p-4 border">
              <div className="font-black text-xl mb-0.5" style={{ color: accuracy >= 80 ? '#93D333' : accuracy >= 50 ? '#FFC700' : '#829CAD' }}>{accuracy}%</div>
              <div className="text-[9px] text-text-muted font-black uppercase tracking-wider">Accuracy</div>
            </div>
            <div className="bg-background rounded-2xl p-4 border">
              <div className="text-primary font-black text-xl mb-0.5">{score}/{totalQuestions}</div>
              <div className="text-[9px] text-text-muted font-black uppercase tracking-wider bn-text">সঠিক</div>
            </div>
            {earnedStars === 0 ? (
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <div className="text-primary font-black text-xl mb-0.5">ক্লিন!</div>
                <div className="text-[9px] text-primary/50 font-black uppercase tracking-wider mt-0.5 bn-text">কোনো ভুল নেই</div>
              </div>
            ) : (
              <div className="bg-bee/5 rounded-2xl p-4 border border-bee/20">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="w-5 h-5 text-bee" />
                  <span className="text-bee font-black text-xl">{earnedStars}</span>
                </div>
                <div className="text-[9px] text-bee/50 font-black uppercase tracking-wider mt-0.5 bn-text">স্টার রিভিউ</div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={onGoHome} className="flex-1 py-3 bg-surface border text-text rounded-full font-bold text-sm hover:bg-background transition-all active:scale-[0.97] min-h-touch flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> হোম
            </button>
            <button onClick={onPracticeAgain} className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-hover active:scale-[0.97] transition-all flex items-center justify-center gap-2 min-h-touch shadow-sm">
              <RefreshCw className="w-4 h-4" /> আবার চেষ্টা করো
            </button>
            {onNextModel && (
              <button
                onClick={onNextModel}
                className="flex-1 py-3 bg-peacock text-white rounded-full font-bold text-sm hover:bg-accent-dark transition-all active:scale-[0.97] flex items-center justify-center gap-2 min-h-touch shadow-sm"
              >
                পরবর্তী মডেল
              </button>
            )}
          </div>
          {file?.includes('model_') && (
            <button onClick={onGoHome} className="text-[10px] font-bold text-text-muted hover:text-text transition-colors mt-1">
              ← সব মডেল টেস্ট
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
