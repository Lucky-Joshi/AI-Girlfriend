import { create } from 'zustand';
import { EmotionState, EmotionType } from '@/types';

interface EmotionStore extends EmotionState {
  setEmotion: (emotion: EmotionType, value: number) => void;
  updateEmotions: (emotions: Partial<Omit<EmotionState, 'dominant'>>) => void;
  setDominantEmotion: (emotion: EmotionType) => void;
  decayEmotions: () => void;
  resetEmotions: () => void;
}

const defaultEmotions: EmotionState = {
  happiness: 50,
  affection: 30,
  comfort: 60,
  sadness: 0,
  excitement: 20,
  dominant: 'neutral',
};

export const useEmotionStore = create<EmotionStore>((set, get) => ({
  ...defaultEmotions,

  setEmotion: (emotion: EmotionType, value: number) =>
    set((state) => {
      const clampedValue = Math.max(0, Math.min(100, value));
      const newState = { ...state, [emotion]: clampedValue };
      newState.dominant = calculateDominant(newState);
      return newState;
    }),

  updateEmotions: (emotions: Partial<Omit<EmotionState, 'dominant'>>) =>
    set((state) => {
      const newState = { ...state };
      for (const [key, value] of Object.entries(emotions)) {
        if (key in newState && typeof value === 'number') {
          (newState as any)[key] = Math.max(0, Math.min(100, value));
        }
      }
      newState.dominant = calculateDominant(newState);
      return newState;
    }),

  setDominantEmotion: (emotion: EmotionType) =>
    set({ dominant: emotion }),

  decayEmotions: () =>
    set((state) => {
      const decayRate = 0.02;
      const newState = { ...state };
      for (const key of ['happiness', 'affection', 'comfort', 'sadness', 'excitement'] as const) {
        const target = key === 'comfort' ? 50 : key === 'sadness' ? 0 : 40;
        newState[key] = state[key] + (target - state[key]) * decayRate;
      }
      newState.dominant = calculateDominant(newState);
      return newState;
    }),

  resetEmotions: () => set(defaultEmotions),
}));

function calculateDominant(state: EmotionState): EmotionType {
  const emotions = ['happiness', 'affection', 'comfort', 'sadness', 'excitement'] as const;
  let max = 0;
  let dominant: EmotionType = 'neutral';

  for (const emotion of emotions) {
    if (state[emotion] > max) {
      max = state[emotion];
      dominant = emotion;
    }
  }

  if (max < 30) return 'neutral';
  return dominant;
}
