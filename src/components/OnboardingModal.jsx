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
      <div className="w-full max-w-lg bg-surface border rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-2xl max-h-[90dvh] overflow-y-auto">
        {step === 0 && (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center opacity-10">
                <Graduation className="w-16 h-16 md:w-24 md:h-24" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-text tracking-tighter">ফায়ারম্যানে স্বাগতম!</h2>
                <p className="text-text-muted text-xs md:text-sm mt-1 md:mt-2 font-medium leading-relaxed">
                  তোমার ব্যক্তিগত এক্সাম প্রেপ প্ল্যাটফর্ম। প্রশ্ন প্রাক্টিস করো, লেসন দেখো, মক টেস্ট দাও এবং প্রোগ্রেস ট্র্যাক করো — সব এক জায়গায়।
                </p>
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-dim px-1">তোমাকে কী বলে ডাকব?</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="তোমার নাম লিখো"
                className="w-full bg-background border px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-text font-medium text-sm outline-none focus:border-primary/50 transition-all"
                autoFocus
              />
              <p className="text-[9px] md:text-[10px] text-text-dim px-1">পরে সেটিংসে পরিবর্তন করতে পারবে।</p>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 md:py-4 bg-surface-alt hover:bg-surface-hover text-text rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs border transition-all"
              >
                স্কিপ
              </button>
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] active:scale-[0.98]"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 md:space-y-6">
            <div className="flex justify-center pt-2">
              <div className="relative bg-neutral-800 rounded-2xl px-5 py-3 md:px-6 md:py-4 max-w-xs">
                <p className="text-white font-bold text-sm md:text-base text-center leading-relaxed">
                  তুমি কোন এক্সামের জন্য প্রস্তুতি নিচ্ছ?
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-neutral-800" />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'ssc', label: 'এসএসসি', note: 'এনসিটিবি ইংরেজি ১ম ও ২য় পত্র', icon: GraduationCap },
                { id: 'hsc', label: 'এইচএসসি', note: 'এনসিটিবি ইংরেজি ১ম ও ২য় পত্র', icon: BookOpen },
                { id: 'iba', label: 'আইবিএ', note: 'এডমিশন ইংরেজি, গণিত, অ্যানালিটিক্যাল', icon: Brain },
                { id: 'bcs', label: 'বিসিএস', note: 'কম্পিটিটিভ এক্সাম প্রাক্টিস', icon: Award },
                { id: 'class7', label: 'সপ্তম শ্রেণী', note: 'ইংলিশ গ্রামার', icon: Book },
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
                        : 'bg-surface-alt border hover:border-white/20'
                    }`}
                  >
                      <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                      selected ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'
                    }`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm md:text-base ${selected ? 'text-primary' : 'text-text'}`}>{opt.label}</p>
                      <p className="text-[11px] md:text-xs text-text-muted font-medium truncate">{opt.note}</p>
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
                  : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] active:scale-[0.98]'
              }`}
            >
              চালিয়ে যাও
            </button>
          </div>
        )}
 
        {step === 2 && (
          <div className="space-y-5 md:space-y-6">
            <div className="flex justify-center pt-2">
              <div className="relative bg-neutral-800 rounded-2xl px-5 py-3 md:px-6 md:py-4 max-w-xs">
                <p className="text-white font-bold text-sm md:text-base text-center leading-relaxed">
                  তোমার প্রশ্নের ভাষা বেছে নাও
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-neutral-800" />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'bangla', label: 'বাংলা', subtitle: 'বাংলা মিডিয়াম প্রশ্ন', icon: BookOpen },
                { id: 'english', label: 'ইংরেজি', subtitle: 'ইংরেজি মিডিয়াম প্রশ্ন', icon: Globe },
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
                        : 'bg-surface-alt border hover:border-text-dim'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                      selected ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'
                    }`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm md:text-base ${selected ? 'text-primary' : 'text-text'}`}>{opt.label}</p>
                      <p className="text-[11px] md:text-xs text-text-muted font-medium truncate">{opt.note}</p>
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
                  : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] active:scale-[0.98]'
              }`}
            >
              চালিয়ে যাও
            </button>
          </div>
        )}
 
        {step === 2 && (
          <div className="space-y-5 md:space-y-6">
            <div className="flex justify-center pt-2">
              <div className="relative bg-neutral-800 rounded-2xl px-5 py-3 md:px-6 md:py-4 max-w-xs">
                <p className="text-white font-bold text-sm md:text-base text-center leading-relaxed">
                  তোমার প্রশ্নের ভাষা বেছে নাও
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-neutral-800" />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'bangla', label: 'বাংলা', subtitle: 'বাংলা মিডিয়াম প্রশ্ন', icon: BookOpen },
                { id: 'english', label: 'ইংরেজি', subtitle: 'ইংরেজি মিডিয়াম প্রশ্ন', icon: Globe },
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
                        : 'bg-surface-alt border hover:border-text-dim'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                      selected ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'
                    }`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm md:text-base ${selected ? 'text-primary' : 'text-text'}`}>{opt.label}</p>
                      <p className="text-[11px] md:text-xs text-text-muted font-medium truncate">{opt.subtitle}</p>
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
                  : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] active:scale-[0.98]'
              }`}
            >
              চালিয়ে যাও
            </button>
          </div>
        )}
 
        {step === 3 && (
          <div className="space-y-5 md:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-text tracking-tighter">প্রায় হয়ে গেল!</h2>
              <p className="text-text-muted text-xs md:text-sm font-medium">
                শুরু করার আগে তোমার এক্সপিরিয়েন্স কাস্টমাইজ করো।
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] md:text-sm font-black uppercase tracking-wider text-text-muted mb-2">থিম</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setThemeChoice('dark')}
                    className={`flex-1 rounded-xl py-2 ${themeChoice === 'dark' ? 'bg-primary/15 border-primary' : 'bg-surface-alt border'}`}>
                    ডার্ক
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeChoice('light')}
                    className={`flex-1 rounded-xl py-2 ${themeChoice === 'light' ? 'bg-primary/15 border-primary' : 'bg-surface-alt border'}`}>
                    লাইট
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] md:text-sm font-black uppercase tracking-wider text-text-muted mb-2">টেক্সট সাইজ</p>
                <div className="flex gap-2">
                  {['small','normal','large'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSizeChoice(sz)}
                      className={`flex-1 rounded-xl py-2 ${fontSizeChoice === sz ? 'bg-primary/15 border-primary' : 'bg-surface-alt border'}`}>
                      {sz === 'small' ? 'ছোট' : sz === 'normal' ? 'নরমাল' : 'বড়'}
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
                  : 'bg-primary hover:bg-primary-hover border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] active:scale-[0.98]'
              }`}
            >
              {saving ? 'সেটআপ হচ্ছে...' : 'শেখা শুরু করো'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
