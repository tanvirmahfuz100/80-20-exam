import { create } from 'zustand';
import { readStorage, writeStorage } from '../utils/storage';
import type { HomepageCardId, HomepageLayout } from '../types/homepage';
import { DEFAULT_SEGMENTS } from '../types/homepage';

const STORAGE_KEY = 'exam_homepage_layout';

function loadLayout(): HomepageLayout {
  const stored = readStorage<HomepageLayout | null>(STORAGE_KEY, null);
  if (stored && Array.isArray(stored.segments) && stored.segments.length > 0) {
    return stored;
  }
  return { segments: [...DEFAULT_SEGMENTS] };
}

function persistLayout(layout: HomepageLayout) {
  writeStorage(STORAGE_KEY, layout);
}

interface HomepageStore {
  segments: HomepageCardId[];
  isCardActive: (id: HomepageCardId) => boolean;
  addCard: (id: HomepageCardId) => void;
  removeCard: (id: HomepageCardId) => void;
  toggleCard: (id: HomepageCardId) => void;
  moveCard: (fromIndex: number, toIndex: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  resetToDefault: () => void;
}

export const useHomepageStore = create<HomepageStore>((set, get) => {
  const initial = loadLayout();

  return {
    segments: initial.segments,

    isCardActive: (id) => get().segments.includes(id),

    addCard: (id) => {
      set((state) => {
        if (state.segments.includes(id)) return state;
        const newSegments = [...state.segments, id];
        persistLayout({ segments: newSegments });
        return { segments: newSegments };
      });
    },

    removeCard: (id) => {
      set((state) => {
        const newSegments = state.segments.filter(s => s !== id);
        persistLayout({ segments: newSegments });
        return { segments: newSegments };
      });
    },

    toggleCard: (id) => {
      const { segments } = get();
      if (segments.includes(id)) {
        get().removeCard(id);
      } else {
        get().addCard(id);
      }
    },

    moveCard: (fromIndex, toIndex) => {
      set((state) => {
        if (
          fromIndex < 0 || fromIndex >= state.segments.length ||
          toIndex < 0 || toIndex >= state.segments.length ||
          fromIndex === toIndex
        ) return state;
        const newSegments = [...state.segments];
        const [moved] = newSegments.splice(fromIndex, 1);
        newSegments.splice(toIndex, 0, moved);
        persistLayout({ segments: newSegments });
        return { segments: newSegments };
      });
    },

    moveUp: (index) => {
      if (index > 0) get().moveCard(index, index - 1);
    },

    moveDown: (index) => {
      if (index < get().segments.length - 1) get().moveCard(index, index + 1);
    },

    resetToDefault: () => {
      const segments = [...DEFAULT_SEGMENTS];
      persistLayout({ segments });
      set({ segments });
    },
  };
});
