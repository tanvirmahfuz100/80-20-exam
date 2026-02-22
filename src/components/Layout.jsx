import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Settings, Menu,
    TrendingUp, LogOut, ShieldCheck, LogIn,
    MessageSquareWarning, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReportModal from './ReportModal';

const Sidebar = ({ isOpen, toggle, onOpenReport }) => {
    const { user, signOut, role } = useAuth();

    // Safety check for role
    const currentRole = role || 'student';

    const publicItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: BookOpen, label: "Practice", path: "/practice" },
    ];

    const privateItems = [
        { icon: TrendingUp, label: "Analytics", path: "/analytics" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    const isAdmin = currentRole === 'super_admin' || currentRole === 'content_admin';

    return (
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-sidebar border-r border-border shadow-2xl transition-all duration-300`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-hover italic tracking-tighter uppercase">
                        80/20 EXAM
                    </span>
                    <div className="ml-auto md:hidden">
                        <button onClick={toggle} className="p-1 text-white/20 hover:text-white">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto no-scrollbar">
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/10 mb-4">Core Modules</p>
                        {publicItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all relative group ${isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(94,106,210,0.1)]'
                                        : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/10 mb-4">Personal Lab</p>
                        {privateItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all relative group ${isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-white/30 hover:bg-white/5 hover:text-white border border-transparent'
                                    } ${!user ? 'opacity-50 cursor-not-allowed grayscale' : ''}`
                                }
                                onClick={(e) => !user && e.preventDefault()}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                                {!user && <div className="ml-auto text-[8px] bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5 font-black uppercase">PRO</div>}
                            </NavLink>
                        ))}
                    </div>

                    {isAdmin && (
                        <div className="space-y-1 animate-in slide-in-from-left-4">
                            <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/30 mb-4">System Administration</p>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all relative group ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                        : 'text-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-500 border border-transparent'
                                    }`
                                }
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Command Base
                            </NavLink>
                        </div>
                    )}
                </nav>

                {/* Status Bar */}
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-surface-alt/50 border border-white/5 rounded-2xl p-4 transition-all hover:border-white/10 group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">All Systems Operational</span>
                        </div>
                        <button
                            onClick={onOpenReport}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                        >
                            <MessageSquareWarning className="w-4 h-4" />
                            Incident Report
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border space-y-3 bg-black/20 backdrop-blur-xl">
                    {user ? (
                        <>
                            <div className="bg-surface-active p-3 rounded-xl border border-white/10">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-0.5">Active Operator</p>
                                <p className="text-sm font-black text-white tracking-tight truncate uppercase">{user.user_metadata?.username || user.email}</p>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                            >
                                <LogOut className="w-5 h-5" />
                                Terminate Session
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="w-full flex items-center justify-center gap-3 px-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-primary hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 animate-pulse hover:animate-none"
                        >
                            <LogIn className="w-4 h-4" />
                            Initialize Authentication
                        </Link>
                    )}
                </div>
            </div>
        </aside>
    );
};

const NotificationCenter = () => {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setShow(!show)}
                className="p-3 bg-surface border border-white/5 rounded-2xl text-white/40 hover:text-white hover:border-white/20 transition-all relative"
            >
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
            </button>

            {show && (
                <div className="absolute right-0 mt-4 w-80 bg-surface border border-white/10 rounded-[32px] shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Transmission Center</h4>
                        <span className="text-[9px] font-bold text-primary italic">1 Active</span>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-xs text-white/70 font-medium leading-relaxed">Neural library update finalized. 50 new BCS questions indexed.</p>
                            <span className="text-[9px] text-white/10 font-bold mt-2 block uppercase">10:00 AM • System Intelligence</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [reportOpen, setReportOpen] = React.useState(false);
    const { user } = useAuth();
    const location = useLocation();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/30">
            {!isAuthPage && <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} onOpenReport={() => setReportOpen(true)} />}

            <div className={`${!isAuthPage ? 'md:ml-64' : ''} flex flex-col min-h-screen transition-all duration-500`}>
                {/* Global Topbar */}
                {!isAuthPage && (
                    <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 md:hidden text-white/40 hover:text-white bg-white/5 rounded-2xl">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="hidden md:block">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Neural Interface</p>
                                <h2 className="text-sm font-black text-white italic tracking-tighter uppercase">{location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('/', ' / ')}</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                            {user && (
                                <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-white/10">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-tighter">Level 1</p>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest tracking-tighter">Initiate</p>
                                    </div>
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center font-black text-primary italic uppercase group-hover:scale-110 transition-transform cursor-pointer">
                                        {user.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>
                )}

                <main className={`p-6 md:p-10 max-w-7xl mx-auto w-full flex-1 ${isAuthPage ? 'flex items-center justify-center' : ''}`}>
                    {children}
                </main>
            </div>

            <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-md"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
