import { createClient as createBrowserClient } from '@/utils/supabase/client';
import { Memory } from '@/types';

const USER_ID = 'default-user';

type MemoryRow = {
  id: string;
  user_id: string;
  content: string;
  type: Memory['type'];
  emotion: Memory['emotion'] | null;
  importance: number;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  role: string;
  content: string;
  emotion: string | null;
  created_at: string;
};

export type RecentMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  emotion?: string;
  createdAt: Date;
};

export const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
};

export async function saveMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: USER_ID,
        content: memory.content,
        type: memory.type,
        emotion: memory.emotion || null,
        importance: memory.importance,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      type: data.type,
      emotion: data.emotion as Memory['emotion'],
      importance: data.importance,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error saving memory:', error);
    return null;
  }
}

export async function getMemories(limit = 10): Promise<Memory[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return ((data || []) as MemoryRow[]).map((d) => ({
      id: d.id,
      userId: d.user_id,
      content: d.content,
      type: d.type,
      emotion: d.emotion as Memory['emotion'],
      importance: d.importance,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));
  } catch (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
}

export async function saveMessage(
  role: 'user' | 'assistant' | 'system',
  content: string,
  emotion?: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createBrowserClient();
    await supabase.from('messages').insert({
      user_id: USER_ID,
      role,
      content,
      emotion: emotion || null,
    });
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

export async function getRecentMessages(limit = 20): Promise<RecentMessage[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content, emotion, created_at')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return ((data || []) as MessageRow[]).reverse().map((d) => ({
      id: d.id,
      role: d.role as 'user' | 'assistant',
      content: d.content,
      emotion: d.emotion || undefined,
      createdAt: new Date(d.created_at),
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function extractMemoriesFromConversation(messages: Array<{ role: string; content: string }>): Promise<string[]> {
  return messages
    .filter((m) => m.role === 'user')
    .slice(-5)
    .map((m) => m.content);
}
