import { motion, AnimatePresence } from 'framer-motion';
import { Gem, X, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function GemPopup({ isOpen, onClose, gems, onViewDetails, onEarnGems }) {
  const [adLoading, setAdLoading] = useState(false);
  const [adDone, setAdDone] = useState(false);

  const handleWatchAd = () => {
    setAdLoading(true);
    setTimeout(() => {
      setAdLoading(false);
      setAdDone(true);
      onEarnGems();
      setTimeout(() => setAdDone(false), 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">Gems</h3>
              <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-surface border rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-surface-alt flex items-center justify-center">
                <Gem className="w-6 h-6 text-text-muted" />
              </div>
              <div>
                <p className="text-2xl font-black text-text">{gems}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted bn-text">জেমস</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onViewDetails('/shop')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-all active:scale-[0.97]"
              >
                <ShoppingBag className="w-4 h-4" />
                Go to Shop
              </button>

              {adLoading ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 bg-surface-alt text-text rounded-xl font-bold text-xs border">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading ad...
                </div>
              ) : adDone ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-xl font-bold text-xs border border-primary/20">
                  <Sparkles className="w-4 h-4" />
                  +10 Gems Earned!
                </div>
              ) : (
                <button
                  onClick={handleWatchAd}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-surface-alt hover:bg-surface-hover text-text rounded-xl font-bold text-xs transition-all active:scale-[0.97] border"
                >
                  <Sparkles className="w-4 h-4 text-bee" />
                  Watch Ad to earn 10 Gems
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
