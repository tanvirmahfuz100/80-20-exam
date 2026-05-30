import React from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Star, Flame, Gem, TrendingUp, Target, BookOpen, Medal, Calendar, Clock, Award, BadgeCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMistakesDueCount } from '../services/review';

const activityData = [
  { day: 'S', active: true, intensity: 3 },
  { day: 'M', active: true, intensity: 1 },
  { day: 'T', active: false, intensity: 0 },
  { day: 'W', active: true, intensity: 2 },
  { day: 'T', active: true, intensity: 2 },
  { day: 'F', active: false, intensity: 0 },
  { day: 'S', active: true, intensity: 1 },
];

function ActivityGraph() {
  return (
    <div className="flex items-center gap-1.5">
      {activityData.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-8 h-8 rounded-lg transition-all ${
              d.intensity === 0
                ? 'bg-wolf/50'
                : d.intensity === 1
                  ? 'bg-primary/20'
                  : d.intensity === 2
                    ? 'bg-primary/40'
                    : 'bg-primary'
            }`}
          />
          <span className="text-[9px] font-bold text-text-muted">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const { user, profile } = useAuth();
  const stars = getMistakesDueCount();
  const xp = profile?.total_xp || 0;
  const streak = profile?.streak || 0;
  const gems = profile?.gems || 0;
  const username = user?.user_metadata?.username || 'শিক্ষার্থী';
  const initial = username[0]?.toUpperCase() || 'U';

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl border-2 border-primary/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl font-black text-primary">{initial}</span>
        </div>
        <h1 className="text-lg font-black text-text">{username}</h1>
        <p className="text-sm text-text-muted font-medium mt-0.5 whitespace-nowrap">
          লেভেল {Math.floor(xp / 100) + 1} — {xp < 100 ? 'বিগিনার' : xp < 300 ? 'ব্রোঞ্জ' : xp < 500 ? 'সিলভার' : xp < 800 ? 'গোল্ড' : xp < 1200 ? 'স্যাফায়ার' : xp < 1700 ? 'রুবি' : 'ডায়মন্ড'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border rounded-2xl p-3.5 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-black text-text">{streak}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider bn-text">স্ট্রিক</p>
        </div>
        <div className="bg-surface border rounded-2xl p-3.5 text-center">
          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1 fill-yellow-500/30" />
          <p className="text-lg font-black text-text">{xp}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider bn-text">এক্সপি</p>
        </div>
        <div className="bg-surface border rounded-2xl p-3.5 text-center">
          <Gem className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
          <p className="text-lg font-black text-text">{gems}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider bn-text">জেমস</p>
        </div>
      </div>

      <div className="bg-surface border rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-sm text-text">এই সপ্তাহের অ্যাক্টিভিটি</h2>
          <span className="text-xs text-text-muted font-bold">৩ দিন</span>
        </div>
        <ActivityGraph />
      </div>

      <div className="bg-surface border rounded-2xl p-4 mb-4">
        <h2 className="font-black text-sm text-text mb-3">অ্যাচিভমেন্টস</h2>
        <div className="grid grid-cols-4 gap-2">
          {[{ icon: Award, label: 'প্রথম লেসন', unlocked: true }, { icon: Flame, label: '৩ ডে স্ট্রিক', unlocked: true }, { icon: Target, label: '১০০ এক্সপি', unlocked: false }, { icon: Medal, label: 'গোল্ড লিগ', unlocked: false }].map((ach, i) => (
            <div key={i} className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-1 ${ach.unlocked ? 'bg-primary/10 border border-primary/20' : 'bg-wolf/30 border'}`}>
                <ach.icon className={`w-5 h-5 ${ach.unlocked ? 'text-primary' : 'text-text-muted'}`} />
              </div>
              <p className={`text-[9px] font-bold ${ach.unlocked ? 'text-text' : 'text-text-muted'}`}>{ach.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Link to="/settings" className="flex items-center gap-3 bg-surface border rounded-2xl p-3.5 hover:border-hare transition-all">
          <Settings className="w-5 h-5 text-text-muted" />
          <span className="font-bold text-sm text-text">সেটিংস</span>
          <span className="ml-auto text-text-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </Link>
        <Link to="/stars" className="flex items-center gap-3 bg-surface border rounded-2xl p-3.5 hover:border-hare transition-all">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-sm text-text">স্টার রিভিউ</span>
          {stars > 0 && (
            <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stars}</span>
          )}
        </Link>
      </div>
    </div>
  );
}
