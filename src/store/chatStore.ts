import { create } from 'zustand';
import { ChatState, Message } from '@/types';

interface ChatStore extends ChatState {
  addMessage: (message: Message) => void;
  setStreaming: (streaming: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateStreamingContent: (content: string) => void;
  setError: (error?: string) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  isStreaming: false,
  currentStreamingMessage: '',
  error: undefined,

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setStreaming: (isStreaming: boolean) =>
    set({ isStreaming }),

  setLoading: (isLoading: boolean) =>
    set({ isLoading }),

  updateStreamingContent: (content: string) =>
    set({ currentStreamingMessage: content }),

  setError: (error?: string) =>
    set({ error }),

  clearMessages: () =>
    set({ messages: [], currentStreamingMessage: '', error: undefined }),

  setMessages: (messages: Message[]) =>
    set({ messages }),
}));
