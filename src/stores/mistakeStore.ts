import { create } from 'zustand';

interface MistakeState {
  mistakeCount: number;
  starBalance: number;
  refreshKey: number;
  updateMistakeCount: (count: number) => void;
  setStarBalance: (balance: number) => void;
  notifyUpdate: () => void;
}

export const useMistakeStore = create<MistakeState>((set) => ({
  mistakeCount: 0,
  starBalance: 0,
  refreshKey: 0,
  updateMistakeCount: (count: number) => set({ mistakeCount: count }),
  setStarBalance: (balance: number) => set({ starBalance: balance }),
  notifyUpdate: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
