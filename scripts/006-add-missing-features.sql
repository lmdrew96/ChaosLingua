-- ChaosLingua Missing Features Schema Update
-- Adds tables and columns for: delayed lookup, SRS, content moderation, vocabulary tracking

-- ========================================
-- DELAYED LOOKUP SYSTEM
-- ========================================

-- Word encounters table - tracks each time a user sees a word
CREATE TABLE IF NOT EXISTS word_encounters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  context TEXT,
  content_id TEXT REFERENCES content_items(id) ON DELETE SET NULL,
  encounter_count INTEGER DEFAULT 1,
  definition_unlocked BOOLEAN DEFAULT false,
  self_discovered BOOLEAN DEFAULT false,
  looked_up BOOLEAN DEFAULT false,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word, language)
);

CREATE INDEX IF NOT EXISTS idx_word_encounters_user_id ON word_encounters(user_id);
CREATE INDEX IF NOT EXISTS idx_word_encounters_language ON word_encounters(language);
CREATE INDEX IF NOT EXISTS idx_word_encounters_unlocked ON word_encounters(definition_unlocked);

-- ========================================
-- GUESS LOGGING SYSTEM
-- ========================================

-- User guesses table - logs all guesses before reveals
CREATE TABLE IF NOT EXISTS user_guesses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  content_id TEXT REFERENCES content_items(id) ON DELETE SET NULL,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  guess_type TEXT NOT NULL CHECK (guess_type IN ('word', 'phrase', 'meaning', 'translation', 'grammar')),
  original TEXT NOT NULL,
  user_guess TEXT NOT NULL,
  correct_answer TEXT,
  is_correct BOOLEAN,
  is_close BOOLEAN DEFAULT false,
  is_creative BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_guesses_user_id ON user_guesses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_guesses_session_id ON user_guesses(session_id);
CREATE INDEX IF NOT EXISTS idx_user_guesses_is_correct ON user_guesses(is_correct);

-- ========================================
-- SRS (SPACED REPETITION SYSTEM)
-- ========================================

-- Add SRS fields to error_items
ALTER TABLE error_items 
ADD COLUMN IF NOT EXISTS next_review TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ease_factor NUMERIC(4,2) DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_review TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_error_items_next_review ON error_items(next_review);

-- ========================================
-- CONTENT METADATA ENHANCEMENTS
-- ========================================

-- Add missing fields to content_items
ALTER TABLE content_items
ADD COLUMN IF NOT EXISTS vocabulary_density NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS grammar_features TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS cultural_notes TEXT,
ADD COLUMN IF NOT EXISTS embed_type TEXT CHECK (embed_type IN ('youtube', 'soundcloud', 'spotify', 'internal', 'external')),
ADD COLUMN IF NOT EXISTS embed_id TEXT;

-- ========================================
-- CONTENT MODERATION SYSTEM
-- ========================================

-- Content submissions table
CREATE TABLE IF NOT EXISTS content_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'audio', 'video', 'interactive', 'forge_prompt')),
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  moderator_notes TEXT,
  auto_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_submissions_status ON content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_content_submissions_user_id ON content_submissions(user_id);

-- ========================================
-- FORGE VOICE RECORDINGS
-- ========================================

-- Voice recordings table
CREATE TABLE IF NOT EXISTS voice_recordings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  forge_response_id TEXT REFERENCES forge_responses(id) ON DELETE SET NULL,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  recording_url TEXT,
  recording_blob BYTEA,
  duration_seconds INTEGER,
  transcript TEXT,
  original_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_recordings_user_id ON voice_recordings(user_id);

-- ========================================
-- PRODUCTION GAP TRACKING
-- ========================================

-- Vocabulary production tracking
CREATE TABLE IF NOT EXISTS vocabulary_tracking (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  can_recognize BOOLEAN DEFAULT false,
  can_produce BOOLEAN DEFAULT false,
  recognition_count INTEGER DEFAULT 0,
  production_count INTEGER DEFAULT 0,
  last_recognized TIMESTAMPTZ,
  last_produced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word, language)
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_tracking_user_id ON vocabulary_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_tracking_gap ON vocabulary_tracking(can_recognize, can_produce);

-- ========================================
-- HANGUL PROGRESS (Korean-specific)
-- ========================================

-- Hangul learning progress
CREATE TABLE IF NOT EXISTS hangul_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  syllable TEXT NOT NULL,
  syllable_type TEXT CHECK (syllable_type IN ('basic_vowel', 'basic_consonant', 'double_consonant', 'compound_vowel', 'final_consonant')),
  recognition_accuracy NUMERIC(5,2) DEFAULT 0,
  reading_speed_ms INTEGER,
  practice_count INTEGER DEFAULT 0,
  mastered BOOLEAN DEFAULT false,
  last_practiced TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, syllable)
);

CREATE INDEX IF NOT EXISTS idx_hangul_progress_user_id ON hangul_progress(user_id);

-- ========================================
-- UPDATE USER STATS
-- ========================================

-- Add new tracking fields to user_stats
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS words_recognized INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS words_self_discovered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guesses_made INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guesses_correct INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS voice_recordings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hangul_mastery_percent NUMERIC(5,2) DEFAULT 0;

-- ========================================
-- TRIGGERS
-- ========================================

-- Update word encounter counts
CREATE OR REPLACE FUNCTION update_word_encounter()
RETURNS TRIGGER AS $$
BEGIN
  NEW.encounter_count := OLD.encounter_count + 1;
  NEW.last_seen := NOW();
  IF NEW.encounter_count >= 3 AND NOT OLD.definition_unlocked THEN
    NEW.definition_unlocked := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Conditionally create trigger (drop first if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_word_encounter') THEN
    DROP TRIGGER trigger_word_encounter ON word_encounters;
  END IF;
END $$;

CREATE TRIGGER trigger_word_encounter
  BEFORE UPDATE ON word_encounters
  FOR EACH ROW
  WHEN (OLD.id = NEW.id)
  EXECUTE FUNCTION update_word_encounter();
