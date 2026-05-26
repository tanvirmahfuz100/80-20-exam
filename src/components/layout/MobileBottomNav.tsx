import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Medal, Target, ShoppingBag, User } from 'lucide-react';

const bottomNavItems = [
  { icon: LayoutDashboard, label: "লার্ন", path: "/" },
  { icon: Medal, label: "লিডারবোর্ড", path: "/leaderboard" },
  { icon: Target, label: "কুয়েস্ট", path: "/quests" },
  { icon: ShoppingBag, label: "শপ", path: "/shop" },
  { icon: User, label: "প্রোফাইল", path: "/profile" },
];

export default function MobileBottomNav() {
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
}
