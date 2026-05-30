import React, { useState } from 'react';
import { Gem, Flame, Zap, Clock, ShoppingBag, Snowflake, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const shopItems = [
  {
    id: 'streak_freeze',
    name: 'স্ট্রিক ফ্রিজ',
    description: 'তোমার স্ট্রিক বাঁচাও! একটা দিন মিস করলেও স্ট্রিক থাকবে।',
    price: 200,
    icon: Snowflake,
    color: 'text-blue-500',
    bg: 'bg-surface',
    border: 'border',
  },
  {
    id: 'streak_repair',
    name: 'স্ট্রিক রিপেয়ার',
    description: 'হারানো স্ট্রিক ফিরিয়ে আনো!',
    price: 500,
    icon: Heart,
    color: 'text-cardinal',
    bg: 'bg-surface',
    border: 'border',
  },
  {
    id: 'xp_boost_15',
    name: '২x এক্সপি বুস্ট',
    description: '১৫ মিনিটের জন্য দ্বিগুণ এক্সপি পাও!',
    price: 100,
    icon: Zap,
    color: 'text-bee',
    bg: 'bg-surface',
    border: 'border',
    duration: '১৫ মিনিট',
  },
  {
    id: 'xp_boost_30',
    name: '২x এক্সপি বুস্ট',
    description: '৩০ মিনিটের জন্য দ্বিগুণ এক্সপি পাও!',
    price: 200,
    icon: Zap,
    color: 'text-bee',
    bg: 'bg-surface',
    border: 'border',
    duration: '৩০ মিনিট',
  },
  {
    id: 'timer_freeze',
    name: 'টাইমার ফ্রিজ',
    description: 'টাইমড কুইজে সময় থমকে দাও!',
    price: 150,
    icon: Clock,
    color: 'text-macaw',
    bg: 'bg-surface',
    border: 'border',
  },
];

export default function Shop() {
  const { profile, updateProfileFields } = useAuth();
  const [purchasing, setPurchasing] = useState(null as string | null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const gems = profile?.gems || 0;

  const getDurationMinutes = (id: string) => {
    if (id === 'xp_boost_15') return 15;
    if (id === 'xp_boost_30') return 30;
    return null;
  };

  const handlePurchase = async (item: typeof shopItems[0]) => {
    if (gems < item.price || purchasing) return;
    setPurchasing(item.id);

    const activeItems = profile?.active_items || [];
    const expiresAt = new Date(Date.now() + (getDurationMinutes(item.id) || 24 * 60) * 60 * 1000).toISOString();

    if (item.id === 'streak_freeze' || item.id === 'streak_repair' || item.id === 'timer_freeze') {
      activeItems.push({ itemId: item.id, expiresAt });
    } else if (item.id.startsWith('xp_boost')) {
      const existing = activeItems.find(i => i.itemId.startsWith('xp_boost'));
      if (existing) existing.expiresAt = expiresAt;
      else activeItems.push({ itemId: item.id, expiresAt });
    }

    await updateProfileFields({
      gems: gems - item.price,
      active_items: activeItems,
    } as any);

    setPurchased(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setPurchased(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      setPurchasing(null);
    }, 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-surface border rounded-full px-4 py-2 mb-3">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm text-text">শপ</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Gem className="w-6 h-6 text-cyan-500" />
          <span className="text-2xl font-black text-text">{gems.toLocaleString()}</span>
          <span className="text-sm text-text-muted font-medium">জেমস</span>
        </div>
      </div>

      <div className="space-y-3">
        {shopItems.map((item) => (
          <div key={item.id} className={`${item.bg} ${item.border} border rounded-2xl p-4 transition-all`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${item.bg} border ${item.border} rounded-xl flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-text">{item.name}</h3>
                <p className="text-xs text-text-muted font-medium mt-0.5">{item.description}</p>
                {item.duration && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-macaw bg-macaw/10 px-2 py-0.5 rounded-full">
                    {item.duration}
                  </span>
                )}
              </div>
              <button
                onClick={() => handlePurchase(item)}
                disabled={gems < item.price || purchasing !== null}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all
                  ${gems < item.price
                    ? 'bg-wolf/50 text-text-muted cursor-not-allowed'
                    : purchased.has(item.id)
                      ? 'bg-emerald-500 text-white'
                      : purchasing === item.id
                        ? 'bg-primary text-white scale-95'
                        : 'bg-primary text-white hover:bg-primary-hover active:scale-95'
                  }`}
              >
                {purchased.has(item.id) ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> ক্রয় হয়েছে</>
                ) : purchasing === item.id ? (
                  'ক্রয় হচ্ছে...'
                ) : (
                  <><Gem className="w-3.5 h-3.5" />{item.price}</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
