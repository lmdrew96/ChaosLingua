-- Seed initial content and forge prompts

-- Sample content items
INSERT INTO content_items (id, type, language, difficulty, length_minutes, topics, title, description, thumbnail_url) VALUES
  ('content-1', 'video', 'ro', 5, 8, ARRAY['daily-life', 'culture'], 'O zi obișnuită în București', 'A vlogger explores daily life in Bucharest', '/bucharest-city-vlog.jpg'),
  ('content-2', 'audio', 'ko', 4, 5, ARRAY['music', 'culture'], '한국 팝송 가사 분석', 'K-pop lyrics breakdown with explanations', '/kpop-music-colorful.jpg'),
  ('content-3', 'text', 'ro', 6, 4, ARRAY['news', 'politics'], 'Știri din România', 'Current events in Romanian news', '/newspaper-headlines.jpg'),
  ('content-4', 'video', 'ko', 3, 12, ARRAY['entertainment', 'variety'], '런닝맨 하이라이트', 'Running Man show highlights', '/korean-variety-show-fun.jpg')
ON CONFLICT (id) DO NOTHING;

-- Sample forge prompts
INSERT INTO forge_prompts (id, type, language, text, difficulty) VALUES
  ('prompt-1', 'quick_fire', 'ro', 'Describe your morning in 3 sentences.', 3),
  ('prompt-2', 'quick_fire', 'ro', 'What did you eat today? Why?', 2),
  ('prompt-3', 'quick_fire', 'ko', '오늘 뭐 했어요?', 3),
  ('prompt-4', 'quick_fire', 'ko', 'Tell me about your favorite place.', 4),
  ('prompt-5', 'writing_sprint', 'ro', 'Write about a childhood memory', 5),
  ('prompt-6', 'writing_sprint', 'ko', 'Describe your ideal weekend', 4),
  ('prompt-7', 'quick_fire', 'ro', 'Ce îți place să faci în weekend?', 3),
  ('prompt-8', 'quick_fire', 'ko', '가장 좋아하는 음식은 뭐예요?', 2),
  ('prompt-9', 'writing_sprint', 'ro', 'Descrie un loc din copilărie', 4),
  ('prompt-10', 'writing_sprint', 'ko', '미래의 나에게 편지를 써 보세요', 5)
ON CONFLICT (id) DO NOTHING;
