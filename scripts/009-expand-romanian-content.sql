-- 009: Expand Romanian Language Content
-- Additional content items, forge prompts, and definitions for Romanian study modes

-- ========================================
-- ROMANIAN CONTENT ITEMS
-- ========================================

INSERT INTO content_items (id, type, language, difficulty, length_minutes, topics, title, description, transcript, thumbnail_url) VALUES
  -- Beginner Romanian Content (Difficulty 1-3)
  ('ro-beginner-1', 'text', 'ro', 2, 3, ARRAY['daily-life', 'greetings'], 'Primele cuvinte în română', 'First words in Romanian',
   'Bună ziua! Mă numesc Ana. Sunt din România. Locuiesc în București. Am douăzeci și cinci de ani. Sunt studentă. Învăț limba engleză. Îmi place să citesc. Îmi place și muzica. Astăzi este o zi frumoasă. Soarele strălucește. Sunt fericită. La revedere!', NULL),
  
  ('ro-beginner-2', 'text', 'ro', 2, 3, ARRAY['daily-life', 'numbers'], 'Numerele în română', 'Numbers in Romanian',
   'Să învățăm numerele! Unu, doi, trei, patru, cinci. Șase, șapte, opt, nouă, zece. În română, numerele au forme diferite. Când numărăm lucruri, folosim: o carte, două cărți, trei cărți. Un băiat, doi băieți, trei băieți. Zece plus cinci este cincisprezece. Douăzeci minus cinci este cincisprezece. Acum știm să numărăm!', NULL),
  
  ('ro-beginner-3', 'text', 'ro', 3, 4, ARRAY['daily-life', 'family'], 'Familia mea', 'My family',
   'Familia mea este mare. Am părinți, frați și bunici. Tatăl meu se numește Ion. El este inginer. Merge la serviciu în fiecare zi. Mama mea se numește Maria. Ea este profesoară. Învață copiii la școală. Am un frate și o soră. Fratele meu este mai mare. Sora mea este mai mică. Bunicii locuiesc la țară. Îi vizităm în weekend. Ne place să petrecem timp împreună.', NULL),
  
  ('ro-beginner-4', 'text', 'ro', 3, 4, ARRAY['daily-life', 'shopping'], 'La cumpărături', 'Going shopping',
   'Astăzi am mers la magazin. Am cumpărat multe lucruri. Am luat pâine proaspătă. Am luat și lapte. Fructele arătau bine. Am ales mere și banane. Legumele erau proaspete. Am cumpărat roșii și castraveți. La casă am plătit cu cardul. Casiera a fost amabilă. Mi-a dat bonul. Am pus totul în sacoșă. Acasă am aranjat cumpărăturile. Frigiderul este plin acum!', NULL),

  -- Intermediate Romanian Content (Difficulty 4-6)
  ('ro-inter-1', 'text', 'ro', 4, 5, ARRAY['culture', 'etiquette'], 'Bunele maniere în România', 'Good manners in Romania',
   'În România, bunele maniere sunt importante. Când intri într-o cameră, salută pe toți cei prezenți. Spune "Bună ziua" sau "Bună seara" în funcție de oră. La masă, așteaptă să se așeze toți înainte de a începe să mănânci. Este politicos să spui "Poftă bună!" înainte de masă. După masă, mulțumește gazdei. Când primești un cadou, deschide-l imediat și mulțumește. În autobuz, oferă locul persoanelor în vârstă. Aceste gesturi arată respect și educație.', NULL),
  
  ('ro-inter-2', 'text', 'ro', 5, 6, ARRAY['entertainment', 'music'], 'Muzica tradițională românească', 'Traditional Romanian music',
   'Muzica tradițională românească este bogată și variată. Fiecare regiune are stilul său propriu. Doina este un gen muzical specific românesc. Exprimă sentimente de dor și melancolie. Lăutarii sunt muzicienii tradiționali. Ei cântă la nunți și sărbători. Instrumentele tradiționale includ naiul, țambalul și cobza. Maria Tănase este cea mai faimoasă cântăreață de muzică populară. Vocea ei este inconfundabilă. În ultimii ani, muzica tradițională s-a amestecat cu stiluri moderne. Subcarpați și Zdob și Zdub sunt exemple de acest fenomen.', NULL),
  
  ('ro-inter-3', 'text', 'ro', 5, 6, ARRAY['travel', 'tourism'], 'Ghid turistic pentru România', 'Travel guide for Romania',
   'România este o țară cu peisaje diverse și minunate. Carpații traversează țara de la nord la sud. Bran este celebru pentru castelul lui Dracula. Mii de turiști îl vizitează anual. Delta Dunării este unică în Europa. Este paradisul păsărilor și al pescarilor. Sibiul a fost capitală culturală europeană. Are o cetate medievală bine conservată. Marea Neagră oferă plaje frumoase. Constanța și Mamaia sunt stațiuni populare. Bucovina are mănăstiri pictate. Sunt incluse în patrimoniul UNESCO. Transilvania are sate autentice și peisaje montane.', NULL),
  
  ('ro-inter-4', 'text', 'ro', 5, 5, ARRAY['food', 'cooking'], 'Rețeta de sarmale', 'How to make sarmale',
   'Sarmalele sunt mâncarea tradițională românească. Se fac la ocazii speciale. Iată cum le prepari. Ai nevoie de carne tocată, orez, ceapă și varză murată. Amestecă carnea cu orezul fiert pe jumătate. Adaugă ceapa călită și condimente. Sare, piper, boia și cimbru. Întinde frunzele de varză. Pune o lingură de compoziție pe fiecare frunză. Rulează strâns. Așază sarmalele în oală. Alternează cu straturi de varză tocată. Adaugă apă și bulion de roșii. Lasă să fiarbă la foc mic patru ore. Servește cu smântână și mămăliguță fierbinte.', NULL),
  
  ('ro-inter-5', 'video', 'ro', 4, 8, ARRAY['entertainment', 'film'], 'Cinematografia românească', 'Romanian cinema',
   'Cinematografia românească a cunoscut o renaștere după anul 2000. Noul val românesc a câștigat premii internaționale. "4 luni, 3 săptămâni și 2 zile" a luat Palme d Or la Cannes. Regizorul Cristian Mungiu este recunoscut mondial. "Moartea domnului Lăzărescu" a fost primul film al noului val. Cristi Puiu l-a regizat. Filmele românești sunt adesea realiste. Explorează teme sociale și istorice. Actorii români sunt foarte talentați. Luminița Gheorghiu și Vlad Ivanov sunt cunoscuți internațional. Festivalul de Film de la Transilvania promovează cinema independent.', NULL),

  -- Advanced Romanian Content (Difficulty 7-9)
  ('ro-adv-1', 'text', 'ro', 7, 8, ARRAY['society', 'issues'], 'Probleme sociale în România', 'Social issues in Romania',
   'România contemporană se confruntă cu diverse provocări sociale. Emigrația reprezintă una dintre cele mai mari probleme. Aproximativ patru milioane de români trăiesc în străinătate. Acest fenomen a dus la îmbătrânirea populației. Mulți copii cresc fără părinți, în grija bunicilor. Sistemul de sănătate are nevoie de reformă. Lipsesc medicii și asistentele. Corupția rămâne o problemă persistentă. Protestele din 2017 au arătat nemulțumirea cetățenilor. Inegalitățile dintre mediul urban și cel rural sunt evidente. Infrastructura în zonele rurale este slab dezvoltată. Totuși, societatea civilă devine tot mai activă.', NULL),
  
  ('ro-adv-2', 'text', 'ro', 8, 10, ARRAY['business', 'economy'], 'Economia și cultura de afaceri', 'Economy and business culture',
   'Economia românească s-a transformat semnificativ după 1989. Tranziția de la comunism la capitalism a fost dificilă. Privatizarea a adus investitori străini. Astăzi, România face parte din Uniunea Europeană. PIB-ul a crescut constant în ultimele decenii. Sectorul IT este deosebit de dinamic. București și Cluj-Napoca sunt hub-uri tehnologice importante. Cultura de afaceri reflectă influențe diverse. Relațiile personale contează în negocieri. Punctualitatea este apreciată, dar întâlnirile pot începe cu conversații informale. Ierarhia organizațională tinde să fie respectată. Generația tânără aduce valori noi. Antreprenoriatul este în creștere. Start-up-urile românești câștigă recunoaștere internațională.', NULL),
  
  ('ro-adv-3', 'text', 'ro', 7, 7, ARRAY['history', 'culture'], 'Istoria României moderne', 'History of modern Romania',
   'România modernă s-a format în 1859. Alexandru Ioan Cuza a unit Principatele Române. În 1918, s-a realizat Marea Unire. Transilvania, Bucovina și Basarabia s-au unit cu Regatul României. Perioada interbelică a fost una de dezvoltare culturală. Carol al II-lea a instaurat dictatura regală în 1938. Al Doilea Război Mondial a adus schimbări dramatice. În 1947, regele Mihai a fost forțat să abdice. A urmat perioada comunistă. Nicolae Ceaușescu a condus țara din 1965 până în 1989. Revoluția din decembrie 1989 a pus capăt dictaturii. Tranziția către democrație a fost graduală. În 2007, România a devenit membră a Uniunii Europene.', NULL),

  -- Audio/Video Content
  ('ro-audio-1', 'audio', 'ro', 3, 5, ARRAY['daily-life', 'conversation'], 'Conversație la cafenea', 'Conversation at a café',
   'A: Bună ziua! O cafea, vă rog. B: Bună ziua! Ce fel de cafea doriți? A: Un espresso, vă rog. Cu zahăr? B: Nu, fără zahăr. A: Doriți și altceva? Un croissant, o prăjitură? B: Da, un croissant cu unt, vă rog. A: Imediat! Luați loc, vă aduc eu. B: Mulțumesc! Cât costă? A: Espresso-ul este opt lei și croissantul șase lei. B: Deci paisprezece lei în total. Poftiți. A: Mulțumesc! Poftă bună! B: Mulțumesc, la revedere!', NULL),
  
  ('ro-audio-2', 'audio', 'ro', 4, 6, ARRAY['travel', 'directions'], 'Cum ajung la...?', 'How do I get to...?',
   'A: Scuzați-mă, cum ajung la gară? B: Mergeți drept până la semafor. Apoi luați-o la stânga. A: La stânga la semafor? B: Da, exact. Mergeți vreo cinci minute pe strada aceea. A: Și după aceea? B: Veți vedea o piață mare. Gara este chiar lângă piață. A: Este departe? B: Nu, cam zece minute pe jos. A: Pot lua și autobuzul? B: Da, autobuzul 41 merge direct la gară. Stația este aici, la colț. A: Perfect! Mulțumesc foarte mult! B: Cu plăcere! Drum bun!', NULL),

  ('ro-video-1', 'video', 'ro', 5, 10, ARRAY['culture', 'traditions'], 'Tradițiile de Paște', 'Easter traditions',
   'Paștele este cea mai importantă sărbătoare pentru români. Pregătirile încep cu mult înainte. În Săptămâna Mare, oamenii curăță casa. Vinerea Mare este zi de post. Nu se mănâncă carne sau lactate. Sâmbătă, femeile vopsesc ouă. Roșu este culoarea tradițională. Reprezintă sângele lui Iisus. La miezul nopții, are loc slujba de Înviere. Oamenii merg la biserică cu lumânări. Preotul anunță: Hristos a înviat! Credincioșii răspund: Adevărat a înviat! După slujbă, familiile se adună la masă. Se mănâncă miel, drob și cozonac. Copiii ciocnesc ouă roșii. Cel al cărui ou rămâne întreg câștigă.', NULL),

  ('ro-video-2', 'video', 'ro', 6, 12, ARRAY['nature', 'geography'], 'Munții Carpați', 'The Carpathian Mountains',
   'Munții Carpați sunt coloana vertebrală a României. Se întind pe aproximativ 900 de kilometri. Sunt împărțiți în trei grupe: Orientali, Meridionali și Occidentali. Vârful Moldoveanu este cel mai înalt, cu 2.544 metri. Carpații adăpostesc o biodiversitate remarcabilă. Aici trăiesc urși, lupi, râși și cerbi. Pădurile de fag și de brad sunt vaste. Multe specii de plante sunt endemice. Turismul montan este dezvoltat. Sinaia, Predeal și Poiana Brașov sunt stațiuni celebre. Iarna, sute de mii de schiori le vizitează. Vara, drumeții explorează trasee marcate. Cabane de munte oferă cazare și mâncare tradițională.', NULL),

  -- Additional diverse content
  ('ro-inter-6', 'text', 'ro', 4, 5, ARRAY['daily-life', 'health'], 'La doctor', 'At the doctor',
   'Astăzi am mers la doctor. Am avut dureri de cap și febră. Am sunat să fac o programare. Recepționera m-a întrebat ce simptome am. I-am explicat că mă simt rău de două zile. M-a programat pentru ora 15. Am ajuns la cabinet la timp. Am completat un formular. Apoi am așteptat în sala de așteptare. Doctorul m-a chemat după zece minute. M-a consultat și m-a întrebat despre simptome. Mi-a luat temperatura. Aveam 38.5 grade. Mi-a prescris medicamente. Trebuie să iau pastile de trei ori pe zi. Săptămâna viitoare mă simt bine.', NULL),

  ('ro-inter-7', 'text', 'ro', 5, 6, ARRAY['education', 'learning'], 'Sistemul educațional', 'The educational system',
   'Sistemul educațional din România are mai multe niveluri. Învățământul preșcolar este pentru copiii de 3-6 ani. Grădinița nu este obligatorie, dar este recomandată. Școala primară durează patru ani. Copiii învață să citească și să scrie. Gimnaziul durează tot patru ani. Elevii studiază mai multe materii. La sfârșitul clasei a VIII-a, dau Evaluarea Națională. Rezultatele determină admiterea la liceu. Liceul durează patru ani. Există licee teoretice, vocaționale și tehnice. Bacalaureatul este examenul de final de liceu. După liceu, mulți tineri merg la universitate. Există universități de stat și private. Studiile universitare durează trei sau patru ani.', NULL),

  ('ro-adv-4', 'text', 'ro', 8, 9, ARRAY['literature', 'culture'], 'Literatura română clasică', 'Classical Romanian literature',
   'Literatura română are o istorie bogată și fascinantă. Mihai Eminescu este considerat poetul național. Opera sa include capodopere precum "Luceafărul" și "Scrisoarea III". Stilul său romantic a influențat generații de scriitori. Ion Creangă este celebru pentru povestirile sale. "Amintiri din copilărie" rămâne o lectură esențială. Ion Luca Caragiale a excelat în comedie și satiră. Piesele sale, precum "O scrisoare pierdută", sunt jucate și astăzi. Liviu Rebreanu a introdus romanul realist în literatura română. "Ion" și "Pădurea spânzuraților" sunt considerate capodopere. Perioada interbelică a adus avangarda. Tristan Tzara a fondat mișcarea dadaistă la Zürich. Mircea Eliade și Emil Cioran au câștigat renume internațional.', NULL)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- ROMANIAN FORGE PROMPTS - ADDITIONAL
-- ========================================

INSERT INTO forge_prompts (type, language, text, difficulty) VALUES
-- Advanced Quick Fire
('quick_fire', 'ro', 'Cum îți imaginezi viața ta peste zece ani?', 6),
('quick_fire', 'ro', 'Ce tradiție românească te-a impresionat cel mai mult?', 5),
('quick_fire', 'ro', 'Cum îți petreci timpul liber când ești stresat?', 4),
('quick_fire', 'ro', 'Povestește despre ultimul film sau serial pe care l-ai văzut.', 4),
('quick_fire', 'ro', 'Ce părere ai despre protecția mediului?', 6),
('quick_fire', 'ro', 'Ce voiai să devii când erai mic? Dar acum?', 5),
('quick_fire', 'ro', 'Cum crezi că va schimba inteligența artificială viitorul?', 7),
('quick_fire', 'ro', 'Ce faci pentru a-ți menține sănătatea?', 4),

-- Grammar-focused Quick Fire (Romanian specific)
('quick_fire', 'ro', 'Folosește articolul hotărât la trei substantive diferite.', 4),
('quick_fire', 'ro', 'Conjugă verbul "a merge" la toate persoanele, prezent.', 4),
('quick_fire', 'ro', 'Folosește "să" într-o propoziție cu "vreau" și "trebuie".', 5),
('quick_fire', 'ro', 'Explică diferența între "pe" și "la" cu exemple.', 5),
('quick_fire', 'ro', 'Formează propoziții cu cazul dativ (îmi, îți, îi).', 6),

-- Writing Sprint - Advanced
('writing_sprint', 'ro', 'Dacă ai locui în România, în ce oraș ai alege? De ce?', 5),
('writing_sprint', 'ro', 'Descrie cel mai fericit moment din viața ta.', 5),
('writing_sprint', 'ro', 'Cum a schimbat tehnologia viața noastră de zi cu zi?', 7),
('writing_sprint', 'ro', 'Scrie despre o persoană pe care o admiri și de ce.', 5),
('writing_sprint', 'ro', 'Compară cultura ta cu cultura românească.', 6),
('writing_sprint', 'ro', 'Cum crezi că va arăta lumea peste douăzeci de ani?', 7),
('writing_sprint', 'ro', 'Scrie o poveste scurtă despre o aventură în Carpați.', 6),

-- Translation - Intermediate to Advanced
('translation', 'ro', 'The weather is really nice today. Should we go for a walk?', 4),
('translation', 'ro', 'I have been learning Romanian for two years, and I love this language.', 6),
('translation', 'ro', 'If you are free tomorrow evening, would you like to have dinner together?', 5),
('translation', 'ro', 'I am sorry, but I cannot come to the party because I have to work.', 6),
('translation', 'ro', 'Even though Romanian grammar is complex, it is logical and beautiful.', 6),
('translation', 'ro', 'Could you please repeat that? I did not understand everything.', 4),
('translation', 'ro', 'The restaurant where we ate last time had excellent food.', 5),
('translation', 'ro', 'I wish I could visit Romania this summer.', 7),
('translation', 'ro', 'She told me that she would call me back, but she never did.', 7),

-- Shadow Speak - Advanced
('shadow_speak', 'ro', 'Am fost ocupat în ultima vreme și nu am avut timp să te sun.', 4),
('shadow_speak', 'ro', 'Când termin cartea asta, ți-o împrumut cu plăcere.', 5),
('shadow_speak', 'ro', 'Din câte știu eu, magazinul se închide la ora șase.', 6),
('shadow_speak', 'ro', 'Mă bucur foarte mult că ai putut să vii la petrecere.', 5),
('shadow_speak', 'ro', 'Dacă aș fi știut, aș fi venit mai devreme.', 6),

-- Conversation scenarios - Advanced
('conversation', 'ro', 'La spital - Descrie simptomele', 5),
('conversation', 'ro', 'La bancă - Deschide un cont', 6),
('conversation', 'ro', 'La frizer - Explică ce tunsoare vrei', 5),
('conversation', 'ro', 'La agenția imobiliară - Caută un apartament', 7),
('conversation', 'ro', 'La interviul de angajare - Prezintă-te', 7),
('conversation', 'ro', 'La mecanic - Explică problema mașinii', 6);

-- ========================================
-- ROMANIAN DEFINITIONS - ADDITIONAL
-- ========================================

INSERT INTO public.definitions (language, word, definition, part_of_speech, examples) VALUES
  -- Common verbs
  ('ro', 'a merge', 'to go, to walk', 'verb', ARRAY['Merg la școală.', 'Mergem împreună?']),
  ('ro', 'a veni', 'to come', 'verb', ARRAY['Vino aici!', 'Când vii?']),
  ('ro', 'a vedea', 'to see', 'verb', ARRAY['Te văd mâine.', 'Nu văd bine.']),
  ('ro', 'a auzi', 'to hear', 'verb', ARRAY['Auzi muzica?', 'Nu aud nimic.']),
  ('ro', 'a citi', 'to read', 'verb', ARRAY['Citesc o carte.', 'Îmi place să citesc.']),
  ('ro', 'a scrie', 'to write', 'verb', ARRAY['Scriu o scrisoare.', 'Scrie-mi!']),
  ('ro', 'a bea', 'to drink', 'verb', ARRAY['Beau apă.', 'Ce bei?']),
  ('ro', 'a dormi', 'to sleep', 'verb', ARRAY['Dorm opt ore.', 'Ai dormit bine?']),
  ('ro', 'a se trezi', 'to wake up', 'verb', ARRAY['Mă trezesc devreme.', 'Te-ai trezit?']),
  ('ro', 'a întâlni', 'to meet', 'verb', ARRAY['Te întâlnesc mâine.', 'Unde ne întâlnim?']),
  ('ro', 'a ști', 'to know', 'verb', ARRAY['Știu răspunsul.', 'Nu știu.']),
  ('ro', 'a putea', 'can, to be able', 'verb', ARRAY['Pot să te ajut.', 'Poți veni?']),
  ('ro', 'a vrea', 'to want', 'verb', ARRAY['Vreau apă.', 'Ce vrei?']),
  ('ro', 'a trebui', 'must, to have to', 'verb', ARRAY['Trebuie să plec.', 'Trebuie să înveți.']),
  ('ro', 'a mânca', 'to eat', 'verb', ARRAY['Mănânc o salată.', 'Ai mâncat?']),
  
  -- Common adjectives
  ('ro', 'mare', 'big, large', 'adjective', ARRAY['Casa este mare.', 'O mare problemă.']),
  ('ro', 'mic', 'small, little', 'adjective', ARRAY['Copilul este mic.', 'Un mic ajutor.']),
  ('ro', 'scump', 'expensive', 'adjective', ARRAY['Mașina este scumpă.', 'Prea scump!']),
  ('ro', 'ieftin', 'cheap, inexpensive', 'adjective', ARRAY['Acest telefon este ieftin.', 'Ceva mai ieftin?']),
  ('ro', 'bun', 'good', 'adjective', ARRAY['Mâncarea este bună.', 'Un om bun.']),
  ('ro', 'rău', 'bad', 'adjective', ARRAY['Vremea este rea.', 'O idee rea.']),
  ('ro', 'nou', 'new', 'adjective', ARRAY['Am o mașină nouă.', 'Ce e nou?']),
  ('ro', 'vechi', 'old (things)', 'adjective', ARRAY['Clădirea este veche.', 'O tradiție veche.']),
  ('ro', 'bătrân', 'old (people)', 'adjective', ARRAY['Bunicul este bătrân.', 'Un om bătrân.']),
  ('ro', 'tânăr', 'young', 'adjective', ARRAY['Este foarte tânără.', 'Tineri și bătrâni.']),
  ('ro', 'cald', 'warm, hot', 'adjective', ARRAY['Apa este caldă.', 'E cald afară.']),
  ('ro', 'rece', 'cold', 'adjective', ARRAY['Berea este rece.', 'Iarna e rece.']),
  ('ro', 'greu', 'difficult, heavy', 'adjective', ARRAY['Examenul e greu.', 'Geanta e grea.']),
  ('ro', 'ușor', 'easy, light', 'adjective', ARRAY['Este ușor de înțeles.', 'O geantă ușoară.']),
  
  -- Common nouns
  ('ro', 'timp', 'time', 'noun', ARRAY['Nu am timp.', 'Cât timp durează?']),
  ('ro', 'om', 'person, man, human', 'noun', ARRAY['Este un om bun.', 'Mulți oameni.']),
  ('ro', 'lucru', 'thing, work', 'noun', ARRAY['Am mult de lucru.', 'Lucruri importante.']),
  ('ro', 'cuvânt', 'word', 'noun', ARRAY['Nu înțeleg acest cuvânt.', 'Cuvinte noi.']),
  ('ro', 'prieten', 'friend (male)', 'noun', ARRAY['El e prietenul meu.', 'Prieteni buni.']),
  ('ro', 'prietenă', 'friend (female)', 'noun', ARRAY['Ea e prietena mea.', 'O prietenă dragă.']),
  ('ro', 'școală', 'school', 'noun', ARRAY['Merg la școală.', 'Școala începe la opt.']),
  ('ro', 'serviciu', 'work, job, service', 'noun', ARRAY['Sunt la serviciu.', 'Serviciul e bun.']),
  ('ro', 'țară', 'country', 'noun', ARRAY['România e o țară frumoasă.', 'Din ce țară ești?']),
  ('ro', 'mâncare', 'food', 'noun', ARRAY['Mâncarea e delicioasă.', 'Mâncare românească.']),
  ('ro', 'vreme', 'weather, time', 'noun', ARRAY['Ce vreme frumoasă!', 'Cu vremea.']),
  ('ro', 'film', 'movie, film', 'noun', ARRAY['Am văzut un film bun.', 'Ce film preferi?']),
  ('ro', 'muzică', 'music', 'noun', ARRAY['Îmi place muzica.', 'Muzică clasică.']),
  ('ro', 'carte', 'book', 'noun', ARRAY['Citesc o carte.', 'Cărți interesante.']),
  ('ro', 'apă', 'water', 'noun', ARRAY['Vreau apă.', 'Apa e rece.']),
  ('ro', 'bani', 'money', 'noun', ARRAY['Nu am bani.', 'Cât costă?'])
ON CONFLICT (language, word) DO NOTHING;
