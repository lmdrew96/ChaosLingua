-- ChaosLingua Language-Specific Forge Prompts
-- Seeding forge prompts for Romanian and Korean with language-specific focus areas

-- ========================================
-- ROMANIAN FORGE PROMPTS
-- ========================================

-- Quick Fire - Romanian Daily Routine
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('quick_fire', 'ro', 'Descrie dimineața ta în 3 propoziții.', 3),
('quick_fire', 'ro', 'Ce ai mâncat azi la micul dejun? De ce ai ales asta?', 3),
('quick_fire', 'ro', 'Care este locul tău preferat din oraș? Descrie-l.', 4),
('quick_fire', 'ro', 'Spune-mi despre un prieten bun. Cum l-ai cunoscut?', 4),
('quick_fire', 'ro', 'Ce vreme este afară acum? Îți place?', 2),
('quick_fire', 'ro', 'Ce faci de obicei în weekend?', 3),
('quick_fire', 'ro', 'Descrie camera ta în 5 propoziții.', 4),
('quick_fire', 'ro', 'Ce ai făcut ieri seară?', 3);

-- Quick Fire - Romanian "Să" Subjunctive Focus
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('quick_fire', 'ro', 'Ce vrei să faci mâine? Folosește "vreau să...".', 4),
('quick_fire', 'ro', 'Ce trebuie să faci săptămâna asta? Enumeră 3 lucruri.', 4),
('quick_fire', 'ro', 'Ce ți-ar plăcea să înveți? Folosește "mi-ar plăcea să...".', 5),
('quick_fire', 'ro', 'Spune-i unui prieten ce ar trebui să facă în România.', 5),
('quick_fire', 'ro', 'Ce e bine să faci când înveți o limbă nouă?', 5);

-- Quick Fire - Romanian Definite Article Focus
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('quick_fire', 'ro', 'Descrie lucrurile din bucătărie. Folosește articolul hotărât (cartea, masa, etc.).', 5),
('quick_fire', 'ro', 'Ce vezi pe strada ta? Descrie clădirile și oamenii.', 5),
('quick_fire', 'ro', 'Povestește despre un film. Cine sunt personajele principale?', 6);

-- Writing Sprint - Romanian
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('writing_sprint', 'ro', 'Scrie despre ziua ta perfectă. Unde mergi? Ce mănânci? Cu cine ești?', 4),
('writing_sprint', 'ro', 'Descrie familia ta. Câți frați sau surori ai? Cum sunt ei?', 3),
('writing_sprint', 'ro', 'Povestește despre o călătorie pe care ai făcut-o.', 5),
('writing_sprint', 'ro', 'Ce ai face dacă ai câștiga la loterie?', 6),
('writing_sprint', 'ro', 'Scrie o scrisoare către viitorul tău eu. Ce sfaturi ai?', 6),
('writing_sprint', 'ro', 'Descrie tradițiile de Crăciun din țara ta.', 5),
('writing_sprint', 'ro', 'Ce părere ai despre rețelele sociale? Sunt bune sau rele?', 6);

-- Translation - Romanian
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('translation', 'ro', 'I want to learn Romanian because it is a beautiful language.', 4),
('translation', 'ro', 'Where is the nearest supermarket? I need to buy some bread.', 3),
('translation', 'ro', 'The book is on the table next to the window.', 3),
('translation', 'ro', 'I like this city very much. The people are friendly.', 4),
('translation', 'ro', 'Can you help me, please? I am looking for the train station.', 4),
('translation', 'ro', 'Yesterday I went to the park and met my friends.', 5),
('translation', 'ro', 'I think we should leave now because it is getting late.', 6),
('translation', 'ro', 'If I had more time, I would travel to Romania.', 7);

-- ========================================
-- KOREAN FORGE PROMPTS
-- ========================================

-- Quick Fire - Korean Daily Routine
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('quick_fire', 'ko', '오늘 아침에 뭐 했어요? 세 문장으로 설명해 주세요.', 3),
('quick_fire', 'ko', '좋아하는 음식이 뭐예요? 왜 좋아해요?', 3),
('quick_fire', 'ko', '주말에 보통 뭐 해요?', 3),
('quick_fire', 'ko', '가족에 대해 말해 주세요.', 4),
('quick_fire', 'ko', '지금 날씨가 어때요? 좋아해요?', 2),
('quick_fire', 'ko', '어제 저녁에 뭐 했어요?', 3),
('quick_fire', 'ko', '방을 설명해 주세요. 뭐가 있어요?', 4);

-- Quick Fire - Korean Formality Practice
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('quick_fire', 'ko', '친구한테 어제 뭐 했는지 말해 주세요. (반말 사용)', 5),
('quick_fire', 'ko', '선생님한테 자기소개 해 주세요. (존댓말 사용)', 5),
('quick_fire', 'ko', '같은 이야기를 반말로, 그리고 존댓말로 말해 보세요.', 6),
('quick_fire', 'ko', '면접에서 자기를 소개해 주세요. (격식체 사용)', 7);

-- Quick Fire - Korean Particle Focus
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('quick_fire', 'ko', '오늘 뭘 먹었어요? 을/를 사용해서 답해 주세요.', 4),
('quick_fire', 'ko', '누가 전화했어요? 이/가 사용해서 답해 주세요.', 4),
('quick_fire', 'ko', '어디에서 공부해요? 에/에서 사용해서 답해 주세요.', 5),
('quick_fire', 'ko', '누구한테 선물을 줬어요? 한테/에게 사용해서 답해 주세요.', 5);

-- Quick Fire - Korean Counter Practice
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('quick_fire', 'ko', '방에 뭐가 있어요? 개, 권, 장 등을 사용해 주세요.', 5),
('quick_fire', 'ko', '가족이 몇 명이에요? 명을 사용해서 답해 주세요.', 4),
('quick_fire', 'ko', '오늘 커피를 몇 잔 마셨어요?', 4);

-- Writing Sprint - Korean
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('writing_sprint', 'ko', '완벽한 하루를 설명해 주세요. 어디 가요? 뭐 먹어요? 누구랑 있어요?', 4),
('writing_sprint', 'ko', '가족에 대해 써 주세요. 형제자매가 있어요? 그들은 어때요?', 4),
('writing_sprint', 'ko', '여행 경험에 대해 써 주세요.', 5),
('writing_sprint', 'ko', '로또에 당첨되면 뭐 할 거예요?', 6),
('writing_sprint', 'ko', '미래의 자신에게 편지를 써 주세요.', 6),
('writing_sprint', 'ko', '한국 문화에 대해 뭘 알아요? 무엇이 흥미로워요?', 5),
('writing_sprint', 'ko', 'SNS에 대해 어떻게 생각해요? 좋아요, 나빠요?', 6);

-- Translation - Korean
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('translation', 'ko', 'I am learning Korean because I love Korean dramas.', 4),
('translation', 'ko', 'Where is the subway station? I need to go to Gangnam.', 3),
('translation', 'ko', 'This food is delicious. I want to eat more.', 3),
('translation', 'ko', 'I want to go to Korea next year with my friends.', 4),
('translation', 'ko', 'How much is this? Can I pay by card?', 4),
('translation', 'ko', 'Yesterday I watched a movie and then went to sleep.', 5),
('translation', 'ko', 'I think Korean grammar is difficult but interesting.', 6),
('translation', 'ko', 'If I could speak Korean fluently, I would work in Korea.', 7);

-- Shadow Speak - Romanian Audio Clips (placeholder URLs)
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('shadow_speak', 'ro', 'Bună ziua! Cum te numești?', 2),
('shadow_speak', 'ro', 'Mă bucur să te cunosc.', 2),
('shadow_speak', 'ro', 'Ce mai faci? Totul e bine?', 3),
('shadow_speak', 'ro', 'Vreau să învăț limba română.', 3),
('shadow_speak', 'ro', 'Mulțumesc foarte mult pentru ajutor!', 3),
('shadow_speak', 'ro', 'Unde este gara? Trebuie să prind trenul.', 4),
('shadow_speak', 'ro', 'Mi-ar plăcea să vizitez Bucureștiul într-o zi.', 5),
('shadow_speak', 'ro', 'Dacă ai timp, hai să mergem la o cafea.', 5);

-- Shadow Speak - Korean Audio Clips (placeholder URLs)
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('shadow_speak', 'ko', '안녕하세요! 만나서 반갑습니다.', 2),
('shadow_speak', 'ko', '저는 한국어를 배우고 있어요.', 3),
('shadow_speak', 'ko', '오늘 날씨가 정말 좋아요.', 3),
('shadow_speak', 'ko', '이거 얼마예요?', 2),
('shadow_speak', 'ko', '감사합니다! 안녕히 가세요.', 2),
('shadow_speak', 'ko', '죄송합니다, 다시 한번 말해 주세요.', 4),
('shadow_speak', 'ko', '시간이 있으면 같이 밥 먹을까요?', 5),
('shadow_speak', 'ko', '한국에 가면 꼭 경복궁에 가고 싶어요.', 5);

-- Conversation scenarios are handled in the component with full dialogue trees
-- These are just prompt seeds for the conversation mode
INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
('conversation', 'ro', 'La cafenea - Comandă o cafea', 3),
('conversation', 'ro', 'La restaurant - Rezervă o masă', 4),
('conversation', 'ro', 'La piață - Cumpără legume', 4),
('conversation', 'ro', 'La hotel - Check-in', 5),
('conversation', 'ko', '카페에서 - 음료 주문하기', 3),
('conversation', 'ko', '식당에서 - 예약하기', 4),
('conversation', 'ko', '시장에서 - 과일 사기', 4),
('conversation', 'ko', '호텔에서 - 체크인하기', 5);
