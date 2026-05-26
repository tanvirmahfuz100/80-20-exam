import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Medal, Target, ShoppingBag, User, X, Search,
  BookOpen, Settings as SettingsIcon, ShieldCheck, Star, MessageSquareWarning,
  Sun, Moon, TrendingUp, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion } from '../../hooks';

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

export default function Sidebar({ isOpen, toggle, onOpenReport }: { isOpen: boolean; toggle: () => void; onOpenReport: () => void }) {
  const { user, signOut, role } = useAuth();
  const sidebarRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isAdmin = role === 'super_admin' || role === 'content_admin';
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggle();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggle} aria-hidden="true" />
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
              <span className="text-xl font-black text-text tracking-tight">80-20 Exam</span>
            </div>
            <button
              onClick={toggle}
              className="ml-auto p-2 text-text-muted hover:text-text md:hidden touch-target flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-5 h-5 text-text-muted" /> : <Sun className="w-5 h-5 text-text-muted" />}
              <span className="text-sm font-bold text-text-muted">ডার্ক মোড</span>
            </div>
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-text-muted/30'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
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
                        ${isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-hover hover:text-text'}`
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
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/50 mb-2 bn-text">অ্যাডমিন</p>
                <NavLink
                  to="/admin"
                  onClick={() => { if (window.innerWidth < 768) toggle(); }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${isActive ? 'bg-emerald-500/10 text-emerald-600' : 'text-text-muted hover:bg-surface-hover hover:text-text'}`
                  }
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                  কন্টেন্ট স্টুডিও
                </NavLink>
              </div>
            )}
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
}
