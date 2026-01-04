# AI Grading System

Multi-agent system for real-time grading of language learning exercises in ChaosLingua.

## Overview

The grading system uses a **4-agent orchestration pattern** to provide comprehensive, real-time feedback on user submissions in all Forge modes:

1. **Context Agent**: Gathers user proficiency data, grammar rules, error history, and vocabulary tracking
2. **Grading Agent**: Evaluates input against grammar rules and vocabulary database
3. **Feedback Agent**: Generates user-friendly corrections and suggestions
4. **Proficiency Tracker**: Updates mastery tracking and error patterns

For audio submissions, an **Audio Processor** handles STT transcription and pronunciation scoring via AssemblyAI.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Forge Component                    │
│         (writing-sprint, shadow-speak, etc.)        │
└────────────────────┬────────────────────────────────┘
                     │ User submission (text/audio)
                     ▼
┌─────────────────────────────────────────────────────┐
│              POST /api/grading                       │
└─────┬──────┬──────┬──────┬──────────────────────────┘
      │      │      │      │
      ▼      ▼      ▼      ▼
   Context Audio Grading Feedback  Proficiency
   Agent   Proc  Agent   Agent      Tracker
      │      │      │      │            │
      └──────┴──────┴──────┴────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              GradingResults Component                │
│   (scores, corrections, feedback, suggestions)      │
└─────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### `grammar_rules`
Stores grammar patterns for error detection:
```sql
- id (uuid)
- language (text)
- category (text) -- e.g., "verb_conjugation", "particles"
- rule_name (text) -- e.g., "Romanian Imperfect Tense"
- difficulty_level (int) -- 1-10
- examples (jsonb) -- [{ correct, incorrect, explanation }]
```

#### `forge_submissions`
Tracks all Forge submissions:
```sql
- id (uuid)
- user_id (uuid)
- session_id (uuid)
- forge_type (forge_type) -- quick_fire, shadow_speak, etc.
- language (text)
- original_text (text) -- For translation/shadow modes
- user_text (text) -- Text input
- audio_url (text) -- Audio input
- transcript (text) -- STT result
- created_at (timestamp)
```

#### `grading_results`
Stores detailed grading output:
```sql
- id (uuid)
- submission_id (uuid)
- overall_score (int)
- grammar_score (int)
- vocabulary_score (int)
- pronunciation_score (int)
- fluency_score (int)
- naturalness_score (int)
- corrections (jsonb) -- [{ type, incorrect, correct, explanation }]
- grammar_issues (jsonb) -- [{ ruleId, category, severity, description }]
- pronunciation_errors (jsonb) -- [{ phoneme, position, severity }]
- feedback (text)
- suggestions (text[])
- graded_at (timestamp)
```

#### `proficiency_patterns`
Tracks mastery of specific grammar patterns:
```sql
- id (uuid)
- user_id (uuid)
- language (text)
- category (text)
- pattern_type (text)
- correct_uses (int)
- incorrect_uses (int)
- mastery_level (decimal) -- Calculated by helper function
- last_practiced (timestamp)
```

#### `pronunciation_phonemes`
Defines phonemes for pronunciation checking:
```sql
- id (uuid)
- language (text)
- phoneme (text)
- ipa (text)
- example_word (text)
- common_errors (text[])
```

### Helper Functions

#### `calculate_mastery_level()`
Calculates mastery level from correct/incorrect uses using confidence-weighted accuracy.

#### `update_proficiency_pattern()`
Updates or inserts proficiency patterns and recalculates mastery level.

## Agent Modules

### 1. Context Agent (`lib/grading/context-agent.ts`)

**Purpose**: Gather comprehensive context for grading

**Inputs**:
- `userId`: User ID
- `language`: Target language
- `includeHistory`: Optional limits for errors/guesses

**Outputs**: `GradingContext` containing:
- User proficiency level
- Relevant grammar rules (filtered by difficulty)
- Recent errors (last 20)
- Recent guesses (last 20)
- Proficiency patterns (mastery < 70%)
- Vocabulary tracking (last 100 words)

**Key Functions**:
- `buildGradingContext()`: Main orchestrator
- `getWeakPatternsFromContext()`: Extract top 5 weakest patterns
- `getGrammarRulesByCategory()`: Filter rules by category
- `analyzeVocabularyLevel()`: Check if words are appropriate for user level

### 2. Grading Agent (`lib/grading/grading-agent.ts`)

**Purpose**: Evaluate linguistic accuracy

**Inputs**:
- `text`: User input text
- `language`: Target language
- `context`: GradingContext from Context Agent
- `expectedMeaning?`: For translation/shadow modes

**Outputs**: `GradingOutput` containing:
- Scores (grammar, vocabulary, naturalness, fluency, overall)
- Grammar issues with positions and explanations
- Vocabulary issues

**Grading Strategy**:
1. **Grammar Analysis**: Hybrid AI + rule-based
   - Checks input against database grammar rules
   - Uses Claude API for nuanced grammar analysis
   - Combines and deduplicates issues
2. **Vocabulary Analysis**: Database-backed checking
   - Tokenizes input text
   - Checks against user's vocabulary_tracking
   - Flags unfamiliar words
3. **Naturalness Analysis**: AI-powered
   - Uses Claude API for naturalness scoring
   - Considers phrasing and idiomaticity

**Scoring Formula**:
- Overall = (Grammar × 0.4) + (Vocabulary × 0.2) + (Naturalness × 0.4)
- Fluency = (Grammar + Naturalness) / 2

### 3. Feedback Agent (`lib/grading/feedback-agent.ts`)

**Purpose**: Generate user-friendly feedback

**Inputs**:
- `gradingOutput`: From Grading Agent
- `context`: GradingContext
- `originalText`: Source text (if applicable)
- `mode`: Forge mode type

**Outputs**: `FeedbackOutput` containing:
- Corrections with explanations
- Summary feedback
- Encouragement message
- Actionable suggestions

**Adaptation Strategy**:
- **Detail Level**: Adjusts based on user level and mode
  - Beginners (level 1-3): Detailed explanations with examples
  - Intermediate (level 4-7): Standard explanations
  - Advanced (level 8-10): Minimal explanations
  - Quick Fire: Always minimal (fast pace)
  - Writing Sprint: Always detailed (time to reflect)

- **Correction Prioritization**:
  - Sorts by severity (serious → moderate → minor)
  - Limits by detail level (3/5/10 corrections)
  - Flags recurring patterns

- **Suggestions**:
  - Grammar-specific for grammar scores < 75%
  - Vocabulary simplification for vocab scores < 75%
  - Naturalness tips for naturalness scores < 75%
  - Proficiency pattern recommendations

### 4. Proficiency Tracker (`lib/grading/proficiency-tracker.ts`)

**Purpose**: Update user proficiency data

**Inputs**:
- `userId`, `language`, `sessionId`
- `forgeType`: Mode type
- `originalText`, `userInput`: Texts
- `gradingOutput`, `feedbackOutput`: Agent results

**Actions**:
1. **Update Grammar Patterns**
   - Groups issues by category
   - Calls `update_proficiency_pattern()` SQL function
   - Recalculates mastery levels

2. **Track Vocabulary Production**
   - Extracts content words (nouns, verbs, adjectives)
   - Calls `recordProduction()` for each word
   - Updates vocabulary_tracking table

3. **Record Errors**
   - Creates error_items for SRS
   - Maps corrections to error types
   - Includes context for review

4. **Save Grading Result**
   - Stores complete grading result
   - Links to submission via submission_id

**Mastery Calculation**:
```
accuracy = correct / (correct + incorrect)
confidenceFactor = min(1, total_uses / 10)
mastery = accuracy × confidenceFactor
```

### 5. Audio Processor (`lib/grading/audio-processor.ts`)

**Purpose**: Handle audio transcription and pronunciation

**Integration**: AssemblyAI API

**Inputs**:
- `audioUrl`: URL to audio file
- `expectedText?`: For shadow-speak mode
- `language`: Target language

**Outputs**:
- `transcript`: STT transcription
- `confidence`: Transcription confidence (0-1)
- `pronunciationScore`: 0-100
- `pronunciationErrors`: Phoneme-level errors
- `audioQuality`: good/fair/poor

**Process**:
1. Upload audio to AssemblyAI (or use public URL)
2. Request transcription with language code
3. Poll for completion (max 60 seconds)
4. Compare transcript to expected text (if provided)
5. Calculate pronunciation score from confidence and errors
6. Assess audio quality from confidence

**Pronunciation Scoring**:
```
baseScore = confidence × 100
errorPenalty = Σ(severity_weight × count)
  where severity_weight: 1→5, 2→10, 3→15
pronunciationScore = max(0, baseScore - errorPenalty)
```

## API Endpoint

### `POST /api/grading`

**Request Body**:
```typescript
{
  userId: string
  sessionId: string
  language: "korean" | "romanian"
  forgeType: "quick_fire" | "shadow_speak" | "writing_sprint" | "translation" | "conversation"
  text?: string          // For text input
  audioUrl?: string      // For audio input
  originalText?: string  // For translation/shadow modes
}
```

**Response**:
```typescript
{
  success: boolean
  submissionId?: string
  transcript?: string    // If audio input
  scores: {
    overall: number      // 0-100
    grammar: number
    vocabulary: number
    pronunciation: number
    fluency: number
    naturalness: number
  }
  corrections: Array<{
    type: "grammar" | "vocabulary" | "spelling" | "punctuation" | "style"
    incorrect: string
    correct: string
    explanation: string
    isRecurring?: boolean
  }>
  feedback: {
    summary: string
    encouragement: string
    suggestions: string[]
  }
  audioQuality?: "good" | "fair" | "poor"
  error?: string
}
```

**Performance Target**: < 2 seconds for text-only, < 5 seconds with audio

**Orchestration Flow**:
```javascript
1. Validate input
2. Build grading context (Context Agent)
3. If audio: Process audio → get transcript (Audio Processor)
4. Create submission record
5. Grade input (Grading Agent)
6. Generate feedback (Feedback Agent)
7. Update proficiency tracking (Proficiency Tracker)
8. Return response
```

## Frontend Integration

### useGrading Hook

React hook for grading API:

```typescript
const { grade, isGrading, result, error, reset } = useGrading()

await grade({
  userId,
  sessionId,
  language,
  forgeType,
  text: "Eu învăț limba română.",
})
```

### GradingResults Component

Display grading output:

```tsx
<GradingResults
  scores={result.scores}
  corrections={result.corrections}
  feedback={result.feedback}
  transcript={result.transcript}
  audioQuality={result.audioQuality}
/>
```

### Integration Example

See `components/forge/writing-sprint-with-grading.tsx` for a complete example.

## Environment Variables

```bash
# AssemblyAI API Key (required for audio processing)
ASSEMBLYAI_API_KEY=your_api_key_here

# Anthropic API Key (required for AI grading)
ANTHROPIC_API_KEY=your_api_key_here
```

## Grammar Rule Curation

### Manual Curation (Priority)
Focus on high-frequency learner errors:

**Romanian**:
- Verb conjugation (imperfect, perfect, pluperfect)
- Case system (genitive-dative, accusative)
- Articles (definite/indefinite, attached/detached)

**Korean**:
- Particles (은/는, 이/가, 을/를)
- Honorifics (formal/informal)
- Verb conjugation (tense, politeness levels)

### Automated Extraction (Future)
Scripts in `scripts/extractors/`:
- `extract-romanian-grammar.ts`: Multext-East parser
- `extract-korean-grammar.ts`: Korpora integration
- `extract-gf-rules.ts`: GF-RGL parser

See `scripts/extractors/README.md` for details.

## Database Migration

Run the migration script:
```bash
psql $DATABASE_URL -f scripts/011-add-grading-system.sql
```

This creates:
- 5 tables
- 2 indexes
- 2 helper functions
- Seed data (11 grammar rules, 6 phonemes)

## Testing

### Manual Testing
1. Start dev server: `pnpm dev`
2. Navigate to a Forge mode
3. Submit text or audio
4. Verify grading results display

### API Testing
```bash
curl -X POST http://localhost:3000/api/grading \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "sessionId": "test-session-id",
    "language": "romanian",
    "forgeType": "writing_sprint",
    "text": "Eu învăț limba română."
  }'
```

## Future Enhancements

1. **AgentSet MCP Integration**: Replace custom orchestration with AgentSet
2. **Advanced NLP**: Integrate proper morphological analyzers (Korpora, Multext-East)
3. **Pronunciation Phoneme DB**: Expand pronunciation_phonemes with comprehensive data
4. **Real-time Grading**: WebSocket support for streaming feedback
5. **Batch Grading**: Queue system for high-volume grading
6. **Grammar Extractor Scripts**: Implement automated rule extraction
7. **Custom Grammar Rules**: Allow users to add custom rules
8. **A/B Testing**: Test different grading strategies

## Troubleshooting

### "ASSEMBLYAI_API_KEY is not configured"
Add your AssemblyAI API key to `.env.local`:
```bash
ASSEMBLYAI_API_KEY=your_key_here
```

### Low pronunciation scores
Check audio quality (should be "good"). If "poor", guide user to:
- Reduce background noise
- Speak closer to microphone
- Use better audio hardware

### Grading timeout
- Check database connection
- Verify AI service (Claude API) is responding
- Check AssemblyAI transcription status

### Incorrect grammar detection
- Review grammar rules in database
- Check rule examples and patterns
- Adjust rule difficulty_level to match user level

## Contributing

When adding new grammar rules:
1. Add to database via SQL or admin UI
2. Include 2-3 examples (correct + incorrect)
3. Set appropriate difficulty_level (1-10)
4. Test with real user submissions

## License

Part of ChaosLingua language learning platform.
