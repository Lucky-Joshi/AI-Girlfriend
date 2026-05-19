import { create } from 'zustand';
import { VoiceState } from '@/types';

interface VoiceStore extends VoiceState {
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setTranscript: (transcript: string) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  isListening: false,
  isSpeaking: false,
  transcript: '',
  error: undefined,

  setListening: (isListening: boolean) => set({ isListening }),
  setSpeaking: (isSpeaking: boolean) => set({ isSpeaking }),
  setTranscript: (transcript: string) => set({ transcript }),
  setError: (error?: string) => set({ error }),
  reset: () => set({ isListening: false, isSpeaking: false, transcript: '', error: undefined }),
}));
