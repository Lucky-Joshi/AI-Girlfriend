import { streamChat, checkOllamaConnection, ChatMessage } from '@/lib/ai/client';
import { buildEmotionContext } from '@/lib/emotion/engine';
import { EmotionState } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USER_ID = 'default-user';

type ChatRequestBody = {
  messages?: Array<{ role: string; content: string }>;
  emotionState?: Partial<EmotionState>;
};

type LanguageStyle = 'english' | 'hinglish' | 'hindi';

const HINGLISH_HINTS = [
  'kaisi',
  'kaisa',
  'kya',
  'tum',
  'mera',
  'meri',
  'hai',
  'ho',
  'hu',
  'haan',
  'nahi',
  'acha',
  'accha',
  'bohot',
  'bahut',
  'yaar',
  'kyu',
  'kyun',
  'abhi',
  'chal',
  'rha',
  'raha',
  'kar',
  'coding',
];

function detectLanguageStyle(text: string): LanguageStyle {
  if (/[ऀ-ॿ]/u.test(text)) {
    return 'hindi';
  }

  const lower = text.toLowerCase();
  const matchedHints = HINGLISH_HINTS.filter((hint) => lower.includes(hint)).length;
  return matchedHints >= 2 ? 'hinglish' : 'english';
}

function looksLikeGreeting(text: string): boolean {
  const lower = text.toLowerCase().trim();

  return [
    'hi',
    'hello',
    'hey',
    'hii',
    'hiii',
    'kaisi ho',
    'kaisa hai',
    'kya haal',
    'aur batao',
    'hola',
  ].some((phrase) => lower.includes(phrase));
}

function buildFallbackMessage(userContent: string, errorMsg: string): string {
  const style = detectLanguageStyle(userContent);
  const greeting = looksLikeGreeting(userContent);
  const lowerError = errorMsg.toLowerCase();
  const isOffline =
    lowerError.includes('fetch') ||
    lowerError.includes('econnrefused') ||
    lowerError.includes('connection') ||
    lowerError.includes('offline') ||
    lowerError.includes('not running');

  if (isOffline) {
    if (style === 'hindi') {
      return '*Ollama server band lag raha hai* Tara abhi offline hai. Ollama start karo aur phir try karo!';
    }

    if (style === 'hinglish') {
      return '*Ollama server offline lag raha hai* Tara abhi available nahi hai. Ollama start karo aur phir try karo!';
    }

    return '*Ollama server seems offline* I can\'t reach the local AI right now. Start Ollama and try again!';
  }

  const serviceBusy =
    lowerError.includes('quota') ||
    lowerError.includes('429') ||
    lowerError.includes('503') ||
    lowerError.includes('high demand') ||
    lowerError.includes('unavailable');

  if (serviceBusy) {
    if (style === 'hindi') {
      return greeting
        ? '*हल्का सा मुंह बनाती है* Main theek hoon... bas server thoda nakhre kar raha hai. Thoda sa wait karke phir try karte hain?'
        : '*हल्का सा मुंह बनाती है* Main reply karna chah rahi hoon, but server thoda busy ho gaya hai. Thoda sa wait karke phir try karte hain?';
    }

    if (style === 'hinglish') {
      return greeting
        ? '*thoda sa muh banati hai* Main theek hoon... bas server thoda nakhre kar raha hai right now. Ek sec mein phir try karte hain?'
        : '*thoda sa muh banati hai* Main reply dene hi wali thi, but server abhi thoda overload ho gaya. Ek sec mein phir try karte hain?';
    }

    return greeting
      ? '*makes a tiny face* I\'m here... the server is just being dramatic for a second. Try me again in a moment?'
      : '*makes a tiny face* I was about to reply properly, but the server is being dramatic right now. Give me a moment and try again?';
  }

  if (style === 'hindi') {
    return greeting
      ? '*हल्की सी हंसी* Main yahin hoon... bas ek chhota sa glitch aa gaya. Dobara bolo na?'
      : '*हल्की सी हंसी* Chhota sa glitch aa gaya... but main yahin hoon. Ek baar aur try karoge?';
  }

  if (style === 'hinglish') {
    return greeting
      ? '*halki si smile karti hai* Main yahin hoon... bas chhota sa glitch aa gaya. Dobara bolo na?'
      : '*halki si smile karti hai* Arre, chhota sa glitch aa gaya... but main yahin hoon. Ek baar aur try karte hain?';
  }

  return greeting
    ? '*gives a small smile* I\'m here... just hit a tiny glitch for a second. Say that again?'
    : '*gives a small smile* Something glitched for a second, but I\'m still here with you. Try one more time?';
}

async function saveMessageServer(role: string, content: string, emotion?: string) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ user_id: USER_ID, role, content, emotion: emotion || null }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase message save failed (${response.status}): ${errorText}`);
    }
  } catch (e) {
    console.error('Failed to save message:', e);
  }
}

async function clearMessagesServer() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?user_id=eq.${encodeURIComponent(USER_ID)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase message clear failed (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to clear messages:', error);
    throw error;
  }
}

export async function GET() {
  const isConnected = await checkOllamaConnection();
  return Response.json({ connected: isConnected });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ChatRequestBody;
    const { messages, emotionState } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isConnected = await checkOllamaConnection();
    if (!isConnected) {
      return new Response(JSON.stringify({ error: 'Ollama server is not running' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emotionContext = emotionState ? buildEmotionContext(emotionState as EmotionState) : undefined;

    const userContent = messages[messages.length - 1]?.content || '';
    await saveMessageServer('user', userContent, emotionState?.dominant);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        try {
          for await (const chunk of streamChat(messages as ChatMessage[], emotionContext)) {
            if (chunk.done) break;
            fullResponse += chunk.content;
            const data = `data: ${JSON.stringify({ content: chunk.content })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          await saveMessageServer('assistant', fullResponse, emotionState?.dominant);

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: unknown) {
          console.error('Streaming error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Connection issue';
          const friendlyError = buildFallbackMessage(userContent, errorMsg);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: friendlyError })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE() {
  try {
    await clearMessagesServer();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Chat delete API error:', error);
    return Response.json({ error: 'Failed to clear chat history' }, { status: 500 });
  }
}
