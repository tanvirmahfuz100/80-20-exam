import { useState } from 'react';
import { BookOpen, Globe, Check, GraduationCap, Brain, Award, Book } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/localApi';
import { Graduation } from './Illustrations';

export default function OnboardingModal({ onComplete }) {
  const { user, profile, updateProfileFields } = useAuth();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(profile?.username || user?.user_metadata?.username || '');
  const [exam, setExam] = useState(null);
  const [version, setVersion] = useState('bangla');
  const { setTheme, setFontSize } = useTheme();
  const [themeChoice, setThemeChoice] = useState(profile?.theme || 'dark');
  const [fontSizeChoice, setFontSizeChoice] = useState(profile?.fontSize || 'normal');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    const name = username.trim() || 'Student';
    updateProfileFields({ username: name, target_exams: exam ? [exam] : [], question_version: version, theme: themeChoice, fontSize: fontSizeChoice });
    await api.updateProfile(user.id, { username: name, target_exams: exam ? [exam] : [], question_version: version, theme: themeChoice, fontSize: fontSizeChoice });
    try { setTheme(themeChoice); } catch {}
    try { setFontSize(fontSizeChoice); } catch {}
    setSaving(false);
    onComplete();
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-4">
      <div className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-2xl max-h-[90dvh] overflow-y-auto">
        {step === 0 && (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center opacity-10">
                <Graduation className="w-16 h-16 md:w-24 md:h-24" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Welcome to 80/20 Exam!</h2>
                <p className="text-white/50 text-xs md:text-sm mt-1 md:mt-2 font-medium leading-relaxed">
                  Your personal exam prep platform. Practice questions, watch lessons, take mock tests, and track your progress — all in one place.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 px-1">What should we call you?</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-background border border-white/10 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-white font-medium text-sm outline-none focus:border-primary/50 transition-all"
                autoFocus
              />
              <p className="text-[9px] md:text-[10px] text-white/20 px-1">You can change this later in Settings.</p>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs border border-white/10 transition-all"
              >
                Skip
              </button>
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px] active:scale-[0.98]"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 md:space-y-6">
            <div className="flex justify-center pt-2">
              <div className="relative bg-neutral-800 rounded-2xl px-5 py-3 md:px-6 md:py-4 max-w-xs">
                <p className="text-white font-bold text-sm md:text-base text-center leading-relaxed">
                  Which exam are you preparing for?
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-neutral-800" />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'ssc', label: 'SSC', note: 'NCTB English 1st and 2nd Paper', icon: GraduationCap },
                { id: 'hsc', label: 'HSC', note: 'NCTB English 1st and 2nd Paper', icon: BookOpen },
                { id: 'iba', label: 'IBA', note: 'Admission English, Math, Analytical', icon: Brain },
                { id: 'bcs', label: 'BCS', note: 'Competitive exam practice', icon: Award },
                { id: 'class7', label: 'Class 7', note: 'English Grammar', icon: Book },
              ].map((opt) => {
                const Icon = opt.icon;
                const selected = exam === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExam(opt.id)}
                    className={`w-full flex items-center gap-4 rounded-xl md:rounded-2xl border-2 px-4 md:px-5 py-3 md:py-4 text-left transition-all ${
                      selected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                      selected ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'
                    }`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm md:text-base ${selected ? 'text-primary' : 'text-white'}`}>{opt.label}</p>
                      <p className="text-[11px] md:text-xs text-white/40 font-medium truncate">{opt.note}</p>
                    </div>
                    {selected && (
                      <Check className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className={`w-full py-3 md:py-4 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 ${
                !exam
                  ? 'opacity-40 cursor-not-allowed bg-primary/50'
                  : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px] active:scale-[0.98]'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 md:space-y-6">
            <div className="flex justify-center pt-2">
              <div className="relative bg-neutral-800 rounded-2xl px-5 py-3 md:px-6 md:py-4 max-w-xs">
                <p className="text-white font-bold text-sm md:text-base text-center leading-relaxed">
                  Choose your question language
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-neutral-800" />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'bangla', label: 'বাংলা', subtitle: 'Bangla medium questions', icon: BookOpen },
                { id: 'english', label: 'English', subtitle: 'English medium questions', icon: Globe },
              ].map((opt) => {
                const Icon = opt.icon;
                const selected = version === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVersion(opt.id)}
                    className={`w-full flex items-center gap-4 rounded-xl md:rounded-2xl border-2 px-4 md:px-5 py-3 md:py-4 text-left transition-all ${
                      selected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                      selected ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'
                    }`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm md:text-base ${selected ? 'text-primary' : 'text-white'}`}>{opt.label}</p>
                      <p className="text-[11px] md:text-xs text-white/40 font-medium truncate">{opt.subtitle}</p>
                    </div>
                    {selected && (
                      <Check className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              className={`w-full py-3 md:py-4 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 ${
                !version
                  ? 'opacity-40 cursor-not-allowed bg-primary/50'
                  : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px] active:scale-[0.98]'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 md:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Almost there!</h2>
              <p className="text-white/50 text-xs md:text-sm font-medium">
                Customize your experience before we start.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] md:text-sm font-black uppercase tracking-wider text-white/40 mb-2">Theme</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setThemeChoice('dark')}
                    className={`flex-1 rounded-xl py-2 ${themeChoice === 'dark' ? 'bg-primary/15 border-primary' : 'bg-white/5 border-white/10'}`}>
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeChoice('light')}
                    className={`flex-1 rounded-xl py-2 ${themeChoice === 'light' ? 'bg-primary/15 border-primary' : 'bg-white/5 border-white/10'}`}>
                    Light
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] md:text-sm font-black uppercase tracking-wider text-white/40 mb-2">Text Size</p>
                <div className="flex gap-2">
                  {['small','normal','large'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSizeChoice(sz)}
                      className={`flex-1 rounded-xl py-2 ${fontSizeChoice === sz ? 'bg-primary/15 border-primary' : 'bg-white/5 border-white/10'}`}>
                      {sz === 'small' ? 'Small' : sz === 'normal' ? 'Normal' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className={`w-full py-3 md:py-4 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 ${
                saving
                  ? 'opacity-40 cursor-not-allowed bg-primary/50'
                  : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px] active:scale-[0.98]'
              }`}
            >
              {saving ? 'Setting up...' : 'Start Learning'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
