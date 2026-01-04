-- 011: Add AI Grading System
-- Tables for grammar rules, pronunciation, forge submissions, grading results, and proficiency patterns

-- ========================================
-- GRAMMAR RULES DATABASE
-- ========================================

-- Grammar rules from linguistic resources (Multext-East, GF-RGL, Korpora, KLI)
CREATE TABLE IF NOT EXISTS grammar_rules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  category TEXT NOT NULL, -- e.g., 'verb_conjugation', 'case_system', 'word_order', 'particles'
  rule_name TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  examples JSONB DEFAULT '[]'::jsonb, -- [{correct: "", incorrect: "", explanation: ""}]
  gf_rgl_reference TEXT, -- Reference to GF-RGL grammar structure
  source TEXT NOT NULL, -- 'gf-rgl', 'multext-east', 'korpora', 'kli', 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grammar_rules_language ON grammar_rules(language);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_category ON grammar_rules(category);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_difficulty ON grammar_rules(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_lang_cat ON grammar_rules(language, category);

-- ========================================
-- PRONUNCIATION DATABASE
-- ========================================

-- Phoneme database for pronunciation scoring
CREATE TABLE IF NOT EXISTS pronunciation_phonemes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  phoneme TEXT NOT NULL,
  ipa TEXT NOT NULL, -- International Phonetic Alphabet representation
  description TEXT,
  common_errors TEXT[] DEFAULT ARRAY[]::TEXT[], -- Common mispronunciations
  example_words TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pronunciation_phonemes_language ON pronunciation_phonemes(language);
CREATE INDEX IF NOT EXISTS idx_pronunciation_phonemes_phoneme ON pronunciation_phonemes(phoneme);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pronunciation_unique ON pronunciation_phonemes(language, phoneme);

-- ========================================
-- FORGE SUBMISSIONS
-- ========================================

-- User submissions from Forge modes for grading
CREATE TABLE IF NOT EXISTS forge_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  forge_type TEXT NOT NULL CHECK (forge_type IN ('quick_fire', 'shadow_speak', 'writing_sprint', 'translation', 'conversation')),
  prompt_id TEXT REFERENCES forge_prompts(id) ON DELETE SET NULL,
  submission_text TEXT,
  submission_audio_url TEXT,
  transcript TEXT, -- From STT if audio submission
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_submissions_user ON forge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_forge_submissions_session ON forge_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_forge_submissions_type ON forge_submissions(forge_type);
CREATE INDEX IF NOT EXISTS idx_forge_submissions_created ON forge_submissions(created_at);

-- ========================================
-- GRADING RESULTS
-- ========================================

-- AI grading results for submissions
CREATE TABLE IF NOT EXISTS grading_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  submission_id TEXT NOT NULL REFERENCES forge_submissions(id) ON DELETE CASCADE,
  
  -- Overall scores (0-100)
  overall_score NUMERIC(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  grammar_score NUMERIC(5,2) CHECK (grammar_score >= 0 AND grammar_score <= 100),
  vocabulary_score NUMERIC(5,2) CHECK (vocabulary_score >= 0 AND vocabulary_score <= 100),
  naturalness_score NUMERIC(5,2) CHECK (naturalness_score >= 0 AND naturalness_score <= 100),
  pronunciation_score NUMERIC(5,2) CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
  
  -- Detailed feedback
  corrections JSONB DEFAULT '[]'::jsonb, -- [{original: "", corrected: "", explanation: "", ruleId: ""}]
  feedback TEXT NOT NULL, -- Overall narrative feedback
  suggestions TEXT[] DEFAULT ARRAY[]::TEXT[], -- Actionable improvement suggestions
  
  -- Identified patterns
  grammar_issues JSONB DEFAULT '[]'::jsonb, -- [{ruleId: "", category: "", severity: ""}]
  vocabulary_gaps TEXT[] DEFAULT ARRAY[]::TEXT[], -- Words/phrases beyond user level
  pronunciation_errors JSONB DEFAULT '[]'::jsonb, -- [{phoneme: "", word: "", confidence: 0.0}]
  
  -- Metadata
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  agent_version TEXT DEFAULT 'v1.0' -- Track grading agent version
);

CREATE INDEX IF NOT EXISTS idx_grading_results_submission ON grading_results(submission_id);
CREATE INDEX IF NOT EXISTS idx_grading_results_graded ON grading_results(graded_at);
CREATE INDEX IF NOT EXISTS idx_grading_results_score ON grading_results(overall_score);

-- ========================================
-- PROFICIENCY PATTERNS
-- ========================================

-- Track detailed proficiency patterns for personalized learning
CREATE TABLE IF NOT EXISTS proficiency_patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  
  -- Pattern classification
  category TEXT NOT NULL, -- 'grammar', 'vocabulary', 'pronunciation', 'naturalness'
  pattern_type TEXT NOT NULL, -- Specific pattern e.g., 'verb_conjugation_present', 'particle_usage'
  grammar_rule_id TEXT REFERENCES grammar_rules(id) ON DELETE SET NULL,
  
  -- Tracking metrics
  occurrences INTEGER DEFAULT 1,
  correct_uses INTEGER DEFAULT 0,
  incorrect_uses INTEGER DEFAULT 0,
  mastery_level NUMERIC(3,2) DEFAULT 0.00 CHECK (mastery_level >= 0 AND mastery_level <= 1.00),
  
  -- Temporal data
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  last_correct TIMESTAMPTZ,
  last_incorrect TIMESTAMPTZ,
  
  -- Unique constraint per user/language/pattern
  UNIQUE(user_id, language, pattern_type)
);

CREATE INDEX IF NOT EXISTS idx_proficiency_patterns_user ON proficiency_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_proficiency_patterns_language ON proficiency_patterns(language);
CREATE INDEX IF NOT EXISTS idx_proficiency_patterns_category ON proficiency_patterns(category);
CREATE INDEX IF NOT EXISTS idx_proficiency_patterns_mastery ON proficiency_patterns(mastery_level);
CREATE INDEX IF NOT EXISTS idx_proficiency_patterns_rule ON proficiency_patterns(grammar_rule_id);

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to calculate mastery level based on correct/incorrect ratio
CREATE OR REPLACE FUNCTION calculate_mastery_level(correct INT, incorrect INT)
RETURNS NUMERIC(3,2) AS $$
BEGIN
  IF correct + incorrect = 0 THEN
    RETURN 0.00;
  END IF;
  RETURN ROUND((correct::NUMERIC / (correct + incorrect)::NUMERIC), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update proficiency pattern
CREATE OR REPLACE FUNCTION update_proficiency_pattern(
  p_user_id TEXT,
  p_language TEXT,
  p_category TEXT,
  p_pattern_type TEXT,
  p_is_correct BOOLEAN,
  p_grammar_rule_id TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO proficiency_patterns (
    user_id, language, category, pattern_type, grammar_rule_id,
    occurrences, correct_uses, incorrect_uses, first_seen, last_seen
  )
  VALUES (
    p_user_id, p_language, p_category, p_pattern_type, p_grammar_rule_id,
    1,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    CASE WHEN p_is_correct THEN 0 ELSE 1 END,
    NOW(), NOW()
  )
  ON CONFLICT (user_id, language, pattern_type)
  DO UPDATE SET
    occurrences = proficiency_patterns.occurrences + 1,
    correct_uses = proficiency_patterns.correct_uses + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    incorrect_uses = proficiency_patterns.incorrect_uses + CASE WHEN p_is_correct THEN 0 ELSE 1 END,
    last_seen = NOW(),
    last_correct = CASE WHEN p_is_correct THEN NOW() ELSE proficiency_patterns.last_correct END,
    last_incorrect = CASE WHEN p_is_correct THEN proficiency_patterns.last_incorrect ELSE NOW() END,
    mastery_level = calculate_mastery_level(
      proficiency_patterns.correct_uses + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
      proficiency_patterns.incorrect_uses + CASE WHEN p_is_correct THEN 0 ELSE 1 END
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SEED INITIAL DATA (HIGH-FREQUENCY PATTERNS)
-- ========================================

-- Romanian: Common learner error patterns
INSERT INTO grammar_rules (language, category, rule_name, description, difficulty_level, source, examples) VALUES
  (
    'ro', 'verb_conjugation', 'present_tense_regular',
    'Regular verb conjugation in present tense',
    2,
    'manual',
    '[
      {"correct": "eu vorbesc", "incorrect": "eu vorbi", "explanation": "First person singular takes -esc ending for -i verbs"},
      {"correct": "el vorbește", "incorrect": "el vorbesc", "explanation": "Third person singular uses -ește not -esc"}
    ]'::jsonb
  ),
  (
    'ro', 'case_system', 'genitive_dative',
    'Genitive-Dative case formation',
    5,
    'manual',
    '[
      {"correct": "cartea profesorului", "incorrect": "cartea profesor", "explanation": "Genitive requires article suffix -lui for masculine singular"},
      {"correct": "dau cartea copilului", "incorrect": "dau cartea copil", "explanation": "Dative requires -lui ending"}
    ]'::jsonb
  ),
  (
    'ro', 'articles', 'definite_article_attachment',
    'Definite article attaches to end of noun',
    3,
    'manual',
    '[
      {"correct": "casa", "incorrect": "la casa", "explanation": "Definite article -a attaches to noun (casă → casa)"},
      {"correct": "copilul", "incorrect": "le copil", "explanation": "Masculine definite article is -ul/-l suffix"}
    ]'::jsonb
  );

-- Korean: Common learner error patterns
INSERT INTO grammar_rules (language, category, rule_name, description, difficulty_level, source, examples) VALUES
  (
    'ko', 'particles', 'subject_marker',
    'Subject particles 이/가 selection based on final consonant',
    2,
    'manual',
    '[
      {"correct": "책이 있어요", "incorrect": "책가 있어요", "explanation": "Use 이 after consonant (책 ends in ㄱ)"},
      {"correct": "나가 있어요", "incorrect": "나이 있어요", "explanation": "Use 가 after vowel (나 ends in vowel)"}
    ]'::jsonb
  ),
  (
    'ko', 'particles', 'object_marker',
    'Object particles 을/를 selection based on final consonant',
    2,
    'manual',
    '[
      {"correct": "밥을 먹어요", "incorrect": "밥를 먹어요", "explanation": "Use 을 after consonant (밥 ends in ㅂ)"},
      {"correct": "사과를 먹어요", "incorrect": "사과을 먹어요", "explanation": "Use 를 after vowel (사과 ends in vowel)"}
    ]'::jsonb
  ),
  (
    'ko', 'verb_conjugation', 'polite_present_tense',
    'Polite present tense conjugation with -아요/-어요',
    3,
    'manual',
    '[
      {"correct": "가요", "incorrect": "가아요", "explanation": "가다 stem 가 + 아요 contracts to 가요"},
      {"correct": "먹어요", "incorrect": "먹아요", "explanation": "먹다 has ㅓ vowel, uses -어요 not -아요"}
    ]'::jsonb
  ),
  (
    'ko', 'honorifics', 'subject_honorific',
    'Using honorific verb forms for respected subjects',
    4,
    'manual',
    '[
      {"correct": "선생님이 가세요", "incorrect": "선생님이 가요", "explanation": "Use -시- honorific infix for teachers/elders"},
      {"correct": "할머니께서 주무세요", "incorrect": "할머니가 자요", "explanation": "Use 께서 (honorific subject marker) and 주무시다 (honorific sleep)"}
    ]'::jsonb
  );

-- Seed common phonemes (subset - full list would be populated by extraction scripts)
INSERT INTO pronunciation_phonemes (language, phoneme, ipa, description, common_errors) VALUES
  ('ro', 'ă', '/ə/', 'Schwa sound, mid-central vowel', ARRAY['replaced with /a/']),
  ('ro', 'î/â', '/ɨ/', 'Close central unrounded vowel', ARRAY['replaced with /i/', 'replaced with /u/']),
  ('ro', 'ț', '/ts/', 'Voiceless alveolar affricate', ARRAY['replaced with /t/', 'replaced with /s/']),
  ('ko', 'ㅓ', '/ʌ/', 'Open-mid back unrounded vowel', ARRAY['replaced with /o/', 'replaced with /a/']),
  ('ko', 'ㅡ', '/ɯ/', 'Close back unrounded vowel', ARRAY['replaced with /u/', 'omitted']),
  ('ko', 'ㄱ', '/k~g/', 'Voiceless velar plosive (varies)', ARRAY['always /g/', 'always /k/']);
