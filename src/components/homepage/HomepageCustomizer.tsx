import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { useHomepageLayout } from '../../hooks/useHomepageLayout';
import { ALL_CARDS, HOMEPAGE_CARD_META } from '../../types/homepage';
import type { HomepageCardId } from '../../types/homepage';

interface HomepageCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HomepageCustomizer({ isOpen, onClose }: HomepageCustomizerProps) {
  const { segments, isCardActive, toggleCard, moveUp, moveDown, resetToDefault } = useHomepageLayout();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-surface border-b z-10 px-5 py-4 flex items-center justify-between">
              <h2 className="font-black text-sm text-text">হোমপেজ কাস্টমাইজ</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-surface-alt border flex items-center justify-center hover:bg-surface-hover transition-all"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-text-muted mb-3">সক্রিয় কার্ড (অর্ডার)</p>
                {segments.length === 0 ? (
                  <p className="text-xs text-text-dim text-center py-4">কোনো কার্ড সক্রিয় নেই। নিচ থেকে যোগ করো।</p>
                ) : (
                  <div className="space-y-2">
                    {segments.map((id, index) => {
                      const meta = HOMEPAGE_CARD_META[id];
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 p-3 rounded-xl bg-surface-alt border"
                        >
                          <GripVertical className="w-4 h-4 text-text-dim shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-text">{meta?.label || id}</p>
                            <p className="text-[10px] text-text-muted">{meta?.description || ''}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveUp(index)}
                              disabled={index === 0}
                              className="w-7 h-7 rounded-lg bg-surface border flex items-center justify-center hover:bg-surface-hover disabled:opacity-30 transition-all"
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                            </button>
                            <button
                              onClick={() => moveDown(index)}
                              disabled={index === segments.length - 1}
                              className="w-7 h-7 rounded-lg bg-surface border flex items-center justify-center hover:bg-surface-hover disabled:opacity-30 transition-all"
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                            </button>
                            <button
                              onClick={() => toggleCard(id)}
                              className="w-7 h-7 rounded-lg bg-cardinal/10 border border-cardinal/20 flex items-center justify-center hover:bg-cardinal/20 transition-all"
                            >
                              <X className="w-3.5 h-3.5 text-cardinal" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-bold text-text-muted mb-3">উপলব্ধ কার্ড</p>
                <div className="space-y-2">
                  {ALL_CARDS.map((id) => {
                    const meta = HOMEPAGE_CARD_META[id];
                    const active = isCardActive(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleCard(id)}
                        disabled={active}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-primary/5 border-primary/20 opacity-60'
                            : 'bg-surface border hover:border-primary/30 hover:bg-surface-alt'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          active ? 'bg-primary/10' : 'bg-surface-alt border'
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            active ? 'bg-primary' : 'border-2 border-text-muted'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-text">{meta?.label || id}</p>
                          <p className="text-[10px] text-text-muted">{meta?.description || ''}</p>
                        </div>
                        {active && (
                          <span className="text-[9px] font-bold text-primary">সক্রিয়</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={resetToDefault}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border text-text-muted font-bold text-xs hover:bg-surface-alt transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  ডিফল্টে রিসেট করো
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
