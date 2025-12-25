-- ChaosLingua Database Schema
-- Creates all tables for the language learning app

-- Users table (custom auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions for auth
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_language TEXT DEFAULT 'ro' CHECK (primary_language IN ('ro', 'ko')),
  languages TEXT[] DEFAULT ARRAY['ro', 'ko'],
  levels JSONB DEFAULT '{"ro": 1, "ko": 1}'::jsonb,
  chaos_setting TEXT DEFAULT 'guided-random' CHECK (chaos_setting IN ('full-random', 'guided-random', 'curated')),
  fog_level INTEGER DEFAULT 70 CHECK (fog_level >= 0 AND fog_level <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats
CREATE TABLE IF NOT EXISTS user_stats (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  chaos_sessions INTEGER DEFAULT 0,
  errors_harvested INTEGER DEFAULT 0,
  mysteries_resolved INTEGER DEFAULT 0,
  time_in_fog NUMERIC(10, 2) DEFAULT 0,
  words_forged INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT true,
  auto_advance BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  session_reminders BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content items (your learning materials)
CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL CHECK (type IN ('text', 'audio', 'video', 'interactive', 'forge_prompt')),
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 10),
  length_minutes INTEGER DEFAULT 5,
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  source_url TEXT,
  transcript TEXT,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error items (the error garden)
CREATE TABLE IF NOT EXISTS error_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vocabulary', 'comprehension', 'grammar', 'production', 'beautiful_failure')),
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  original TEXT NOT NULL,
  user_guess TEXT,
  correct TEXT NOT NULL,
  context TEXT,
  occurrences INTEGER DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mystery items (the fog machine mysteries)
CREATE TABLE IF NOT EXISTS mystery_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  phrase TEXT NOT NULL,
  context TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_meaning TEXT,
  encounters INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (learning sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chaos-window', 'playlist-roulette', 'grammar-spiral', 'fog-session', 'forge-mode', 'error-garden', 'mystery-shelf')),
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  duration INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  reflection TEXT,
  mood TEXT CHECK (mood IN ('energizing', 'neutral', 'draining'))
);

-- Forge prompts (writing/speaking prompts)
CREATE TABLE IF NOT EXISTS forge_prompts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL CHECK (type IN ('quick_fire', 'shadow_speak', 'writing_sprint', 'translation', 'conversation')),
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  text TEXT NOT NULL,
  difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forge responses (user's forge session outputs)
CREATE TABLE IF NOT EXISTS forge_responses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  prompt_id TEXT REFERENCES forge_prompts(id) ON DELETE SET NULL,
  response_text TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  self_corrections INTEGER DEFAULT 0,
  errors_identified INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_error_items_user_id ON error_items(user_id);
CREATE INDEX IF NOT EXISTS idx_error_items_language ON error_items(language);
CREATE INDEX IF NOT EXISTS idx_mystery_items_user_id ON mystery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_mystery_items_resolved ON mystery_items(resolved);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_content_items_language ON content_items(language);
CREATE INDEX IF NOT EXISTS idx_forge_responses_user_id ON forge_responses(user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
