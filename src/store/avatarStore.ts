import { create } from 'zustand';
import { AvatarState, EmotionType } from '@/types';

interface AvatarStore extends AvatarState {
  setExpression: (expression: EmotionType) => void;
  setSpeaking: (speaking: boolean) => void;
  setBlinking: (blinking: boolean) => void;
  setBreathingPhase: (phase: number) => void;
  setHeadTilt: (tilt: number) => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  expression: 'neutral',
  isSpeaking: false,
  isBlinking: false,
  breathingPhase: 0,
  headTilt: 0,

  setExpression: (expression: EmotionType) => set({ expression }),
  setSpeaking: (isSpeaking: boolean) => set({ isSpeaking }),
  setBlinking: (isBlinking: boolean) => set({ isBlinking }),
  setBreathingPhase: (breathingPhase: number) => set({ breathingPhase }),
  setHeadTilt: (headTilt: number) => set({ headTilt }),
}));
