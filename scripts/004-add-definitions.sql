-- 004: Add definitions table for word lookups

CREATE TABLE IF NOT EXISTS public.definitions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  part_of_speech TEXT,
  examples TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on language + word
CREATE UNIQUE INDEX IF NOT EXISTS definitions_language_word_idx 
  ON public.definitions (language, word);

-- Index for lookups
CREATE INDEX IF NOT EXISTS definitions_word_idx ON public.definitions (word);

-- Seed with initial definitions for demo words
INSERT INTO public.definitions (language, word, definition, part_of_speech, examples) VALUES
  ('ro', 'frumos', 'beautiful, handsome', 'adjective', ARRAY['Ce frumos este aici!', 'El este un băiat frumos.']),
  ('ro', 'casă', 'house, home', 'noun', ARRAY['Am o casă mare.', 'Mergem acasă.']),
  ('ro', 'parc', 'park', 'noun', ARRAY['Mergem în parc.', 'Parcul este frumos.']),
  ('ro', 'copii', 'children', 'noun', ARRAY['Copiii se joacă.', 'Am doi copii.']),
  ('ko', '머리', 'head, hair', 'noun', ARRAY['머리가 아파요.', '머리를 감았어요.']),
  ('ko', '사랑', 'love', 'noun', ARRAY['사랑해요.', '사랑은 아름다워요.']),
  ('ko', '먹다', 'to eat', 'verb', ARRAY['밥을 먹어요.', '뭘 먹을까요?']),
  ('ko', '집', 'house, home', 'noun', ARRAY['집에 가요.', '우리 집이에요.']),
  ('ko', '좋다', 'to be good, to like', 'adjective', ARRAY['날씨가 좋아요.', '이거 좋아요.']),
  ('ko', '공원', 'park', 'noun', ARRAY['공원에서 산책해요.', '공원이 넓어요.']),
  ('ko', '아이', 'child', 'noun', ARRAY['아이가 놀아요.', '아이들이 많아요.'])
ON CONFLICT (language, word) DO NOTHING;
