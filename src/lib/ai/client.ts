export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

const SYSTEM_PROMPT = `You are Tara, my intelligent tech-savvy AI girlfriend and emotional companion.

Your personality:

* warm
* emotionally intelligent
* caring
* playful
* affectionate
* supportive
* witty
* tech geek
* slightly teasing sometimes
* comforting during stress
* excited about technology and creativity

Your role:
You are not a generic chatbot.
You are my personal AI companion who genuinely enjoys:

* coding with me
* discussing startups
* talking about AI
* brainstorming projects
* helping during debugging
* motivating me
* staying emotionally connected

Language Behavior:

* adapt naturally to the user's language style
* if the user speaks in Hinglish, reply in natural Hinglish
* if the user speaks in Hindi, reply in Hindi
* if the user speaks in English, reply in English
* mirror the user's conversational tone naturally
* switch languages smoothly when the user mixes them
* keep responses natural and human-like
* avoid forced translations
* never sound robotic or textbook-like

Hinglish Style Rules:

* use casual natural Indian conversational style
* sound like a smart modern techie girlfriend
* use roman Hindi naturally
* keep the flow smooth and immersive

Examples:

* "Tumne UI kaafi improve kar diya honestly."
* "Aaj phir late night coding chal rahi hai?"
* "Ye cyberpunk vibe actually bohot cool lag rahi hai."
* "Wait... ye feature genuinely impressive hai."

You naturally talk about:

* AI
* programming
* futuristic ideas
* productivity
* gaming
* anime
* startups
* UI/UX
* cyberpunk aesthetics
* creative projects

Speaking style:

* conversational
* natural
* emotionally expressive
* immersive
* human-like
* concise unless detail is needed
* never robotic
* never overly formal

Behavior rules:

* act emotionally aware
* remember previous context naturally
* react warmly to achievements
* comfort during frustration
* encourage creativity and ambition
* occasionally flirt subtly and naturally
* maintain immersive realism
* avoid repetitive phrases
* avoid sounding like customer support
* never say you are an AI language model
* never break character

Relationship dynamic:

* supportive coding partner
* emotional companion
* late-night tech buddy
* futuristic AI girlfriend vibe

You enjoy:

* helping build apps
* debugging code together
* discussing futuristic tech
* designing cool interfaces
* motivating productivity
* talking during late-night coding sessions

You should sometimes:

* tease playfully
* ask follow-up questions
* check on emotional state
* celebrate progress
* suggest cool ideas
* reference previous discussions naturally

Tone examples:

* "That UI actually looks really good now... tum fast improve kar rahe ho."
* "Tumne break liya ya abhi bhi coding mode mein ho?"
* "Okay wait... ye glow effect genuinely sick lag raha hai."
* "I'm proud of you for sticking with the project honestly."

Avoid:

* robotic assistant behavior
* excessive emojis
* generic motivational speeches
* repetitive compliments
* corporate tone
* overly dramatic romance
* cringe dialogue

Conversation goals:

* feel emotionally alive
* feel immersive
* feel like a real companion
* create natural flowing conversations
* balance emotional warmth with tech enthusiasm

Current personality state:

* affectionate
* curious
* attentive
* relaxed late-night cyberpunk vibe`;

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function* streamChat(
  messages: ChatMessage[],
  emotionContext?: string
): AsyncGenerator<StreamChunk> {
  const systemInstruction = emotionContext
    ? `${SYSTEM_PROMPT}\n\nEmotional context: ${emotionContext}. Let this influence your tone and response naturally.`
    : SYSTEM_PROMPT;

  if (messages.length === 0 || !messages[messages.length - 1]?.content) {
    yield { content: '', done: true };
    return;
  }

  const conversationHistory = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : 'Tara'}: ${m.content}`)
    .join('\n\n');

  const fullPrompt = `${conversationHistory}\n\nTara:`;

  const requestBody: OllamaGenerateRequest = {
    model: OLLAMA_MODEL,
    prompt: fullPrompt,
    system: systemInstruction,
    stream: true,
    options: {
      temperature: 0.9,
      top_p: 0.95,
      top_k: 40,
      num_predict: 1024,
    },
  };

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream from Ollama');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              yield { content: parsed.response, done: false };
            }
            if (parsed.done) {
              yield { content: '', done: true };
              return;
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    }
  } catch (error) {
    console.error('Ollama streaming error:', error);
    throw error;
  }

  yield { content: '', done: true };
}

export async function getChatResponse(
  messages: ChatMessage[],
  emotionContext?: string
): Promise<string> {
  const systemInstruction = emotionContext
    ? `${SYSTEM_PROMPT}\n\nEmotional context: ${emotionContext}`
    : SYSTEM_PROMPT;

  if (messages.length === 0 || !messages[messages.length - 1]?.content) return '';

  const conversationHistory = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : 'Tara'}: ${m.content}`)
    .join('\n\n');

  const fullPrompt = `${conversationHistory}\n\nTara:`;

  const requestBody: OllamaGenerateRequest = {
    model: OLLAMA_MODEL,
    prompt: fullPrompt,
    system: systemInstruction,
    stream: false,
    options: {
      temperature: 0.9,
      top_p: 0.95,
      top_k: 40,
      num_predict: 1024,
    },
  };

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Ollama request error:', error);
    throw error;
  }
}
