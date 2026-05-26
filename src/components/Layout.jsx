import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Target, ShoppingBag, User, Menu, X,
  BookOpen, Settings as SettingsIcon, HelpCircle, Bell,
  Flame, Gem, LogOut, ShieldCheck, Star, MessageSquareWarning,
  Sun, Moon, TrendingUp, Brain, Medal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMistakesDueCount } from '../services/review';
import { playSound } from '../utils/sounds';
import { useReducedMotion } from '../hooks';

const bottomNavItems = [
  { icon: LayoutDashboard, label: "লার্ন", path: "/" },
  { icon: Medal, label: "লিডারবোর্ড", path: "/leaderboard" },
  { icon: Target, label: "কুয়েস্ট", path: "/quests" },
  { icon: ShoppingBag, label: "শপ", path: "/shop" },
  { icon: User, label: "প্রোফাইল", path: "/profile" },
];

const sidebarSections = [
  {
    label: "কোর্স",
    items: [
      { icon: LayoutDashboard, label: "লার্ন", path: "/" },
      { icon: Medal, label: "লিডারবোর্ড", path: "/leaderboard" },
      { icon: Target, label: "কুয়েস্ট", path: "/quests" },
      { icon: ShoppingBag, label: "শপ", path: "/shop" },
      { icon: User, label: "প্রোফাইল", path: "/profile" },
    ]
  },
  {
    label: "প্রোগ্রেস",
    items: [
      { icon: Star, label: "স্টার রিভিউ", path: "/stars" },
      { icon: TrendingUp, label: "অ্যানালিটিক্স", path: "/analytics" },
      { icon: BookOpen, label: "প্রশ্নব্যাংক", path: "/bank" },
    ]
  }
];

const Sidebar = ({ isOpen, toggle, onOpenReport }) => {
  const { user, signOut, role } = useAuth();
  const sidebarRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isAdmin = role === 'super_admin' || role === 'content_admin';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') toggle();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggle}
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Navigation sidebar"
        className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform transform safe-top safe-bottom
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 bg-surface shadow-xl
          ${reducedMotion ? 'duration-0' : 'duration-300'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 md:h-20 flex items-center px-6 border-b border shrink-0 safe-top">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">80</span>
              </div>
              <span className="text-xl font-black text-text tracking-tight">
                80-20 Exam
              </span>
            </div>
            <button
              onClick={toggle}
              className="ml-auto p-2 text-text-muted hover:text-text md:hidden touch-target flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 overflow-y-auto no-scrollbar">
            {sidebarSections.map((section) => (
              <div key={section.label} className="mb-6">
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 bn-text">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => { if (window.innerWidth < 768) toggle(); }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative group
                        ${isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-muted hover:bg-surface-hover hover:text-text'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}

            {isAdmin && (
              <div className="mb-6">
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/50 mb-2 bn-text">
                  অ্যাডমিন
                </p>
                <NavLink
                  to="/admin"
                  onClick={() => { if (window.innerWidth < 768) toggle(); }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${isActive
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text'
                    }`
                  }
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                  কন্টেন্ট স্টুডিও
                </NavLink>
              </div>
            )}

            <div className="space-y-0.5">
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 bn-text">
                অন্যান্য
              </p>
              <NavLink
                to="/settings"
                onClick={() => { if (window.innerWidth < 768) toggle(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                  }`
                }
              >
                <SettingsIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
                সেটিংস
              </NavLink>
              <button
                onClick={onOpenReport}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:bg-surface-hover hover:text-text transition-all"
              >
                <MessageSquareWarning className="w-5 h-5 shrink-0" aria-hidden="true" />
                সমস্যা জানাও
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border space-y-3 bg-background/50 safe-bottom">
            <div className="bg-surface-hover p-3 rounded-xl">
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5 bn-text">
                {isAdmin ? 'অ্যাডমিন মোড' : 'শিক্ষার্থী'}
              </p>
              <p className="text-sm font-black text-text tracking-tight truncate bn-text">
                {user?.user_metadata?.username || user?.email || 'শিক্ষার্থী'}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-cardinal hover:bg-cardinal/10 transition-all"
            >
              <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
              সেশন রিসেট
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const NotificationCenter = () => {
  const [show, setShow] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    const handleKey = (e) => { if (e.key === 'Escape') setShow(false); };
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [show]);

  return (
    <div className="relative">
      <button
        onClick={() => { if (!show) playSound('notification'); setShow(!show); }}
        className="p-2.5 bg-surface border border rounded-xl text-text-muted hover:text-text hover:border transition-all relative touch-target flex items-center justify-center"
        aria-label="Notifications"
        aria-expanded={show}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-cardinal rounded-full ring-2 ring-background" aria-hidden="true" />
      </button>

      {show && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className={`
            md:absolute md:right-0 md:mt-2 md:w-80 z-50
            md:bg-surface md:border md:border md:rounded-2xl md:shadow-lg md:p-5
            fixed inset-0 md:inset-auto
            bg-surface
            p-4 md:p-5
            pt-safe-top
            flex flex-col
            md:block
            animate-scaleIn
          `}
        >
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h4 className="text-xs font-black uppercase tracking-widest text-text bn-text">
              নোটিফিকেশন
            </h4>
            <button
              onClick={() => setShow(false)}
              className="p-1.5 md:hidden text-text-muted hover:text-text"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="p-3.5 bg-background rounded-xl border border">
              <p className="text-sm text-text font-medium leading-relaxed">
                নতুন বিসিএস প্রশ্ন প্রস্তুত! এখনই দেখে নাও।
              </p>
              <span className="text-[10px] text-text-muted font-bold mt-1.5 block uppercase">
                এইমাত্র
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  const isQuizPage = location.pathname.startsWith('/quiz/');
  if (isQuizPage) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around py-1 px-1 max-w-lg mx-auto">
        {bottomNavItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center px-2 py-1.5 rounded-xl transition-all min-w-0 flex-1"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                <item.icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

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
  const reducedMotion = useReducedMotion();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/welcome';
  const isQuizPage = location.pathname.startsWith('/quiz/');
  const hideLayout = isAuthPage || isLandingPage;
  const isOnboarding = !localStorage.getItem('user_exam_path') &&
    (location.pathname === '/' || location.pathname === '/learn');

  useEffect(() => {
    const refreshBalances = () => {
      setGlobalStarBalance(getMistakesDueCount());
      setGlobalXp(profile?.total_xp || 0);
      setGlobalGems(profile?.gems || 0);
      setGlobalStreak(profile?.streak || 0);
    };
    refreshBalances();
    window.addEventListener('quizBalanceUpdated', refreshBalances);
    window.addEventListener('mistakeReviewUpdated', refreshBalances);
    return () => {
      window.removeEventListener('quizBalanceUpdated', refreshBalances);
      window.removeEventListener('mistakeReviewUpdated', refreshBalances);
    };
  }, [profile]);

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
                className="p-2 md:hidden text-text-muted hover:text-text bg-surface-hover rounded-xl touch-target flex items-center justify-center"
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <Link to="/" className="hidden md:flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xs">80</span>
                </div>
                <span className="text-base font-black text-text tracking-tight">
                  80-20 Exam
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 bg-surface border border rounded-xl text-text-muted hover:text-text hover:border transition-all hidden md:flex items-center justify-center touch-target"
                aria-label={isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <NotificationCenter />

              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 bg-surface border rounded-xl px-2.5 py-1.5">
                  <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
                  <span className="text-sm font-black text-orange-600">{globalStreak}</span>
                </div>
                <Link
                  to="/shop"
                  className="flex items-center gap-1.5 bg-surface border rounded-xl px-2.5 py-1.5 hover:bg-surface-hover transition-all"
                >
                  <Gem className="w-4 h-4 text-cyan-500" aria-hidden="true" />
                  <span className="text-sm font-black text-cyan-600">{globalGems}</span>
                </Link>
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
    </div>
  );
};

export default Layout;
