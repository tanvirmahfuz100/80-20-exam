import { create } from 'zustand';
import { readStorage, writeStorage } from '../utils/storage';

const STORAGE_KEY = 'exam_sound_settings';

export interface SoundSetting {
  enabled: boolean;
  volume: number;
}

export interface SoundPack {
  id: string;
  name: string;
  description: string;
  sounds: Record<string, SoundSetting>;
}

const DEFAULT_SOUNDS: Record<string, SoundSetting> = {
  correctAnswer: { enabled: true, volume: 80 },
  wrongAnswer: { enabled: true, volume: 80 },
  pageChange: { enabled: true, volume: 60 },
  click: { enabled: true, volume: 50 },
  star: { enabled: true, volume: 80 },
  levelUp: { enabled: true, volume: 100 },
  bonus: { enabled: true, volume: 90 },
  notification: { enabled: true, volume: 70 },
  rank: { enabled: true, volume: 90 },
  time: { enabled: true, volume: 70 },
};

const SOUND_PACKS: SoundPack[] = [
  {
    id: 'default',
    name: 'ডিফল্ট',
    description: 'স্ট্যান্ডার্ড সাউন্ড প্যাক',
    sounds: { ...DEFAULT_SOUNDS },
  },
  {
    id: 'soft',
    name: 'সফট',
    description: 'নরম ও শান্ত সাউন্ড',
    sounds: Object.fromEntries(
      Object.entries(DEFAULT_SOUNDS).map(([k, v]) => [
        k,
        { ...v, volume: Math.round(v.volume * 0.6) },
      ])
    ),
  },
];

interface SoundStoreState {
  globalMute: boolean;
  activePackId: string;
  overrides: Record<string, SoundSetting>;
}

interface SoundStoreActions {
  getSetting: (soundKey: string) => SoundSetting;
  setGlobalMute: (muted: boolean) => void;
  toggleGlobalMute: () => void;
  setActivePack: (packId: string) => void;
  setSoundEnabled: (soundKey: string, enabled: boolean) => void;
  setSoundVolume: (soundKey: string, volume: number) => void;
  resetSound: (soundKey: string) => void;
  resetAllToPack: () => void;
  getPacks: () => SoundPack[];
}

function loadState() {
  const stored = readStorage<{ globalMute: boolean; activePackId: string; overrides: Record<string, SoundSetting> } | null>(STORAGE_KEY, null);
  if (stored) {
    return {
      globalMute: stored.globalMute ?? false,
      activePackId: stored.activePackId ?? 'default',
      overrides: stored.overrides ?? {},
    };
  }
  return { globalMute: false, activePackId: 'default', overrides: {} };
}

function persistState(state: SoundStoreState) {
  writeStorage(STORAGE_KEY, {
    globalMute: state.globalMute,
    activePackId: state.activePackId,
    overrides: state.overrides,
  });
}

function resolveSetting(state: SoundStoreState, soundKey: string): SoundSetting {
  const pack = SOUND_PACKS.find((p) => p.id === state.activePackId);
  const defaultSetting = pack?.sounds[soundKey] ?? DEFAULT_SOUNDS[soundKey] ?? { enabled: true, volume: 80 };
  const override = state.overrides[soundKey];
  if (override) {
    return {
      enabled: override.enabled ?? defaultSetting.enabled,
      volume: override.volume ?? defaultSetting.volume,
    };
  }
  return defaultSetting;
}

export const PACK_SOUND_KEYS = ['correctAnswer', 'wrongAnswer', 'pageChange', 'click'] as const;

export const SOUND_DISPLAY_NAMES: Record<string, string> = {
  correctAnswer: 'সঠিক উত্তর',
  wrongAnswer: 'ভুল উত্তর',
  pageChange: 'পৃষ্ঠা পরিবর্তন',
  click: 'ক্লিক',
  star: 'স্টার',
  levelUp: 'লেভেল আপ',
  bonus: 'বোনাস',
  notification: 'নোটিফিকেশন',
  rank: 'র‌্যাঙ্ক',
  time: 'টাইম',
};

export const useSoundStore = create<SoundStoreState & SoundStoreActions>((set, get) => ({
  ...loadState(),

  getSetting: (soundKey: string) => resolveSetting(get(), soundKey),

  setGlobalMute: (muted: boolean) => {
    set({ globalMute: muted });
    persistState(get());
  },

  toggleGlobalMute: () => {
    set((s) => ({ globalMute: !s.globalMute }));
    persistState(get());
  },

  setActivePack: (packId: string) => {
    const pack = SOUND_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    set({ activePackId: packId, overrides: {} });
    persistState(get());
  },

  setSoundEnabled: (soundKey: string, enabled: boolean) => {
    const current = resolveSetting(get(), soundKey);
    set((s) => ({
      overrides: { ...s.overrides, [soundKey]: { ...current, enabled } },
    }));
    persistState(get());
  },

  setSoundVolume: (soundKey: string, volume: number) => {
    const clamped = Math.max(0, Math.min(100, volume));
    const current = resolveSetting(get(), soundKey);
    set((s) => ({
      overrides: { ...s.overrides, [soundKey]: { ...current, volume: clamped } },
    }));
    persistState(get());
  },

  resetSound: (soundKey: string) => {
    set((s) => {
      const { [soundKey]: _, ...rest } = s.overrides;
      return { overrides: rest };
    });
    persistState(get());
  },

  resetAllToPack: () => {
    set({ overrides: {} });
    persistState(get());
  },

  getPacks: () => SOUND_PACKS,
}));
