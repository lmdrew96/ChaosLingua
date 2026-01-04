# Grammar Extraction Scripts

This directory contains scripts to extract and populate grammar rules from linguistic resources.

## Data Sources

### 1. Multext-East V4 (Romanian)
- **Source**: http://nl.ijs.si/ME/V4/
- **Download**: https://hdl.handle.net/11356/1041 (Free lexicons from CLARIN.SI)
- **Contains**: Romanian morphological lexicons with 130K+ word forms
- **Target**: Extract verb conjugation patterns, case system rules, noun declensions

### 2. Korpora (Korean)
- **Source**: https://github.com/ko-nlp/Korpora
- **Installation**: `pip install Korpora`
- **Contains**: Multiple Korean corpora including NER, NLI, sentiment data
- **Target**: Extract particle usage patterns, honorific rules, verb conjugations

### 3. GF-RGL (Both Languages)
- **Source**: https://github.com/GrammaticalFramework/gf-rgl
- **Installation**: Clone repository and build with GF compiler
- **Contains**: Formal grammar definitions in `.gf` files
- **Target**: Parse grammar categories, paradigms, syntax rules

### 4. KLI - Korean Language Institute
- **Source**: https://kli.korean.go.kr/
- **Contains**: Official Korean language resources, 모두의 말뭉치 (Modu Corpus)
- **Target**: Standard grammar references, common learner errors
- **Note**: May require manual extraction or special API access

## Extraction Strategy

### Phase 1: Manual Curation (Current)
Focus on **high-frequency learner errors**, not comprehensive translation coverage:

1. **Romanian Priority Patterns**:
   - Verb conjugation (present, past, future)
   - Genitive-Dative case confusion
   - Definite article attachment
   - Accusative case formation

2. **Korean Priority Patterns**:
   - Subject/object particle selection (이/가, 을/를)
   - Polite speech levels (-요, -습니다)
   - Honorific usage (-시-)
   - Verb conjugation (아요/어요 selection)

3. **Optimize for Grading**:
   - Extract patterns that help identify mistakes
   - Include common incorrect forms
   - Provide learner-friendly explanations
   - Tag with appropriate difficulty levels (1-10)

### Phase 2: Automated Scaling (Future)
Once manual foundation is solid, automate extraction for comprehensive coverage.

## Scripts

### `extract-romanian-grammar.ts`
Extracts Romanian grammar rules from Multext-East lexicons.

**Usage**:
```bash
# Download Multext-East data first
wget https://hdl.handle.net/11356/1041

# Run extraction
tsx scripts/extractors/extract-romanian-grammar.ts
```

**Output**: Inserts grammar rules into `grammar_rules` table

### `extract-korean-grammar.ts`
Extracts Korean grammar rules from Korpora datasets.

**Usage**:
```bash
# Install Korpora
pip install Korpora

# Run extraction
tsx scripts/extractors/extract-korean-grammar.ts
```

**Output**: Inserts grammar rules into `grammar_rules` table

### `extract-gf-rules.ts`
Parses GF-RGL `.gf` files for formal grammar structures.

**Usage**:
```bash
# Clone GF-RGL
git clone https://github.com/GrammaticalFramework/gf-rgl

# Run extraction
tsx scripts/extractors/extract-gf-rules.ts --gf-rgl-path=./gf-rgl
```

**Output**: Inserts formal grammar rules into `grammar_rules` table

### `seed-phonemes.ts`
Seeds pronunciation phonemes from linguistic databases.

**Usage**:
```bash
tsx scripts/extractors/seed-phonemes.ts
```

## Manual Seeding

Initial seed data is in `scripts/011-add-grading-system.sql`:
- 7 Romanian grammar rules (verb conjugation, cases, articles)
- 4 Korean grammar rules (particles, conjugation, honorifics)
- 6 common phonemes (Romanian ă, î/â, ț; Korean ㅓ, ㅡ, ㄱ)

Run the migration to populate base rules:
```bash
npm run db:migrate
```

## Data Format

Grammar rules should be formatted as:
```json
{
  "language": "ro" | "ko",
  "category": "verb_conjugation" | "particles" | "case_system" | etc.,
  "rule_name": "present_tense_regular",
  "description": "Detailed description for developers",
  "difficulty_level": 1-10,
  "source": "multext-east" | "korpora" | "gf-rgl" | "kli" | "manual",
  "examples": [
    {
      "correct": "correct form",
      "incorrect": "common mistake",
      "explanation": "why this is wrong and how to fix it"
    }
  ]
}
```

## Contributing New Rules

1. Identify high-frequency learner error from error_items or user_guesses
2. Research authoritative grammar description
3. Add rule with 2-3 example pairs (correct/incorrect)
4. Tag with appropriate difficulty (consider when learners encounter this)
5. Insert via extraction script or manually via SQL

## Next Steps

- [ ] Download Multext-East Romanian lexicons
- [ ] Install Korpora Python package
- [ ] Clone GF-RGL repository
- [ ] Implement extraction scripts
- [ ] Validate extracted rules against native speakers
- [ ] Build automated rule suggestion from error patterns
