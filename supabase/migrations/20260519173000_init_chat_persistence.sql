-- AI Girlfriend Supabase Schema

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  emotion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('conversation', 'semantic', 'emotional', 'preference')),
  emotion TEXT,
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotional states table
CREATE TABLE IF NOT EXISTS emotional_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
  affection INTEGER DEFAULT 30 CHECK (affection >= 0 AND affection <= 100),
  comfort INTEGER DEFAULT 60 CHECK (comfort >= 0 AND comfort <= 100),
  sadness INTEGER DEFAULT 0 CHECK (sadness >= 0 AND sadness <= 100),
  excitement INTEGER DEFAULT 20 CHECK (excitement >= 0 AND excitement <= 100),
  dominant_emotion TEXT DEFAULT 'neutral',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_emotional_states_user_id ON emotional_states(user_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE messages TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE memories TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE emotional_states TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE relationships TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can view their own messages'
  ) THEN
    CREATE POLICY "Users can view their own messages"
      ON messages FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can delete their own messages'
  ) THEN
    CREATE POLICY "Users can delete their own messages"
      ON messages FOR DELETE
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can insert their own messages'
  ) THEN
    CREATE POLICY "Users can insert their own messages"
      ON messages FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'memories' AND policyname = 'Users can view their own memories'
  ) THEN
    CREATE POLICY "Users can view their own memories"
      ON memories FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'memories' AND policyname = 'Users can insert their own memories'
  ) THEN
    CREATE POLICY "Users can insert their own memories"
      ON memories FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'emotional_states' AND policyname = 'Users can view their own emotional states'
  ) THEN
    CREATE POLICY "Users can view their own emotional states"
      ON emotional_states FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'emotional_states' AND policyname = 'Users can insert their own emotional states'
  ) THEN
    CREATE POLICY "Users can insert their own emotional states"
      ON emotional_states FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'relationships' AND policyname = 'Users can view their own relationship'
  ) THEN
    CREATE POLICY "Users can view their own relationship"
      ON relationships FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'relationships' AND policyname = 'Users can insert their own relationship'
  ) THEN
    CREATE POLICY "Users can insert their own relationship"
      ON relationships FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
