const { neon } = require('@neondatabase/serverless');

// Use direct endpoint (not pooler) for DDL operations
const DATABASE_URL = 'postgresql://neondb_owner:npg_KNTRL8hpxQn6@ep-aged-poetry-a8ecb3xb.eastus2.azure.neon.tech/neondb?sslmode=require';

async function runScripts() {
  const sql = neon(DATABASE_URL);
  
  console.log('🔌 Connected to Neon database\n');
  
  // Set search path explicitly
  await sql`SET search_path TO public`;
  console.log('  ✓ Set search_path to public');
  
  // Create tables one by one
  console.log('\n📦 Creating tables...');
  
  // 1. Users table
  await sql`
    CREATE TABLE IF NOT EXISTS public.users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ users');
  
  // 2. Auth sessions
  await sql`
    CREATE TABLE IF NOT EXISTS public.auth_sessions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ auth_sessions');
  
  // 3. User profiles
  await sql`
    CREATE TABLE IF NOT EXISTS public.user_profiles (
      id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
      primary_language TEXT DEFAULT 'ro',
      languages TEXT[] DEFAULT ARRAY['ro', 'ko'],
      levels JSONB DEFAULT '{"ro": 1, "ko": 1}'::jsonb,
      chaos_setting TEXT DEFAULT 'guided-random',
      fog_level INTEGER DEFAULT 70,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ user_profiles');
  
  // 4. User stats
  await sql`
    CREATE TABLE IF NOT EXISTS public.user_stats (
      id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
      chaos_sessions INTEGER DEFAULT 0,
      errors_harvested INTEGER DEFAULT 0,
      mysteries_resolved INTEGER DEFAULT 0,
      time_in_fog NUMERIC(10, 2) DEFAULT 0,
      words_forged INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      last_session_date DATE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ user_stats');
  
  // 5. User settings
  await sql`
    CREATE TABLE IF NOT EXISTS public.user_settings (
      id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
      dark_mode BOOLEAN DEFAULT true,
      sound_effects BOOLEAN DEFAULT true,
      auto_advance BOOLEAN DEFAULT true,
      notifications_enabled BOOLEAN DEFAULT true,
      session_reminders BOOLEAN DEFAULT true,
      weekly_summary BOOLEAN DEFAULT true,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ user_settings');
  
  // 6. Content items
  await sql`
    CREATE TABLE IF NOT EXISTS public.content_items (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      type TEXT NOT NULL,
      language TEXT NOT NULL,
      difficulty INTEGER DEFAULT 3,
      length_minutes INTEGER DEFAULT 5,
      topics TEXT[] DEFAULT ARRAY[]::TEXT[],
      source_url TEXT,
      transcript TEXT,
      title TEXT NOT NULL,
      description TEXT,
      thumbnail_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ content_items');
  
  // 7. Error items
  await sql`
    CREATE TABLE IF NOT EXISTS public.error_items (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      language TEXT NOT NULL,
      original TEXT NOT NULL,
      user_guess TEXT,
      correct TEXT NOT NULL,
      context TEXT,
      occurrences INTEGER DEFAULT 1,
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ error_items');
  
  // 8. Mystery items
  await sql`
    CREATE TABLE IF NOT EXISTS public.mystery_items (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      language TEXT NOT NULL,
      phrase TEXT NOT NULL,
      context TEXT,
      resolved BOOLEAN DEFAULT false,
      resolved_meaning TEXT,
      encounters INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ mystery_items');
  
  // 9. Sessions
  await sql`
    CREATE TABLE IF NOT EXISTS public.sessions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      language TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      ended_at TIMESTAMPTZ,
      reflection TEXT,
      mood TEXT
    )
  `;
  console.log('  ✓ sessions');
  
  // 10. Forge prompts
  await sql`
    CREATE TABLE IF NOT EXISTS public.forge_prompts (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      type TEXT NOT NULL,
      language TEXT NOT NULL,
      text TEXT NOT NULL,
      difficulty INTEGER DEFAULT 3,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ forge_prompts');
  
  // 11. Forge responses
  await sql`
    CREATE TABLE IF NOT EXISTS public.forge_responses (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      session_id TEXT REFERENCES public.sessions(id) ON DELETE SET NULL,
      prompt_id TEXT REFERENCES public.forge_prompts(id) ON DELETE SET NULL,
      response_text TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      self_corrections INTEGER DEFAULT 0,
      errors_identified INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ forge_responses');
  
  // Create indexes
  console.log('\n📦 Creating indexes...');
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.auth_sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_error_items_user_id ON public.error_items(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mystery_items_user_id ON public.mystery_items(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_content_items_language ON public.content_items(language)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_forge_responses_user_id ON public.forge_responses(user_id)`;
  console.log('  ✓ Indexes created');
  
  // Seed content
  console.log('\n📦 Seeding data...');
  
  // Content items
  await sql`
    INSERT INTO public.content_items (id, type, language, difficulty, length_minutes, topics, title, description, thumbnail_url) VALUES
      ('content-1', 'video', 'ro', 5, 8, ARRAY['daily-life', 'culture'], 'O zi obișnuită în București', 'A vlogger explores daily life in Bucharest', '/bucharest-city-vlog.jpg'),
      ('content-2', 'audio', 'ko', 4, 5, ARRAY['music', 'culture'], '한국 팝송 가사 분석', 'K-pop lyrics breakdown with explanations', '/kpop-music-colorful.jpg'),
      ('content-3', 'text', 'ro', 6, 4, ARRAY['news', 'politics'], 'Știri din România', 'Current events in Romanian news', '/newspaper-headlines.jpg'),
      ('content-4', 'video', 'ko', 3, 12, ARRAY['entertainment', 'variety'], '런닝맨 하이라이트', 'Running Man show highlights', '/korean-variety-show-fun.jpg')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log('  ✓ Content items');
  
  // Forge prompts
  await sql`
    INSERT INTO public.forge_prompts (id, type, language, text, difficulty) VALUES
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
    ON CONFLICT (id) DO NOTHING
  `;
  console.log('  ✓ Forge prompts');

  // 11. Definitions table
  await sql`
    CREATE TABLE IF NOT EXISTS public.definitions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      language TEXT NOT NULL CHECK (language IN ('ro', 'ko')),
      word TEXT NOT NULL,
      definition TEXT NOT NULL,
      part_of_speech TEXT,
      examples TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ definitions');

  // Create unique index on language + word
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS definitions_language_word_idx 
      ON public.definitions (language, word)
  `;
  
  // Seed definitions
  await sql`
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
    ON CONFLICT (language, word) DO NOTHING
  `;
  console.log('  ✓ Definitions seeded');
  
  // Verify
  console.log('\n📋 Verifying...');
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log('Tables:', tables.map(t => t.table_name).join(', '));
  
  const contentCount = await sql`SELECT COUNT(*) as count FROM content_items`;
  const promptCount = await sql`SELECT COUNT(*) as count FROM forge_prompts`;
  const definitionCount = await sql`SELECT COUNT(*) as count FROM definitions`;
  console.log(`Content items: ${contentCount[0].count}, Forge prompts: ${promptCount[0].count}, Definitions: ${definitionCount[0].count}`);
  
  console.log('\n✅ Database setup complete!');
}

runScripts().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
