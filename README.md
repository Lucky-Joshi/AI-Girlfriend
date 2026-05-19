# Tara - AI Anime Companion

An immersive, emotionally intelligent AI anime companion experience built with Next.js 15.

## Features

- **Cinematic UI** - Cyberpunk anime aesthetic with neon glows, rain effects, and floating particles
- **Emotional Intelligence** - Tara tracks and responds to emotions dynamically
- **Streaming Chat** - Real-time streaming responses from NVIDIA AI
- **Voice Interaction** - Browser-based speech recognition and synthesis
- **Relationship Progression** - Tara grows closer to you over time
- **Animated Avatar** - Breathing, blinking, and talking pulse animations
- **Startup Sequence** - Immersive greeting animation on load

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand (state management)
- Supabase (memory/persistence)
- Gemini 2.5 Flash (AI backend)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Add your API keys to `.env.local`:
- `GEMINI_API_KEY` - Get from https://aistudio.google.com/apikey
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional, for memory features

4. Run the development server:
```bash
npm run dev
```

## Supabase Setup

If you want persistent memory, run the SQL in `supabase/schema.sql` on your Supabase database.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/                # API routes (chat, emotion, memory)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── tara/               # Tara avatar component
│   ├── chat/               # Chat interface components
│   ├── ui/                 # UI components (topbar, sidebar, effects)
│   └── voice/              # Voice controls
├── hooks/                  # Custom React hooks
├── lib/
│   ├── ai/                 # NVIDIA API client
│   ├── emotion/            # Emotion analysis engine
│   ├── memory/             # Supabase memory utilities
│   └── voice/              # Speech recognition/synthesis
├── store/                  # Zustand stores
└── types/                  # TypeScript types
```
