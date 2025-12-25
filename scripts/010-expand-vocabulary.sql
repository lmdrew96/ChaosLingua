-- 010: Expand Vocabulary and Definitions
-- Additional vocabulary words and phrases for both Korean and Romanian

-- ========================================
-- KOREAN VOCABULARY - THEMED SETS
-- ========================================

-- Food and Dining
INSERT INTO public.definitions (language, word, definition, part_of_speech, examples) VALUES
  ('ko', '밥', 'rice, meal', 'noun', ARRAY['밥 먹었어요?', '밥 한 공기 주세요.']),
  ('ko', '국', 'soup', 'noun', ARRAY['국이 맛있어요.', '된장국 좋아해요.']),
  ('ko', '반찬', 'side dishes', 'noun', ARRAY['반찬이 많아요.', '반찬 더 주세요.']),
  ('ko', '고기', 'meat', 'noun', ARRAY['고기 먹을래요?', '삼겹살은 돼지고기예요.']),
  ('ko', '생선', 'fish', 'noun', ARRAY['생선회 좋아해요.', '생선을 구워요.']),
  ('ko', '야채', 'vegetables', 'noun', ARRAY['야채 많이 먹어요.', '신선한 야채예요.']),
  ('ko', '과일', 'fruit', 'noun', ARRAY['과일이 달아요.', '어떤 과일 좋아해요?']),
  ('ko', '식당', 'restaurant', 'noun', ARRAY['식당에 가요.', '맛있는 식당 알아요?']),
  ('ko', '주문하다', 'to order', 'verb', ARRAY['주문하시겠어요?', '뭘 주문할까요?']),
  ('ko', '계산하다', 'to pay, calculate', 'verb', ARRAY['계산해 주세요.', '카드로 계산할게요.']),
  
  -- Weather and Seasons
  ('ko', '봄', 'spring', 'noun', ARRAY['봄이 왔어요.', '봄에 꽃이 피어요.']),
  ('ko', '여름', 'summer', 'noun', ARRAY['여름은 더워요.', '여름 방학이에요.']),
  ('ko', '가을', 'autumn, fall', 'noun', ARRAY['가을 단풍이 예뻐요.', '가을이 좋아요.']),
  ('ko', '겨울', 'winter', 'noun', ARRAY['겨울에 눈이 와요.', '겨울은 추워요.']),
  ('ko', '비', 'rain', 'noun', ARRAY['비가 와요.', '우산 있어요?']),
  ('ko', '눈', 'snow, eye', 'noun', ARRAY['눈이 와요.', '눈이 예뻐요.']),
  ('ko', '바람', 'wind', 'noun', ARRAY['바람이 불어요.', '바람이 시원해요.']),
  ('ko', '구름', 'cloud', 'noun', ARRAY['구름이 많아요.', '구름 한 점 없어요.']),
  ('ko', '해', 'sun', 'noun', ARRAY['해가 떠요.', '해가 밝아요.']),
  ('ko', '달', 'moon, month', 'noun', ARRAY['달이 밝아요.', '이번 달에요.']),
  
  -- Body Parts
  ('ko', '얼굴', 'face', 'noun', ARRAY['얼굴이 예뻐요.', '얼굴을 씻어요.']),
  ('ko', '눈', 'eye', 'noun', ARRAY['눈이 커요.', '눈을 감아요.']),
  ('ko', '코', 'nose', 'noun', ARRAY['코가 높아요.', '코가 막혔어요.']),
  ('ko', '입', 'mouth', 'noun', ARRAY['입을 벌려요.', '입이 작아요.']),
  ('ko', '귀', 'ear', 'noun', ARRAY['귀가 아파요.', '귀걸이 예뻐요.']),
  ('ko', '손', 'hand', 'noun', ARRAY['손을 씻어요.', '손이 예뻐요.']),
  ('ko', '발', 'foot', 'noun', ARRAY['발이 아파요.', '발이 커요.']),
  ('ko', '다리', 'leg', 'noun', ARRAY['다리가 길어요.', '다리가 아파요.']),
  ('ko', '팔', 'arm', 'noun', ARRAY['팔이 아파요.', '팔을 들어요.']),
  ('ko', '배', 'stomach, boat, pear', 'noun', ARRAY['배가 아파요.', '배가 고파요.']),
  
  -- Emotions and States
  ('ko', '행복하다', 'to be happy', 'adjective', ARRAY['정말 행복해요.', '행복한 시간이었어요.']),
  ('ko', '슬프다', 'to be sad', 'adjective', ARRAY['왜 슬퍼요?', '슬픈 영화예요.']),
  ('ko', '화나다', 'to be angry', 'adjective', ARRAY['화나지 마세요.', '왜 화났어요?']),
  ('ko', '무섭다', 'to be scary, scared', 'adjective', ARRAY['무서워요!', '무서운 영화예요.']),
  ('ko', '피곤하다', 'to be tired', 'adjective', ARRAY['너무 피곤해요.', '피곤해 보여요.']),
  ('ko', '배고프다', 'to be hungry', 'adjective', ARRAY['배고파요.', '배고프지 않아요.']),
  ('ko', '목마르다', 'to be thirsty', 'adjective', ARRAY['목말라요.', '물 마실래요?']),
  ('ko', '아프다', 'to be sick, hurt', 'adjective', ARRAY['어디가 아파요?', '머리가 아파요.']),
  ('ko', '건강하다', 'to be healthy', 'adjective', ARRAY['건강하세요!', '건강이 중요해요.']),
  ('ko', '바쁘다', 'to be busy', 'adjective', ARRAY['요즘 바빠요.', '바쁜 하루였어요.']),
  
  -- Common Expressions
  ('ko', '괜찮다', 'to be okay, fine', 'adjective', ARRAY['괜찮아요?', '괜찮아요, 걱정 마세요.']),
  ('ko', '필요하다', 'to need', 'verb', ARRAY['뭐가 필요해요?', '도움이 필요해요.']),
  ('ko', '중요하다', 'to be important', 'adjective', ARRAY['이거 중요해요.', '중요한 일이에요.']),
  ('ko', '특별하다', 'to be special', 'adjective', ARRAY['특별한 날이에요.', '뭔가 특별해요.']),
  ('ko', '다르다', 'to be different', 'adjective', ARRAY['이건 달라요.', '다른 거 없어요?']),
  ('ko', '같다', 'to be the same', 'adjective', ARRAY['이거랑 같아요.', '생각이 같아요.']),
  ('ko', '그렇다', 'to be so, like that', 'adjective', ARRAY['그래요?', '그렇군요!']),
  ('ko', '이렇다', 'to be like this', 'adjective', ARRAY['이래요.', '이렇게 해요.']),
  
  -- Transportation
  ('ko', '버스', 'bus', 'noun', ARRAY['버스 타요.', '몇 번 버스예요?']),
  ('ko', '지하철', 'subway', 'noun', ARRAY['지하철이 빨라요.', '지하철역 어디예요?']),
  ('ko', '택시', 'taxi', 'noun', ARRAY['택시 탈까요?', '택시 불러 주세요.']),
  ('ko', '비행기', 'airplane', 'noun', ARRAY['비행기로 가요.', '비행기 표 있어요?']),
  ('ko', '기차', 'train', 'noun', ARRAY['기차 타요.', 'KTX는 빠른 기차예요.']),
  ('ko', '자동차', 'car', 'noun', ARRAY['자동차가 있어요?', '새 자동차예요.']),
  ('ko', '자전거', 'bicycle', 'noun', ARRAY['자전거 타요.', '자전거 빌릴 수 있어요?']),
  ('ko', '역', 'station', 'noun', ARRAY['역이 어디예요?', '서울역에서 만나요.']),
  ('ko', '타다', 'to ride, take', 'verb', ARRAY['버스 타세요.', '뭘 타고 왔어요?']),
  ('ko', '내리다', 'to get off', 'verb', ARRAY['여기서 내려요.', '다음 역에서 내리세요.']),
  
  -- Time Expressions
  ('ko', '어제', 'yesterday', 'noun', ARRAY['어제 뭐 했어요?', '어제는 바빴어요.']),
  ('ko', '오늘', 'today', 'noun', ARRAY['오늘 날씨 좋아요.', '오늘 뭐 해요?']),
  ('ko', '내일', 'tomorrow', 'noun', ARRAY['내일 만나요.', '내일 시간 있어요?']),
  ('ko', '지금', 'now', 'noun', ARRAY['지금 뭐 해요?', '지금 바빠요.']),
  ('ko', '나중에', 'later', 'adverb', ARRAY['나중에 해요.', '나중에 전화할게요.']),
  ('ko', '항상', 'always', 'adverb', ARRAY['항상 고마워요.', '항상 늦어요.']),
  ('ko', '가끔', 'sometimes', 'adverb', ARRAY['가끔 만나요.', '가끔 영화 봐요.']),
  ('ko', '자주', 'often', 'adverb', ARRAY['자주 와요.', '자주 운동해요.']),
  ('ko', '아직', 'still, yet', 'adverb', ARRAY['아직 안 왔어요.', '아직 못 했어요.']),
  ('ko', '벌써', 'already', 'adverb', ARRAY['벌써 왔어요?', '벌써 끝났어요.'])
ON CONFLICT (language, word) DO NOTHING;

-- ========================================
-- ROMANIAN VOCABULARY - THEMED SETS
-- ========================================

-- Food and Dining
INSERT INTO public.definitions (language, word, definition, part_of_speech, examples) VALUES
  ('ro', 'pâine', 'bread', 'noun', ARRAY['Vreau pâine proaspătă.', 'Pâinea e caldă.']),
  ('ro', 'supă', 'soup', 'noun', ARRAY['Supa e delicioasă.', 'O supă de pui, vă rog.']),
  ('ro', 'salată', 'salad', 'noun', ARRAY['Vreau o salată verde.', 'Salata e proaspătă.']),
  ('ro', 'carne', 'meat', 'noun', ARRAY['Mănânc carne de vită.', 'Carnea e fragedă.']),
  ('ro', 'pește', 'fish', 'noun', ARRAY['Îmi place peștele.', 'Pește prăjit sau la grătar?']),
  ('ro', 'legume', 'vegetables', 'noun', ARRAY['Mănânc multe legume.', 'Legumele sunt proaspete.']),
  ('ro', 'fructe', 'fruits', 'noun', ARRAY['Fructele sunt dulci.', 'Ce fructe ai?']),
  ('ro', 'restaurant', 'restaurant', 'noun', ARRAY['Mergem la restaurant?', 'Un restaurant bun.']),
  ('ro', 'a comanda', 'to order', 'verb', ARRAY['Vreau să comand.', 'Ce comandați?']),
  ('ro', 'a plăti', 'to pay', 'verb', ARRAY['Vreau să plătesc.', 'Pot plăti cu cardul?']),
  ('ro', 'desert', 'dessert', 'noun', ARRAY['Doriți desert?', 'Ce desert aveți?']),
  ('ro', 'băutură', 'drink, beverage', 'noun', ARRAY['Ce băutură doriți?', 'O băutură răcoritoare.']),
  
  -- Weather and Seasons
  ('ro', 'primăvară', 'spring', 'noun', ARRAY['Primăvara e frumoasă.', 'Vine primăvara!']),
  ('ro', 'vară', 'summer', 'noun', ARRAY['Vara e caldă.', 'Ce faci vara?']),
  ('ro', 'toamnă', 'autumn, fall', 'noun', ARRAY['Toamna e colorată.', 'Îmi place toamna.']),
  ('ro', 'iarnă', 'winter', 'noun', ARRAY['Iarna ninge.', 'Iarna e grea.']),
  ('ro', 'ploaie', 'rain', 'noun', ARRAY['Plouă afară.', 'O ploaie de vară.']),
  ('ro', 'zăpadă', 'snow', 'noun', ARRAY['Ninge! Cade zăpadă.', 'Multă zăpadă.']),
  ('ro', 'vânt', 'wind', 'noun', ARRAY['Bate vântul.', 'Vânt puternic.']),
  ('ro', 'nor', 'cloud', 'noun', ARRAY['Sunt nori pe cer.', 'Nori de ploaie.']),
  ('ro', 'soare', 'sun', 'noun', ARRAY['Soarele strălucește.', 'E soare afară.']),
  ('ro', 'lună', 'moon, month', 'noun', ARRAY['Luna e plină.', 'Luna asta sunt ocupat.']),
  
  -- Body Parts
  ('ro', 'față', 'face', 'noun', ARRAY['Are o față frumoasă.', 'Spală-te pe față.']),
  ('ro', 'ochi', 'eye(s)', 'noun', ARRAY['Are ochi albaștri.', 'Închide ochii.']),
  ('ro', 'nas', 'nose', 'noun', ARRAY['Nasul e roșu.', 'Am nasul înfundat.']),
  ('ro', 'gură', 'mouth', 'noun', ARRAY['Deschide gura.', 'Gura mare.']),
  ('ro', 'ureche', 'ear', 'noun', ARRAY['Mă doare urechea.', 'Urechile mari.']),
  ('ro', 'mână', 'hand', 'noun', ARRAY['Dă-mi mâna.', 'Spală-te pe mâini.']),
  ('ro', 'picior', 'foot, leg', 'noun', ARRAY['Mă doare piciorul.', 'Pe jos, pe picioare.']),
  ('ro', 'braț', 'arm', 'noun', ARRAY['Mă doare brațul.', 'Brațe puternice.']),
  ('ro', 'cap', 'head', 'noun', ARRAY['Mă doare capul.', 'Din cap până-n picioare.']),
  ('ro', 'inimă', 'heart', 'noun', ARRAY['Inima bate.', 'Cu toată inima.']),
  
  -- Emotions and States
  ('ro', 'fericit', 'happy', 'adjective', ARRAY['Sunt foarte fericit.', 'O viață fericită.']),
  ('ro', 'trist', 'sad', 'adjective', ARRAY['De ce ești trist?', 'O poveste tristă.']),
  ('ro', 'supărat', 'upset, angry', 'adjective', ARRAY['Nu fi supărat!', 'E supărat pe mine.']),
  ('ro', 'speriat', 'scared', 'adjective', ARRAY['Sunt speriat.', 'Nu fi speriat!']),
  ('ro', 'obosit', 'tired', 'adjective', ARRAY['Sunt foarte obosit.', 'Pari obosit.']),
  ('ro', 'flămând', 'hungry', 'adjective', ARRAY['Sunt flămând.', 'Copilul e flămând.']),
  ('ro', 'însetat', 'thirsty', 'adjective', ARRAY['Sunt însetat.', 'Vrei apă?']),
  ('ro', 'bolnav', 'sick, ill', 'adjective', ARRAY['Sunt bolnav.', 'E bolnav de gripă.']),
  ('ro', 'sănătos', 'healthy', 'adjective', ARRAY['Fii sănătos!', 'Mâncare sănătoasă.']),
  ('ro', 'ocupat', 'busy', 'adjective', ARRAY['Sunt ocupat acum.', 'Ești ocupat?']),
  
  -- Common Expressions
  ('ro', 'bine', 'well, good, fine', 'adverb', ARRAY['Sunt bine.', 'Foarte bine!']),
  ('ro', 'necesar', 'necessary', 'adjective', ARRAY['Este necesar.', 'Lucruri necesare.']),
  ('ro', 'important', 'important', 'adjective', ARRAY['Este foarte important.', 'O decizie importantă.']),
  ('ro', 'special', 'special', 'adjective', ARRAY['O zi specială.', 'Ceva special.']),
  ('ro', 'diferit', 'different', 'adjective', ARRAY['Este diferit.', 'Lucruri diferite.']),
  ('ro', 'același', 'the same', 'adjective', ARRAY['Este același lucru.', 'Aceeași poveste.']),
  ('ro', 'sigur', 'sure, certain, safe', 'adjective', ARRAY['Ești sigur?', 'Sigur că da!']),
  ('ro', 'posibil', 'possible', 'adjective', ARRAY['Este posibil.', 'Orice e posibil.']),
  
  -- Transportation
  ('ro', 'autobuz', 'bus', 'noun', ARRAY['Autobuzul vine.', 'Ce autobuz iau?']),
  ('ro', 'metrou', 'subway, metro', 'noun', ARRAY['Iau metroul.', 'Stația de metrou.']),
  ('ro', 'taxi', 'taxi', 'noun', ARRAY['Chem un taxi.', 'Taxiul a venit.']),
  ('ro', 'avion', 'airplane', 'noun', ARRAY['Zbor cu avionul.', 'Avionul decolează.']),
  ('ro', 'tren', 'train', 'noun', ARRAY['Trenul pleacă.', 'Merg cu trenul.']),
  ('ro', 'mașină', 'car', 'noun', ARRAY['Am o mașină.', 'Mașină nouă sau veche?']),
  ('ro', 'bicicletă', 'bicycle', 'noun', ARRAY['Merg cu bicicleta.', 'Îmi place bicicleta.']),
  ('ro', 'gară', 'train station', 'noun', ARRAY['Unde e gara?', 'La gară.']),
  ('ro', 'a urca', 'to get on, to climb', 'verb', ARRAY['Urcă în autobuz.', 'Urcăm scările.']),
  ('ro', 'a coborî', 'to get off, to descend', 'verb', ARRAY['Cobor la următoarea.', 'Coborâm aici.']),
  
  -- Time Expressions
  ('ro', 'ieri', 'yesterday', 'adverb', ARRAY['Ieri am fost acasă.', 'Ce ai făcut ieri?']),
  ('ro', 'astăzi', 'today', 'adverb', ARRAY['Astăzi e frumos.', 'Ce faci astăzi?']),
  ('ro', 'mâine', 'tomorrow', 'adverb', ARRAY['Ne vedem mâine.', 'Mâine plec.']),
  ('ro', 'acum', 'now', 'adverb', ARRAY['Acum sunt ocupat.', 'Vino acum!']),
  ('ro', 'mai târziu', 'later', 'adverb', ARRAY['Mai târziu vorbim.', 'Poate mai târziu.']),
  ('ro', 'întotdeauna', 'always', 'adverb', ARRAY['Întotdeauna la timp.', 'Te iubesc întotdeauna.']),
  ('ro', 'uneori', 'sometimes', 'adverb', ARRAY['Uneori merg la film.', 'Uneori e greu.']),
  ('ro', 'des', 'often', 'adverb', ARRAY['Vin des aici.', 'Cât de des?']),
  ('ro', 'încă', 'still, yet', 'adverb', ARRAY['Încă nu a venit.', 'Încă mai am timp.']),
  ('ro', 'deja', 'already', 'adverb', ARRAY['Deja ai plecat?', 'Am terminat deja.']),
  
  -- Places
  ('ro', 'oraș', 'city', 'noun', ARRAY['Un oraș mare.', 'Ce oraș frumos!']),
  ('ro', 'sat', 'village', 'noun', ARRAY['Un sat mic.', 'Bunicii stau la sat.']),
  ('ro', 'stradă', 'street', 'noun', ARRAY['Pe această stradă.', 'Strada principală.']),
  ('ro', 'piață', 'market, square', 'noun', ARRAY['Merg la piață.', 'Piața centrală.']),
  ('ro', 'magazin', 'store, shop', 'noun', ARRAY['Deschide magazinul.', 'Un magazin mare.']),
  ('ro', 'spital', 'hospital', 'noun', ARRAY['E la spital.', 'Spitalul e aproape.']),
  ('ro', 'hotel', 'hotel', 'noun', ARRAY['Stau la hotel.', 'Un hotel bun.']),
  ('ro', 'aeroport', 'airport', 'noun', ARRAY['Merg la aeroport.', 'Aeroportul e departe.']),
  ('ro', 'biserică', 'church', 'noun', ARRAY['O biserică veche.', 'Duminica la biserică.']),
  ('ro', 'muzeu', 'museum', 'noun', ARRAY['Vizităm muzeul.', 'Un muzeu interesant.'])
ON CONFLICT (language, word) DO NOTHING;

-- ========================================
-- COMMON PHRASES - BOTH LANGUAGES
-- ========================================

-- Korean Phrases
INSERT INTO public.definitions (language, word, definition, part_of_speech, examples) VALUES
  ('ko', '잠깐만요', 'Just a moment', 'phrase', ARRAY['잠깐만요, 곧 갈게요.', '잠깐만요!']),
  ('ko', '천천히', 'slowly', 'adverb', ARRAY['천천히 말해 주세요.', '천천히 가세요.']),
  ('ko', '다시', 'again', 'adverb', ARRAY['다시 한번요.', '다시 말해 주세요.']),
  ('ko', '조금', 'a little', 'adverb', ARRAY['조금만 주세요.', '조금 알아요.']),
  ('ko', '많이', 'a lot, much', 'adverb', ARRAY['많이 먹어요.', '많이 힘들어요.']),
  ('ko', '정말', 'really', 'adverb', ARRAY['정말요?', '정말 좋아요!']),
  ('ko', '아마', 'maybe, probably', 'adverb', ARRAY['아마 그럴 거예요.', '아마 내일 와요.']),
  ('ko', '물론', 'of course', 'adverb', ARRAY['물론이죠!', '물론 알아요.']),
  ('ko', '혹시', 'by any chance', 'adverb', ARRAY['혹시 시간 있어요?', '혹시 아세요?']),
  ('ko', '그런데', 'but, by the way', 'conjunction', ARRAY['그런데요...', '그런데 왜요?'])
ON CONFLICT (language, word) DO NOTHING;

-- Romanian Phrases  
INSERT INTO public.definitions (language, word, definition, part_of_speech, examples) VALUES
  ('ro', 'puțin', 'a little', 'adverb', ARRAY['Puțin, te rog.', 'Vorbesc puțin română.']),
  ('ro', 'mult', 'much, a lot', 'adverb', ARRAY['Mulțumesc mult!', 'Muncesc mult.']),
  ('ro', 'chiar', 'really, even', 'adverb', ARRAY['Chiar așa?', 'Chiar acum.']),
  ('ro', 'poate', 'maybe, perhaps', 'adverb', ARRAY['Poate mâine.', 'Poate ai dreptate.']),
  ('ro', 'desigur', 'of course', 'adverb', ARRAY['Desigur!', 'Desigur că da.']),
  ('ro', 'cumva', 'somehow, by any chance', 'adverb', ARRAY['Cumva știi?', 'Cumva pot ajuta?']),
  ('ro', 'totuși', 'however, still', 'adverb', ARRAY['Totuși, cred că...', 'Totuși e frumos.']),
  ('ro', 'deci', 'so, therefore', 'conjunction', ARRAY['Deci, ce facem?', 'Deci ai venit!']),
  ('ro', 'dar', 'but', 'conjunction', ARRAY['Dar de ce?', 'Frumos, dar scump.']),
  ('ro', 'sau', 'or', 'conjunction', ARRAY['Cafea sau ceai?', 'Acum sau mai târziu?']),
  ('ro', 'te rog', 'please', 'phrase', ARRAY['Te rog, ajută-mă.', 'Un moment, te rog.']),
  ('ro', 'cu plăcere', 'you are welcome, with pleasure', 'phrase', ARRAY['Cu plăcere!', 'Cu multă plăcere.']),
  ('ro', 'nu-i nimic', 'it is nothing, no problem', 'phrase', ARRAY['Nu-i nimic!', 'Lasă, nu-i nimic.']),
  ('ro', 'ce mai faci', 'how are you', 'phrase', ARRAY['Ce mai faci?', 'Ce mai faceți?']),
  ('ro', 'la mulți ani', 'happy birthday, happy new year', 'phrase', ARRAY['La mulți ani!', 'La mulți ani cu sănătate!'])
ON CONFLICT (language, word) DO NOTHING;
