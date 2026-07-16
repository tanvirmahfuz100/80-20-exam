import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, Search, Flame, Gem, Star, Sun, Moon, AlertTriangle, X, Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMistakesDueCount, getMistakeGroups, getRecentMistakes } from '../services/review';
import { useReducedMotion } from '../hooks';
import StreakPopup from './StreakPopup';
import GemPopup from './GemPopup';
import StarPopup from './StarPopup';
import LevelUpModal from './LevelUpModal';
import { getCurrentStreak, getStreakHistory, recordDailyCheckIn } from '../services/streak';
import { readStorage } from '../utils/storage';
import { useMistakeStore } from '../stores/mistakeStore';
import Sidebar from './layout/Sidebar';
import MobileBottomNav from './layout/MobileBottomNav';
import NotificationCenter from './layout/NotificationCenter';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [globalStarBalance, setGlobalStarBalance] = useState(0);
  const [globalXp, setGlobalXp] = useState(0);
  const [globalGems, setGlobalGems] = useState(0);
  const [globalStreak, setGlobalStreak] = useState(0);
  const { toggleTheme, isDark } = useTheme();
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/welcome';
  const isQuizPage = location.pathname.startsWith('/quiz/');
  const hideLayout = isAuthPage || isLandingPage;
  const isOnboarding = !localStorage.getItem('user_exam_path') &&
    (location.pathname === '/' || location.pathname === '/learn');

  const refreshKey = useMistakeStore((s) => s.refreshKey);

  useEffect(() => {
    setGlobalStarBalance(getMistakesDueCount());
    setGlobalXp(profile?.total_xp || 0);
    setGlobalGems(profile?.gems || 0);
    setGlobalStreak(profile?.streak || 0);
  }, [profile, refreshKey]);

  const [showNotification, setShowNotification] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showGemPopup, setShowGemPopup] = useState(false);
  const [showStarPopup, setShowStarPopup] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [streakData, setStreakData] = useState(0);
  const [streakHistory, setStreakHistory] = useState([]);
  const [gemsBalance, setGemsBalance] = useState(0);
  const [mistakeGroups, setMistakeGroups] = useState([]);
  const [recentMistakes, setRecentMistakes] = useState([]);

  const refreshPopupData = React.useCallback(() => {
    const profileData = readStorage('exam_local_auth', {}).profile || {};
    setGemsBalance(profileData.gems || 0);
    setStreakData(recordDailyCheckIn(user?.id));
    setStreakHistory(getStreakHistory(user?.id, 31));
    setMistakeGroups(getMistakeGroups());
    setRecentMistakes(getRecentMistakes(3));
  }, [user?.id]);

  useEffect(() => {
    refreshPopupData();
  }, [refreshPopupData, refreshKey]);

  const handleNavFromPopup = (path: string) => {
    setShowStreakPopup(false);
    setShowGemPopup(false);
    setShowStarPopup(false);

    if (location.pathname.startsWith('/quiz/')) {
      setPendingNav(path);
      setShowLeaveConfirm(true);
    } else {
      window.location.hash = path;
    }
  };

  const handleEarnGems = () => {
    const raw = localStorage.getItem('exam_local_auth');
    if (raw) {
      const session = JSON.parse(raw);
      session.profile.gems = (session.profile.gems || 0) + 10;
      localStorage.setItem('exam_local_auth', JSON.stringify(session));
    }
    useMistakeStore.getState().notifyUpdate();
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const sidebarToggle = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/30 pb-16 md:pb-0 overflow-x-hidden max-w-full">
      {!hideLayout && (
        <Sidebar isOpen={sidebarOpen} toggle={sidebarToggle} onOpenReport={() => setReportOpen(true)} />
      )}

      <div className={`${!hideLayout ? 'md:ml-72' : ''} flex flex-col min-h-screen transition-all ${reducedMotion ? 'duration-0' : 'duration-300'}`}>
        {!hideLayout && (
          <header className="h-16 md:h-18 flex items-center justify-between px-4 md:px-6 lg:px-8 bg-surface border-b border sticky top-0 z-20 safe-top">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={sidebarToggle}
                className="p-1 -ml-1 md:hidden text-text-muted hover:text-text touch-target flex items-center justify-center"
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <Link to="/" className="hidden md:flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xs">80</span>
                </div>
                <span className="text-base font-black text-text tracking-tight">
                  80-20 Exam
                </span>
              </Link>
              {location.pathname === '/' && (
                <div className="w-36 md:w-44 shrink min-w-0">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => navigate('/bank')}
                  >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
                    <input
                      type="text"
                      placeholder="প্রশ্ন খুঁজুন..."
                      className="w-full bg-background border rounded-xl pl-9 pr-3 py-[7px] text-sm text-text placeholder:text-text-dim outline-none focus:border-primary/50 transition-all cursor-pointer"
                      readOnly
                      onFocus={(e) => { e.target.blur(); navigate('/bank'); }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 bg-surface border border rounded-xl text-text-muted hover:text-text hover:border transition-all hidden md:flex items-center justify-center touch-target"
                aria-label={isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowStreakPopup(true)}
                  className="flex items-center gap-1.5 bg-surface border rounded-xl px-2.5 py-1.5 hover:bg-surface-hover transition-all active:scale-95"
                  aria-label="Open streak details"
                >
                  <Flame className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-black text-text">{streakData}</span>
                </button>
                <button
                  onClick={() => setShowGemPopup(true)}
                  className="flex items-center gap-1.5 bg-surface border rounded-xl px-2.5 py-1.5 hover:bg-surface-hover transition-all active:scale-95"
                  aria-label="Open gem details"
                >
                  <Gem className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-black text-text">{gemsBalance}</span>
                </button>
                <button
                  onClick={() => setShowStarPopup(true)}
                  className="flex items-center gap-1.5 bg-surface border rounded-xl px-2.5 py-1.5 hover:bg-surface-hover transition-all active:scale-95 topbar-star-target"
                  aria-label="Open star rewards"
                >
                  <Star className="w-4 h-4 text-bee fill-bee/30" />
                  <span className="text-sm font-black text-bee">{globalStarBalance}</span>
                </button>
                <NotificationCenter isOpen={showNotification} onToggle={() => setShowNotification(prev => !prev)} />
              </div>

              {user && (
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 pl-3 border-l border"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center font-black text-primary text-sm uppercase shrink-0">
                    {user.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Link>
              )}
            </div>
          </header>
        )}

        <main className={`
          w-full flex-1
          ${!hideLayout && !isQuizPage ? 'p-4 md:p-6 lg:p-8' : ''}
          ${!hideLayout && isQuizPage ? 'p-0' : ''}
          ${isAuthPage ? 'flex items-center justify-center p-4 md:p-6' : ''}
          ${isLandingPage ? '' : ''}
        `}>
          {children}
        </main>
      </div>

      {!hideLayout && !isOnboarding && <MobileBottomNav />}

      <StreakPopup
        isOpen={showStreakPopup}
        onClose={() => setShowStreakPopup(false)}
        streak={streakData}
        streakHistory={streakHistory}
        onViewDetails={handleNavFromPopup}
      />
      <GemPopup
        isOpen={showGemPopup}
        onClose={() => setShowGemPopup(false)}
        gems={gemsBalance}
        onViewDetails={handleNavFromPopup}
        onEarnGems={handleEarnGems}
      />
      <StarPopup
        isOpen={showStarPopup}
        onClose={() => setShowStarPopup(false)}
        mistakeGroups={mistakeGroups}
        recentMistakes={recentMistakes}
        onViewDetails={handleNavFromPopup}
      />
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowLeaveConfirm(false); setPendingNav(null); }} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cardinal/10 shrink-0">
                <AlertTriangle className="w-5 h-5 text-cardinal" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-text">Are you sure you want to leave the quiz?</h3>
                <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                  You'll lose your progress on this lesson if you leave. Your answers so far are saved.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowLeaveConfirm(false); setPendingNav(null); }}
                className="flex-1 py-3 bg-surface-alt hover:bg-surface-hover text-text rounded-full font-bold text-sm transition-all active:scale-[0.97] border"
              >
                No
              </button>
              <button
                onClick={() => { setShowLeaveConfirm(false); if (pendingNav) navigate(pendingNav); setPendingNav(null); }}
                className="flex-1 py-3 bg-cardinal text-white hover:bg-cardinal-dark rounded-full font-bold text-sm transition-all active:scale-[0.97]"
              >
                Yes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showNotification && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowNotification(false)} />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text">নোটিফিকেশন</h3>
                <button onClick={() => setShowNotification(false)} className="text-text-muted hover:text-text transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 bg-background rounded-xl border">
                  <p className="text-sm text-text font-medium leading-relaxed">
                    নতুন বিসিএস প্রশ্ন প্রস্তুত! এখনই দেখে নাও।
                  </p>
                  <span className="text-[10px] text-text-muted font-bold mt-1.5 block uppercase">
                    এইমাত্র
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LevelUpModal />
    </div>
  );
};

export default Layout;
