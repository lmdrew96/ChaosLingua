-- 008: Expand Korean Language Content
-- Additional content items, forge prompts, and definitions for Korean study modes

-- ========================================
-- KOREAN CONTENT ITEMS
-- ========================================

INSERT INTO content_items (id, type, language, difficulty, length_minutes, topics, title, description, transcript, thumbnail_url) VALUES
  -- Beginner Korean Content (Difficulty 1-3)
  ('ko-beginner-1', 'text', 'ko', 2, 3, ARRAY['daily-life', 'greetings'], '기본 한국어 인사', 'Basic Korean greetings for beginners', 
   '안녕하세요! 반갑습니다. 저는 미국에서 왔어요. 한국어를 배우고 있어요. 아직 잘 못해요. 하지만 열심히 공부해요. 한국어가 재미있어요. 선생님이 친절해요. 수업이 좋아요. 감사합니다! 안녕히 가세요.', NULL),
  
  ('ko-beginner-2', 'text', 'ko', 2, 3, ARRAY['daily-life', 'numbers'], '숫자 배우기', 'Learning Korean numbers',
   '하나, 둘, 셋, 넷, 다섯. 여섯, 일곱, 여덟, 아홉, 열. 한국어에는 두 가지 숫자가 있어요. 고유어 숫자와 한자어 숫자예요. 일, 이, 삼, 사, 오. 육, 칠, 팔, 구, 십. 나이를 말할 때는 고유어를 써요. 저는 스물다섯 살이에요. 전화번호는 한자어로 말해요. 제 번호는 010-1234-5678이에요.', NULL),
  
  ('ko-beginner-3', 'text', 'ko', 3, 4, ARRAY['daily-life', 'family'], '우리 가족 소개', 'Introducing my family',
   '우리 가족은 네 명이에요. 아버지, 어머니, 오빠, 그리고 저예요. 아버지는 회사원이에요. 매일 아침 일찍 출근해요. 어머니는 선생님이에요. 초등학교에서 가르쳐요. 오빠는 대학생이에요. 컴퓨터 공학을 전공해요. 저는 고등학생이에요. 우리 가족은 주말에 함께 시간을 보내요. 같이 영화를 보거나 외식을 해요.', NULL),
  
  ('ko-beginner-4', 'text', 'ko', 3, 4, ARRAY['daily-life', 'shopping'], '마트에서 쇼핑하기', 'Shopping at the supermarket',
   '오늘 마트에 갔어요. 과일을 사고 싶었어요. 사과가 맛있어 보였어요. "이거 얼마예요?" 하고 물었어요. 한 개에 천 원이래요. 다섯 개 샀어요. 바나나도 샀어요. 우유도 필요했어요. 계산대에서 카드로 계산했어요. 총 만오천 원이었어요. 봉투가 필요하냐고 물어봤어요. 에코백을 가져왔어요. 장을 보고 집에 왔어요.', NULL),

  -- Intermediate Korean Content (Difficulty 4-6)
  ('ko-inter-1', 'text', 'ko', 4, 5, ARRAY['culture', 'etiquette'], '한국의 예절', 'Korean etiquette and manners',
   '한국에서는 예절이 중요해요. 어른을 만나면 인사를 해야 해요. 고개를 숙이면서 "안녕하세요"라고 해요. 식사할 때도 예절이 있어요. 어른이 먼저 수저를 드신 후에 먹기 시작해요. 밥을 들고 먹지 않아요. 술을 마실 때는 고개를 돌려요. 이것은 존경의 표시예요. 선물을 받으면 바로 열지 않아요. 나중에 혼자 열어요. 이런 문화를 알면 한국 생활이 더 편해요.', NULL),
  
  ('ko-inter-2', 'text', 'ko', 5, 6, ARRAY['entertainment', 'music'], '케이팝의 역사', 'History of K-pop',
   '케이팝은 1990년대에 시작됐어요. 서태지와 아이들이 첫 번째 케이팝 그룹이라고 해요. 2000년대에는 보아, 동방신기가 아시아에서 인기를 얻었어요. 2010년대에 케이팝은 세계적으로 유명해졌어요. 빅뱅, 슈퍼주니어, 소녀시대가 길을 열었어요. 싸이의 "강남스타일"이 전 세계에서 히트했어요. 지금은 BTS, 블랙핑크가 빌보드 차트에서 1위를 해요. 케이팝은 음악뿐만 아니라 패션, 댄스, 비주얼까지 중요해요. 팬들의 역할도 커요.', NULL),
  
  ('ko-inter-3', 'text', 'ko', 5, 6, ARRAY['travel', 'tourism'], '서울 여행 가이드', 'Seoul travel guide',
   '서울은 한국의 수도예요. 인구가 천만 명이 넘어요. 관광 명소가 많아요. 경복궁은 조선 시대의 궁궐이에요. 아름다운 건축물을 볼 수 있어요. 한복을 입고 사진을 찍는 사람들이 많아요. 명동은 쇼핑의 중심지예요. 화장품, 옷, 음식 등 다양한 것을 살 수 있어요. 홍대는 젊은이들의 거리예요. 카페, 클럽, 공연장이 많아요. 남산타워에서 서울 전경을 볼 수 있어요. 밤에 야경이 정말 아름다워요.', NULL),
  
  ('ko-inter-4', 'text', 'ko', 5, 5, ARRAY['food', 'cooking'], '김치 만들기', 'How to make kimchi',
   '김치는 한국의 전통 음식이에요. 만드는 방법을 알려 드릴게요. 먼저 배추를 소금에 절여요. 4-5시간 정도 절여요. 그동안 양념을 만들어요. 고춧가루, 마늘, 생강, 젓갈, 설탕을 섞어요. 파와 무채도 넣어요. 절인 배추를 씻어요. 물기를 빼고 양념을 바르요. 잎 사이사이에 꼼꼼히 발라요. 용기에 담아서 실온에 하루 두어요. 그 다음 냉장고에 넣어요. 일주일 후에 먹을 수 있어요!', NULL),
  
  ('ko-inter-5', 'video', 'ko', 4, 8, ARRAY['entertainment', 'drama'], '한국 드라마 명장면', 'Famous K-drama scenes',
   '한국 드라마는 전 세계에서 인기가 많아요. "겨울연가"가 한류의 시작이었어요. 일본에서 엄청난 인기를 끌었어요. "별에서 온 그대"는 중국에서 대성공했어요. 치맥 문화가 유행했어요. "도깨비"의 명대사를 아세요? "나와 함께 지옥에서 살겠느냐?" 드라마틱한 장면이었어요. "오징어 게임"은 넷플릭스 역사상 가장 많이 본 시리즈가 됐어요. 한국 드라마는 로맨스, 스릴러, 판타지 등 다양한 장르가 있어요.', NULL),

  -- Advanced Korean Content (Difficulty 7-9)
  ('ko-adv-1', 'text', 'ko', 7, 8, ARRAY['society', 'issues'], '한국의 사회 문제', 'Social issues in Korea',
   '한국 사회는 여러 문제에 직면해 있습니다. 저출산 문제가 심각합니다. 2023년 합계출산율이 0.72로 세계 최저 수준입니다. 젊은이들이 결혼과 출산을 미루는 이유는 다양합니다. 주거비와 양육비 부담이 큽니다. 취업 경쟁도 치열합니다. 워라밸을 중시하는 분위기도 영향을 미칩니다. 고령화 사회도 빠르게 진행 중입니다. 2025년에는 초고령사회에 진입할 전망입니다. 이에 따라 복지 지출이 늘어나고 있습니다. 세대 간 갈등도 존재합니다. 이러한 문제들을 해결하기 위해 다양한 정책이 시행되고 있습니다.', NULL),
  
  ('ko-adv-2', 'text', 'ko', 8, 10, ARRAY['business', 'economy'], '한국 경제와 기업 문화', 'Korean economy and business culture',
   '한국은 세계 10위권의 경제 대국입니다. 삼성, 현대, LG, SK 등 대기업이 경제를 이끌고 있습니다. 이들 재벌 그룹은 GDP의 상당 부분을 차지합니다. 한국의 기업 문화는 독특한 특징이 있습니다. 위계질서가 뚜렷합니다. 상사에게 존댓말을 사용하고 예의를 갖춥니다. 회식 문화도 중요한 부분입니다. 팀워크와 관계 형성에 중요하다고 여겨집니다. 그러나 최근에는 변화가 일어나고 있습니다. MZ세대는 수평적 문화를 선호합니다. 워라밸을 중시하고 자기계발에 투자합니다. 기업들도 이에 맞춰 문화를 바꾸고 있습니다.', NULL),
  
  ('ko-adv-3', 'text', 'ko', 7, 7, ARRAY['history', 'culture'], '조선 시대의 유산', 'Legacy of the Joseon Dynasty',
   '조선 왕조는 1392년부터 1897년까지 약 500년간 지속되었습니다. 한국 문화의 근간을 형성한 시대입니다. 세종대왕은 한글을 창제하셨습니다. 백성들이 쉽게 글을 배울 수 있게 하려는 목적이었습니다. 과학 기술도 발전했습니다. 해시계, 물시계, 우량계 등을 발명했습니다. 유교 사상이 사회 전반에 영향을 미쳤습니다. 충효 사상과 예절을 중시했습니다. 양반 사회의 계급 구조가 있었습니다. 이 시대의 유산은 현대 한국에도 남아 있습니다. 어른 공경, 교육 중시 등의 가치관이 이어지고 있습니다.', NULL),

  -- Audio/Video Content
  ('ko-audio-1', 'audio', 'ko', 3, 5, ARRAY['daily-life', 'conversation'], '일상 대화 연습', 'Daily conversation practice',
   '가: 안녕하세요! 오랜만이에요. 나: 네, 정말 오랜만이에요. 잘 지냈어요? 가: 네, 잘 지냈어요. 요즘 뭐 해요? 나: 한국어 공부하고 있어요. 가: 오, 정말요? 어려워요? 나: 조금 어렵지만 재미있어요. 가: 화이팅! 열심히 하세요. 나: 감사합니다. 시간 있으면 커피 마실래요? 가: 좋아요! 어디로 갈까요? 나: 저기 카페 어때요? 가: 좋아요, 가요!', NULL),
  
  ('ko-audio-2', 'audio', 'ko', 4, 6, ARRAY['travel', 'directions'], '길 찾기', 'Asking for directions',
   '가: 실례합니다. 지하철역이 어디에 있어요? 나: 저기 편의점 보이세요? 거기서 오른쪽으로 가세요. 가: 오른쪽이요? 나: 네, 100미터 정도 직진하시면 있어요. 가: 얼마나 걸려요? 나: 걸어서 5분 정도요. 가: 감사합니다! 혹시 2호선 타려면요? 나: 2호선은 이 역에서 안 돼요. 3호선 타시고 을지로3가에서 갈아타세요. 가: 아, 알겠습니다. 정말 감사해요!', NULL),

  ('ko-video-1', 'video', 'ko', 5, 10, ARRAY['culture', 'traditions'], '한국의 전통 의상', 'Traditional Korean clothing',
   '한복은 한국의 전통 의상입니다. 역사가 2000년이 넘습니다. 여자 한복은 저고리와 치마로 구성됩니다. 저고리는 상의이고 치마는 하의입니다. 남자 한복은 저고리와 바지를 입습니다. 그 위에 조끼나 마고자를 입기도 합니다. 색상에도 의미가 있습니다. 빨간색은 행운과 부를 상징합니다. 파란색은 평화와 조화를 의미합니다. 현대에는 설날과 추석에 한복을 입습니다. 최근에는 생활한복이 유행하고 있습니다. 편하게 일상에서 입을 수 있는 한복입니다.', NULL),

  ('ko-video-2', 'video', 'ko', 6, 12, ARRAY['entertainment', 'sports'], '한국 스포츠 문화', 'Korean sports culture',
   '한국인들은 스포츠를 사랑합니다. 야구는 가장 인기 있는 스포츠 중 하나입니다. KBO 리그는 매년 수백만 관중을 동원합니다. 치맥과 함께 야구 관람하는 것이 문화입니다. 축구도 인기가 많습니다. 2002년 월드컵 4강 신화는 아직도 회자됩니다. 붉은 악마의 길거리 응원은 전설적입니다. 최근에는 e스포츠가 급성장했습니다. 한국은 e스포츠 강국입니다. 리그오브레전드, 오버워치 등에서 세계 정상입니다. 골프, 피겨스케이팅에서도 세계적인 선수들이 있습니다. 김연아 선수는 피겨의 전설입니다.', NULL)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- KOREAN FORGE PROMPTS - ADDITIONAL
-- ========================================

INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
-- Advanced Quick Fire
('quick_fire', 'ko', '10년 후 당신의 삶은 어떨 것 같아요? 자세히 설명해 주세요.', 6),
('quick_fire', 'ko', '한국 문화에서 가장 인상 깊은 점은 무엇이에요?', 5),
('quick_fire', 'ko', '요즘 스트레스를 어떻게 풀어요?', 4),
('quick_fire', 'ko', '최근에 본 영화나 드라마에 대해 이야기해 주세요.', 4),
('quick_fire', 'ko', '환경 문제에 대해 어떻게 생각해요?', 6),
('quick_fire', 'ko', '어릴 때 꿈이 뭐였어요? 지금은요?', 5),
('quick_fire', 'ko', 'AI가 미래에 어떤 영향을 줄 것 같아요?', 7),
('quick_fire', 'ko', '건강을 위해 무엇을 하고 있어요?', 4),

-- Grammar-focused Quick Fire
('quick_fire', 'ko', '"~아/어서"를 사용해서 이유를 설명해 주세요.', 5),
('quick_fire', 'ko', '"~(으)면"을 사용해서 조건문을 만들어 보세요.', 5),
('quick_fire', 'ko', '"~고 싶다"와 "~(으)려고 하다"의 차이를 설명해 주세요.', 6),
('quick_fire', 'ko', '"~는 것 같다"를 사용해서 추측을 표현해 보세요.', 6),

-- Writing Sprint - Advanced
('writing_sprint', 'ko', '한국에서 살아 본다면 어디에서 살고 싶어요? 그 이유는요?', 5),
('writing_sprint', 'ko', '당신의 가장 행복했던 순간에 대해 써 주세요.', 5),
('writing_sprint', 'ko', '기술이 우리 삶을 어떻게 변화시켰는지 써 주세요.', 7),
('writing_sprint', 'ko', '당신이 존경하는 사람에 대해 자세히 써 주세요.', 5),
('writing_sprint', 'ko', '당신 나라의 문화와 한국 문화를 비교해 보세요.', 6),
('writing_sprint', 'ko', '20년 후의 세계는 어떨까요? 예측해 보세요.', 7),

-- Translation - Intermediate to Advanced
('translation', 'ko', 'The weather is really nice today. Shall we go for a walk in the park?', 4),
('translation', 'ko', 'I have been living in Seoul for three years, and I still love this city.', 6),
('translation', 'ko', 'If you have time tomorrow, would you like to watch a movie together?', 5),
('translation', 'ko', 'I am sorry, but I cannot attend the meeting because I have another appointment.', 6),
('translation', 'ko', 'Even though learning Korean is difficult, it is very rewarding.', 6),
('translation', 'ko', 'Could you please speak more slowly? I am still a beginner.', 4),
('translation', 'ko', 'The restaurant that we went to last week was really delicious.', 5),
('translation', 'ko', 'I wish I had started learning Korean earlier.', 7),

-- Shadow Speak - Advanced
('shadow_speak', 'ko', '요즘 바빠서 연락을 못 했어요. 미안해요.', 4),
('shadow_speak', 'ko', '이 책을 다 읽으면 빌려줄게요.', 5),
('shadow_speak', 'ko', '제가 알기로는 그 가게가 오후 6시에 문을 닫아요.', 6),
('shadow_speak', 'ko', '그렇게 말씀하시니까 기분이 좋네요. 감사합니다.', 5),

-- Conversation scenarios
('conversation', 'ko', '병원에서 - 증상 설명하기', 5),
('conversation', 'ko', '은행에서 - 계좌 개설하기', 6),
('conversation', 'ko', '미용실에서 - 머리 스타일 설명하기', 5),
('conversation', 'ko', '부동산에서 - 집 구하기', 7);

-- ========================================
-- KOREAN DEFINITIONS - ADDITIONAL
-- ========================================

INSERT INTO public.definitions (language, word, definition, part_of_speech, examples) VALUES
  -- Common verbs
  ('ko', '가다', 'to go', 'verb', ARRAY['학교에 가요.', '집에 가고 싶어요.']),
  ('ko', '오다', 'to come', 'verb', ARRAY['친구가 왔어요.', '빨리 와 주세요.']),
  ('ko', '보다', 'to see, to watch', 'verb', ARRAY['영화를 봐요.', '뭘 보고 있어요?']),
  ('ko', '듣다', 'to hear, to listen', 'verb', ARRAY['음악을 들어요.', '잘 안 들려요.']),
  ('ko', '읽다', 'to read', 'verb', ARRAY['책을 읽어요.', '한글을 읽을 수 있어요.']),
  ('ko', '쓰다', 'to write, to use', 'verb', ARRAY['편지를 써요.', '연필을 써요.']),
  ('ko', '마시다', 'to drink', 'verb', ARRAY['커피를 마셔요.', '물 마실래요?']),
  ('ko', '자다', 'to sleep', 'verb', ARRAY['일찍 자요.', '잘 잤어요?']),
  ('ko', '일어나다', 'to wake up, to get up', 'verb', ARRAY['아침에 일어나요.', '늦게 일어났어요.']),
  ('ko', '만나다', 'to meet', 'verb', ARRAY['친구를 만나요.', '어디서 만날까요?']),
  ('ko', '알다', 'to know', 'verb', ARRAY['저는 알아요.', '몰라요.']),
  ('ko', '모르다', 'to not know', 'verb', ARRAY['저는 몰라요.', '왜 그런지 몰라요.']),
  ('ko', '있다', 'to exist, to have', 'verb/adjective', ARRAY['시간이 있어요.', '집에 있어요.']),
  ('ko', '없다', 'to not exist, to not have', 'verb/adjective', ARRAY['시간이 없어요.', '돈이 없어요.']),
  
  -- Common adjectives
  ('ko', '크다', 'to be big', 'adjective', ARRAY['집이 커요.', '큰 가방이에요.']),
  ('ko', '작다', 'to be small', 'adjective', ARRAY['신발이 작아요.', '작은 선물이에요.']),
  ('ko', '비싸다', 'to be expensive', 'adjective', ARRAY['이거 비싸요.', '너무 비싸요.']),
  ('ko', '싸다', 'to be cheap', 'adjective', ARRAY['이게 더 싸요.', '싼 거 없어요?']),
  ('ko', '맛있다', 'to be delicious', 'adjective', ARRAY['정말 맛있어요!', '뭐가 맛있어요?']),
  ('ko', '맛없다', 'to be not delicious', 'adjective', ARRAY['이거 맛없어요.', '별로 맛없었어요.']),
  ('ko', '예쁘다', 'to be pretty', 'adjective', ARRAY['꽃이 예뻐요.', '정말 예쁘네요!']),
  ('ko', '멋있다', 'to be cool, handsome', 'adjective', ARRAY['그 사람 멋있어요.', '멋있는 차예요.']),
  ('ko', '재미있다', 'to be fun, interesting', 'adjective', ARRAY['영화가 재미있어요.', '재미있는 이야기예요.']),
  ('ko', '재미없다', 'to be boring', 'adjective', ARRAY['수업이 재미없어요.', '재미없는 책이에요.']),
  ('ko', '어렵다', 'to be difficult', 'adjective', ARRAY['한국어가 어려워요.', '어려운 문제예요.']),
  ('ko', '쉽다', 'to be easy', 'adjective', ARRAY['이건 쉬워요.', '쉬운 질문이에요.']),
  ('ko', '덥다', 'to be hot (weather)', 'adjective', ARRAY['오늘 더워요.', '여름은 더워요.']),
  ('ko', '춥다', 'to be cold (weather)', 'adjective', ARRAY['밖이 추워요.', '겨울은 추워요.']),
  
  -- Common nouns
  ('ko', '시간', 'time', 'noun', ARRAY['시간이 없어요.', '시간 있어요?']),
  ('ko', '사람', 'person, people', 'noun', ARRAY['많은 사람이 있어요.', '좋은 사람이에요.']),
  ('ko', '일', 'work, thing, matter', 'noun', ARRAY['일하러 가요.', '무슨 일이에요?']),
  ('ko', '말', 'word, language, horse', 'noun', ARRAY['한국말 해요.', '무슨 말이에요?']),
  ('ko', '친구', 'friend', 'noun', ARRAY['친구를 만나요.', '제 친구예요.']),
  ('ko', '학교', 'school', 'noun', ARRAY['학교에 가요.', '어떤 학교 다녀요?']),
  ('ko', '회사', 'company', 'noun', ARRAY['회사에서 일해요.', '회사가 어디에 있어요?']),
  ('ko', '나라', 'country', 'noun', ARRAY['어느 나라에서 왔어요?', '좋은 나라예요.']),
  ('ko', '음식', 'food', 'noun', ARRAY['한국 음식 좋아해요.', '맛있는 음식이에요.']),
  ('ko', '날씨', 'weather', 'noun', ARRAY['날씨가 좋아요.', '오늘 날씨 어때요?']),
  ('ko', '영화', 'movie', 'noun', ARRAY['영화 볼래요?', '좋은 영화예요.']),
  ('ko', '노래', 'song', 'noun', ARRAY['노래 불러요.', '이 노래 알아요?']),
  ('ko', '책', 'book', 'noun', ARRAY['책을 읽어요.', '좋은 책이에요.']),
  ('ko', '물', 'water', 'noun', ARRAY['물 주세요.', '물 마실래요?']),
  ('ko', '돈', 'money', 'noun', ARRAY['돈이 없어요.', '얼마예요?'])
ON CONFLICT (language, word) DO NOTHING;
