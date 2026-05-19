import { create } from 'zustand';
import { Memory } from '@/types';

interface MemoryStore {
  memories: Memory[];
  isLoading: boolean;
  addMemory: (memory: Memory) => void;
  setMemories: (memories: Memory[]) => void;
  setLoading: (loading: boolean) => void;
  clearMemories: () => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  memories: [],
  isLoading: false,

  addMemory: (memory: Memory) =>
    set((state) => ({
      memories: [...state.memories, memory],
    })),

  setMemories: (memories: Memory[]) => set({ memories }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  clearMemories: () => set({ memories: [] }),
}));
