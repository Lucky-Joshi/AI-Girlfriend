export type EmotionType = 'happiness' | 'affection' | 'comfort' | 'sadness' | 'excitement' | 'neutral' | 'love' | 'curiosity' | 'shy' | 'playful';

export interface EmotionState {
  happiness: number;
  affection: number;
  comfort: number;
  sadness: number;
  excitement: number;
  dominant: EmotionType;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotion?: EmotionType;
  isStreaming?: boolean;
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  type: 'conversation' | 'semantic' | 'emotional' | 'preference';
  emotion?: EmotionType;
  importance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipLevel {
  level: number;
  title: string;
  progress: number;
  maxProgress: number;
}

export interface AvatarState {
  expression: EmotionType;
  isSpeaking: boolean;
  isBlinking: boolean;
  breathingPhase: number;
  headTilt: number;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  currentStreamingMessage: string;
  error?: string;
}

export interface CompanionSettings {
  name: string;
  personality: string;
  voiceEnabled: boolean;
  avatarEnabled: boolean;
  memoryEnabled: boolean;
}
