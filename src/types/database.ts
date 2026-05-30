export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          emotion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          emotion?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          emotion?: string | null;
          created_at?: string;
        };
      };
      memories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type: 'conversation' | 'semantic' | 'emotional' | 'preference';
          emotion: string | null;
          importance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          type: 'conversation' | 'semantic' | 'emotional' | 'preference';
          emotion?: string | null;
          importance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          type?: 'conversation' | 'semantic' | 'emotional' | 'preference';
          emotion?: string | null;
          importance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      emotional_states: {
        Row: {
          id: string;
          user_id: string;
          happiness: number;
          affection: number;
          comfort: number;
          sadness: number;
          excitement: number;
          dominant_emotion: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          happiness: number;
          affection: number;
          comfort: number;
          sadness: number;
          excitement: number;
          dominant_emotion: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          happiness?: number;
          affection?: number;
          comfort?: number;
          sadness?: number;
          excitement?: number;
          dominant_emotion?: string;
          created_at?: string;
        };
      };
      relationships: {
        Row: {
          id: string;
          user_id: string;
          level: number;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level?: number;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          level?: number;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
