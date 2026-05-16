import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Settings, Menu,
    TrendingUp, LogOut, ShieldCheck,
    MessageSquareWarning, Bell, Target, ClipboardList, Video, Brain, HelpCircle, Star, Sun, Moon, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ReportModal from './ReportModal';
import GuideModal from './GuideModal';
import { getMistakesDueCount } from '../services/review';
import { playSound } from '../utils/sounds';
import { useReducedMotion } from '../hooks';

const navItems = [
    { icon: LayoutDashboard, label: "Home", path: "/" },
    { icon: Target, label: "Practice", path: "/practice" },
    { icon: BookOpen, label: "Courses", path: "/courses" },
    { icon: TrendingUp, label: "Analytics", path: "/analytics" },
    { icon: Settings, label: "Settings", path: "/settings" },
];

const sidebarTips = [
    { icon: Target, text: 'Pick an exam and start practising', path: '/practice' },
    { icon: TrendingUp, text: 'Track your accuracy & progress', path: '/analytics' },
    { icon: Brain, text: 'Review your mistakes regularly', path: '/' },
];

const Sidebar = ({ isOpen, toggle, onOpenReport }) => {
    const { user, signOut, role } = useAuth();
    const sidebarRef = useRef(null);
    const reducedMotion = useReducedMotion();

    const currentRole = role || 'student';

    const publicItems = [
        { icon: LayoutDashboard, label: "Home", path: "/" },
        { icon: BookOpen, label: "Courses", path: "/courses" },
        { icon: Target, label: "Question Bank", path: "/bank" },
        { icon: ClipboardList, label: "Mock Tests", path: "/mock-tests" },
        { icon: Video, label: "Short Bits", path: "/shorts" },
        { icon: Brain, label: "Daily Rituals", path: "/practice" },
    ];

    const privateItems = [
        { icon: Star, label: "Star Review", path: "/stars" },
        { icon: TrendingUp, label: "Neural Report", path: "/analytics" },
        { icon: Settings, label: "Calibration", path: "/settings" },
    ];

    const isAdmin = currentRole === 'super_admin' || currentRole === 'content_admin';

    // Trap focus when sidebar is open on mobile
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
                    className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-md"
                    onClick={toggle}
                    aria-hidden="true"
                />
            )}
            <aside
                ref={sidebarRef}
                role="dialog"
                aria-modal={isOpen}
                aria-label="Navigation sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform transform safe-top safe-bottom
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 bg-sidebar shadow-2xl
                    ${reducedMotion ? 'duration-0' : 'duration-300'}
                `}
            >
                <div className="flex flex-col h-full">
                    <div className="h-16 md:h-20 flex items-center px-6 border-b border-white/5 shrink-0 safe-top">
                        <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
                            80/20 EXAM
                        </span>
                        <button
                            onClick={toggle}
                            className="ml-auto p-2 text-white/20 hover:text-white md:hidden touch-target flex items-center justify-center"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 md:py-8 space-y-6 md:space-y-8 overflow-y-auto no-scrollbar">
                        <div className="space-y-1">
                            <p className="px-3 text-[10px] md:text-2xs font-black uppercase tracking-[0.2em] text-white/10 mb-3 md:mb-4">
                                Lessons
                            </p>
                            {publicItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => { if (window.innerWidth < 768) toggle(); }}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold transition-all relative group min-h-touch
                                        ${isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="space-y-1">
                            <p className="px-3 text-[10px] md:text-2xs font-black uppercase tracking-[0.2em] text-white/10 mb-3 md:mb-4">
                                Your Progress
                            </p>
                            {privateItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => { if (window.innerWidth < 768) toggle(); }}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold transition-all relative group min-h-touch
                                        ${isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-white/30 hover:bg-white/5 hover:text-white border border-transparent'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        {isAdmin && (
                            <div className="space-y-1">
                                <p className="px-3 text-[10px] md:text-2xs font-black uppercase tracking-[0.2em] text-emerald-500/30 mb-3 md:mb-4">
                                    Admin Hub
                                </p>
                                <NavLink
                                    to="/admin"
                                    onClick={() => { if (window.innerWidth < 768) toggle(); }}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold transition-all relative group min-h-touch
                                        ${isActive
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'text-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-500 border border-transparent'
                                        }`
                                    }
                                >
                                    <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                                    Content Studio
                                </NavLink>
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="px-3 text-[10px] md:text-2xs font-black uppercase tracking-[0.2em] text-white/10 mb-3 md:mb-4">
                                Quick Tips
                            </p>
                            {sidebarTips.map((tip) => (
                                <Link
                                    key={tip.text}
                                    to={tip.path}
                                    onClick={() => { if (window.innerWidth < 768) toggle(); }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium text-white/25 hover:text-white/50 hover:bg-white/5 transition-all border border-transparent min-h-touch"
                                >
                                    <tip.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                    {tip.text}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    <div className="px-4 py-4 space-y-4">
                        <div className="bg-surface-alt/50 rounded-2xl p-4 transition-all group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                                <span className="text-[10px] md:text-2xs font-black uppercase tracking-widest text-white/20">
                                    Ready to Learn!
                                </span>
                            </div>
                            <button
                                onClick={onOpenReport}
                                className="flex items-center gap-2 text-[10px] md:text-2xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors min-h-touch"
                            >
                                <MessageSquareWarning className="w-4 h-4" aria-hidden="true" />
                                Report a Problem
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5 space-y-3 bg-black/20 backdrop-blur-xl safe-bottom">
                        <div className="bg-surface-active p-3 rounded-xl">
                            <p className="text-[10px] md:text-2xs uppercase font-bold tracking-widest text-white/30 mb-0.5">
                                {currentRole === 'super_admin' ? 'Admin Mode' : 'Testing as'}
                            </p>
                            <p className="text-sm md:text-base font-black text-white tracking-tight truncate uppercase">
                                {user.user_metadata?.username || user.email || 'Student'}
                            </p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-3 py-3 min-h-touch rounded-xl text-sm md:text-base font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                        >
                            <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
                            Reset Test Session
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
        const handleKey = (e) => {
            if (e.key === 'Escape') setShow(false);
        };
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShow(false);
            }
        };
        document.addEventListener('keydown', handleKey);
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [show]);

    const handleToggle = () => {
        if (!show) {
            playSound('notification');
        }
        setShow(!show);
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="p-3 bg-surface border border-white/5 rounded-2xl text-white/40 hover:text-white hover:border-white/20 transition-all relative touch-target flex items-center justify-center"
                aria-label="Notifications"
                aria-expanded={show}
            >
                <Bell className="w-5 h-5" aria-hidden="true" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-background" aria-hidden="true" />
            </button>

            {show && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Notifications"
                    className={`
                        md:absolute md:right-0 md:mt-4 md:w-80 z-50
                        md:bg-surface md:border md:border-white/10 md:rounded-[32px] md:shadow-2xl md:p-6
                        fixed inset-0 md:inset-auto
                        bg-background md:bg-surface
                        p-4 md:p-6
                        pt-safe-top
                        flex flex-col
                        md:block
                        animate-in md:zoom-in-95 md:duration-200
                    `}
                >
                    <div className="flex items-center justify-between mb-4 md:mb-4 shrink-0">
                        <h4 className="text-xs md:text-[10px] font-black uppercase tracking-widest text-white">
                            Latest News
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] md:text-[9px] font-bold text-primary">
                                1 New
                            </span>
                            <button
                                onClick={() => setShow(false)}
                                className="p-1.5 md:hidden text-white/40 hover:text-white"
                                aria-label="Close notifications"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-sm md:text-xs text-white/70 font-medium leading-relaxed">
                                New BCS questions are ready for you! Go check them out.
                            </p>
                            <span className="text-[10px] md:text-[9px] text-white/10 font-bold mt-2 block uppercase">
                                Just now &bull; Study Guide
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MobileBottomNav = () => {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-xl border-t border-white/10 safe-bottom"
            aria-label="Mobile navigation"
        >
            <div className="flex items-center justify-around py-1 px-1 max-w-full mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative min-w-0 flex-1
                            ${isActive ? 'text-primary' : 'text-white/30'}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary/15' : ''}`}>
                                    <item.icon className={`w-5 h-5 transition-all ${isActive ? 'fill-primary/10' : ''}`} aria-hidden="true" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
                                {isActive && (
                                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" aria-hidden="true" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [reportOpen, setReportOpen] = React.useState(false);
    const [guideOpen, setGuideOpen] = React.useState(false);
    const [globalStarBalance, setGlobalStarBalance] = useState(0);
    const [globalXp, setGlobalXp] = useState(0);
    const { toggleTheme, isDark } = useTheme();
    const { user, profile } = useAuth();
    const location = useLocation();
    const reducedMotion = useReducedMotion();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isLandingPage = location.pathname === '/welcome';
    const isQuizPage = location.pathname.startsWith('/quiz/');
    const hideLayout = isAuthPage || isLandingPage;

    useEffect(() => {
        const refreshBalances = () => {
            setGlobalStarBalance(getMistakesDueCount());
            setGlobalXp(profile?.total_xp || 0);
        };

        refreshBalances();
        window.addEventListener('quizBalanceUpdated', refreshBalances);
        window.addEventListener('mistakeReviewUpdated', refreshBalances);
        return () => {
            window.removeEventListener('quizBalanceUpdated', refreshBalances);
            window.removeEventListener('mistakeReviewUpdated', refreshBalances);
        };
    }, [profile]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const pageTitle = (() => {
        const p = location.pathname;
        if (p === '/') return 'Home';
        if (p.startsWith('/quiz/')) return 'Practice';
        return p.substring(1).replace('/', ' / ');
    })();

    const sidebarToggle = () => setSidebarOpen(prev => !prev);

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/30 pb-16 md:pb-0 overflow-x-hidden max-w-full">
            {!hideLayout && (
                <Sidebar isOpen={sidebarOpen} toggle={sidebarToggle} onOpenReport={() => setReportOpen(true)} />
            )}

            <div className={`${!hideLayout ? 'md:ml-64' : ''} flex flex-col min-h-screen transition-all ${reducedMotion ? 'duration-0' : 'duration-500'}`}>
                {!hideLayout && !isQuizPage && (
                    <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 lg:px-10 border-b border-white/5 bg-background sticky top-0 z-30 safe-top">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                                onClick={sidebarToggle}
                                className="p-2.5 md:hidden text-white/40 hover:text-white bg-white/5 rounded-xl touch-target flex items-center justify-center"
                                aria-label="Open sidebar"
                                aria-expanded={sidebarOpen}
                            >
                                <Menu className="w-5 h-5" aria-hidden="true" />
                            </button>
                            <div className="min-w-0">
                                <p className="hidden md:block text-[10px] md:text-2xs font-black uppercase tracking-[0.3em] text-white/10">
                                    Now Learning
                                </p>
                                <h2 className="text-sm md:text-base lg:text-lg font-black text-white tracking-tighter uppercase truncate">
                                    {pageTitle}
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-3 bg-surface border border-white/5 rounded-2xl text-white/30 hover:text-white hover:border-white/20 transition-all hidden md:flex items-center gap-2 touch-target"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
                            </button>
                            <button
                                onClick={() => setGuideOpen(true)}
                                className="p-3 bg-surface border border-white/5 rounded-2xl text-white/30 hover:text-white hover:border-white/20 transition-all hidden md:flex items-center gap-2 touch-target"
                                title="How to use this app"
                                aria-label="Help guide"
                            >
                                <HelpCircle className="w-5 h-5" aria-hidden="true" />
                                <span className="text-[10px] md:text-2xs font-black uppercase tracking-widest">Help</span>
                            </button>
                            <NotificationCenter />
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="bg-white/5 border border-white/10 rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-right">
                                    <p className="text-[10px] md:text-2xs uppercase font-black tracking-[0.2em] text-white/40">XP</p>
                                    <p className="text-sm md:text-base font-black text-white">{globalXp}</p>
                                </div>
                                <Link
                                    to="/stars"
                                    className="bg-white/5 border border-white/10 rounded-2xl px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all"
                                >
                                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300/30 shrink-0" aria-hidden="true" />
                                    <div>
                                        <p className="text-[10px] md:text-2xs uppercase font-black tracking-[0.2em] text-white/40">Stars</p>
                                        <p className="text-sm md:text-base font-black text-white">{globalStarBalance}</p>
                                    </div>
                                </Link>
                            </div>
                            {user && (
                                <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-white/10">
                                    <div className="text-right">
                                        <p className="text-[9px] md:text-2xs font-black text-primary uppercase tracking-tighter">Level 1</p>
                                        <p className="text-[10px] md:text-2xs font-black text-white/40 uppercase tracking-widest">Beginner</p>
                                    </div>
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center font-black text-primary uppercase cursor-pointer shrink-0">
                                        {user.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>
                )}

                <main className={`
                    w-full flex-1
                    ${!hideLayout && !isQuizPage ? 'p-4 md:p-8 lg:p-10' : ''}
                    ${!hideLayout && isQuizPage ? 'p-3 md:p-6' : ''}
                    ${isAuthPage ? 'flex items-center justify-center p-4 md:p-6' : ''}
                    ${isLandingPage ? '' : ''}
                `}>
                    {children}
                </main>
            </div>

            {!hideLayout && !isQuizPage && <MobileBottomNav />}

            <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
            <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
        </div>
    );
};

export default Layout;
