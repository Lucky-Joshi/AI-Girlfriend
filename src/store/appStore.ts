import { create } from 'zustand';

interface AppState {
  isLoaded: boolean;
  isStreaming: boolean;
  breathingPhase: number;
  isBlinking: boolean;
  headTilt: number;
  talkingPulse: number;
  showGreeting: boolean;
  setLoaded: (loaded: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setBreathingPhase: (phase: number) => void;
  setBlinking: (blinking: boolean) => void;
  setHeadTilt: (tilt: number) => void;
  setTalkingPulse: (pulse: number) => void;
  setShowGreeting: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoaded: false,
  isStreaming: false,
  breathingPhase: 0,
  isBlinking: false,
  headTilt: 0,
  talkingPulse: 0,
  showGreeting: true,

  setLoaded: (isLoaded: boolean) => set({ isLoaded }),
  setStreaming: (isStreaming: boolean) => set({ isStreaming }),
  setBreathingPhase: (breathingPhase: number) => set({ breathingPhase }),
  setBlinking: (isBlinking: boolean) => set({ isBlinking }),
  setHeadTilt: (headTilt: number) => set({ headTilt }),
  setTalkingPulse: (talkingPulse: number) => set({ talkingPulse }),
  setShowGreeting: (showGreeting: boolean) => set({ showGreeting }),
}));
