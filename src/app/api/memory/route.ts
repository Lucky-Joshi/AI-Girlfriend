import { Memory } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

type MemoryRequestBody = {
  content?: string;
  type?: Memory['type'];
  emotion?: Memory['emotion'];
  importance?: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return Response.json({ memories: [] });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/memories?user_id=eq.${USER_ID}&order=created_at.desc&limit=${limit}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error('Failed to fetch memories');

    const data = await res.json() as MemoryRow[];

    const memories = (data || []).map((d) => ({
      id: d.id,
      userId: d.user_id,
      content: d.content,
      type: d.type,
      emotion: d.emotion as Memory['emotion'],
      importance: d.importance,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));

    return Response.json({ memories });
  } catch (error) {
    console.error('Memory API error:', error);
    return Response.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as MemoryRequestBody;
    const { content, type, emotion, importance } = body;

    if (!content || !type) {
      return Response.json({ error: 'Content and type are required' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: USER_ID,
        content,
        type,
        emotion: emotion || null,
        importance: importance || 5,
      }),
    });

    if (!res.ok) throw new Error('Failed to save memory');

    const data = await res.json() as MemoryRow[];
    const memory: Memory = {
      id: data[0].id,
      userId: data[0].user_id,
      content: data[0].content,
      type: data[0].type,
      emotion: data[0].emotion as Memory['emotion'],
      importance: data[0].importance,
      createdAt: new Date(data[0].created_at),
      updatedAt: new Date(data[0].updated_at),
    };

    return Response.json({ memory }, { status: 201 });
  } catch (error) {
    console.error('Memory API error:', error);
    return Response.json({ error: 'Failed to save memory' }, { status: 500 });
  }
}
