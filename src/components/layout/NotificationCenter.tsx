import { Bell } from 'lucide-react';
import { playSound } from '../../utils/sounds';

export default function NotificationCenter({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={() => { if (!isOpen) playSound('notification'); onToggle(); }}
        className="p-1.5 text-text-muted hover:text-text hover:bg-surface-hover transition-all relative touch-target flex items-center justify-center rounded-xl"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-cardinal rounded-full ring-2 ring-background" aria-hidden="true" />
      </button>
    </div>
  );
}
