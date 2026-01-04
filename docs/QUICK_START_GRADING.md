# Forge Grading System - Quick Start Guide

## 5-Second Setup

Replace your Forge component with the grading version:

```tsx
// OLD
import { WritingSprint } from "@/components/forge/writing-sprint"

// NEW  
import { WritingSprintWithGrading } from "@/components/forge/writing-sprint-with-grading"
```

## Available Components

```tsx
import { QuickFireWithGrading } from "@/components/forge/quick-fire-with-grading"
import { ShadowSpeakWithGrading } from "@/components/forge/shadow-speak-with-grading"
import { WritingSprintWithGrading } from "@/components/forge/writing-sprint-with-grading"
import { TranslationWithGrading } from "@/components/forge/translation-with-grading"
import { ConversationWithGrading } from "@/components/forge/conversation-with-grading"
```

## Or Use the Unified Selector

For simplicity, use the unified component:

```tsx
import { ForgeWithGrading } from "@/components/forge/forge-with-grading"

<ForgeWithGrading
  mode="writing_sprint"        // quick_fire | shadow_speak | writing_sprint | translation | conversation
  language="romanian"          // korean | romanian
  onComplete={() => {}}        // Called when session complete
  onExit={() => {}}           // Called when user exits
/>
```

## What Happens

1. **User completes Forge mode** (e.g., writes essay, records audio, translates text)
2. **Grading system evaluates** their response
3. **Feedback displays** with scores, corrections, and suggestions
4. **Proficiency tracking updates** (grammar patterns, vocabulary, errors)
5. **SRS receives errors** for spaced repetition

## Grading Output

Each response gets:

```typescript
{
  scores: {
    overall: 85,              // 0-100
    grammar: 80,
    vocabulary: 90,
    pronunciation: 85,        // Audio only
    fluency: 85,
    naturalness: 85
  },
  corrections: [              // Grammar/vocab issues
    {
      type: "grammar",
      incorrect: "Je suis apprendre",
      correct: "Je suis en train d'apprendre",
      explanation: "Use être + en train de + infinitive for present progressive",
      isRecurring: false
    }
  ],
  feedback: {
    summary: "Good job! Your writing is mostly accurate.",
    encouragement: "Well done! 👏",
    suggestions: [
      "Practice verb conjugation - this is a recurring challenge",
      "Try using more complex sentence structures"
    ]
  },
  transcript: "Transcript from audio (if audio input)",
  audioQuality: "good"        // good | fair | poor
}
```

## Required Environment Variables

Add to `.env.local`:

```env
# Claude API (for grammar/naturalness analysis)
ANTHROPIC_API_KEY=sk-...

# AssemblyAI (for audio transcription + pronunciation)
ASSEMBLYAI_API_KEY=...
```

## Database Setup

Run migration once:

```bash
psql $DATABASE_URL -f scripts/011-add-grading-system.sql
```

Creates:
- `grammar_rules` (11 seed rules for Romanian & Korean)
- `forge_submissions` (tracks all submissions)
- `grading_results` (stores grading output)
- `proficiency_patterns` (tracks mastery)
- `pronunciation_phonemes` (pronunciation reference)

## Common Use Cases

### Show grading for all modes
```tsx
<ForgeWithGrading mode={selectedMode} language={language} {...props} />
```

### Show grading only for certain users
```tsx
const Component = user.level > 5 ? ForgeWithGrading : OriginalComponent
<Component {...props} />
```

### Disable grading temporarily
```tsx
{gradingEnabled ? (
  <WritingSprintWithGrading {...props} />
) : (
  <WritingSprint {...props} />
)}
```

### Custom handling of grading results
```tsx
const { grade, result } = useGrading()

const onSubmit = async (text) => {
  const result = await grade({
    userId,
    sessionId,
    language,
    forgeType: "writing_sprint",
    text
  })
  
  if (result.scores.grammar < 70) {
    // Show grammar tips
  }
}
```

## What Gets Tracked

### User Proficiency
- Mastery level per grammar pattern
- Vocabulary production vs recognition gap
- Error frequency by category
- Last practiced date

### Errors
- Recorded in error_items table
- Available for SRS review
- Grouped by type and pattern
- Can trigger focused lessons

### Submissions
- All submissions logged
- Complete grading output saved
- Available for analytics
- Linked to user session

## Performance

- **Text grading**: < 2 seconds
- **Audio grading**: < 5 seconds (includes STT)
- **Database updates**: < 1 second
- **API timeout**: 30 seconds max

## Troubleshooting

### "User not authenticated"
→ Ensure user is signed in before using Forge

### "Missing ANTHROPIC_API_KEY"
→ Add to `.env.local` and restart dev server

### "Transcription timeout"
→ Check audio file size (should be < 25MB)

### Grading takes > 5 seconds
→ Check API performance, database connection
→ Consider caching grammar rules

### Low scores on correct answers
→ Review grammar rules in database
→ Adjust rule examples if needed
→ Check if patterns need refinement

## Next Steps

1. ✅ Environment variables set
2. ✅ Database migrated
3. ✅ Component imported
4. ✅ Start using grading!

## Documentation

- **Full API docs**: `docs/GRADING_SYSTEM.md`
- **Integration guide**: `docs/FORGE_GRADING_INTEGRATION.md`
- **Agent architecture**: `lib/grading/*.ts`
- **Database schema**: `scripts/011-add-grading-system.sql`

## Support

For issues:
1. Check browser console for errors
2. Verify API keys in `.env.local`
3. Check database connection
4. Review grading endpoint at `/api/grading`

---

**That's it!** You now have AI-powered grading for all Forge modes. 🚀
