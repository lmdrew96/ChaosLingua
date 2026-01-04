# Forge Mode Grading Integration Guide

This guide shows how to integrate the AI grading system into all Forge modes.

## Overview

Each Forge mode has a corresponding **grading wrapper component** that:
1. Wraps the original Forge component
2. Submits responses to the grading API
3. Displays detailed feedback using `GradingResults`
4. Allows navigation through results

## Components

### 1. Quick Fire with Grading

**Component**: `components/forge/quick-fire-with-grading.tsx`

Grades individual responses one at a time, allowing users to see feedback before moving to the next prompt.

**Usage**:
```tsx
import { QuickFireWithGrading } from "@/components/forge/quick-fire-with-grading"

<QuickFireWithGrading
  language="romanian"
  sessionId="session-123"
  onComplete={() => handleComplete()}
  onExit={() => handleExit()}
/>
```

**Features**:
- Sequential grading per response
- Immediate feedback after each answer
- Progress tracking (1/5, 2/5, etc.)

### 2. Shadow Speak with Grading

**Component**: `components/forge/shadow-speak-with-grading.tsx`

Evaluates pronunciation accuracy against expected text with audio quality assessment.

**Usage**:
```tsx
import { ShadowSpeakWithGrading } from "@/components/forge/shadow-speak-with-grading"

<ShadowSpeakWithGrading
  language="korean"
  sessionId="session-456"
  onComplete={() => handleComplete()}
  onExit={() => handleExit()}
/>
```

**Features**:
- Pronunciation scoring via AssemblyAI
- Transcript comparison
- Audio quality feedback (good/fair/poor)
- Phoneme-level error detection

### 3. Writing Sprint with Grading

**Component**: `components/forge/writing-sprint-with-grading.tsx`

Provides detailed feedback on longer writing passages with focus on grammar and naturalness.

**Usage**:
```tsx
import { WritingSprintWithGrading } from "@/components/forge/writing-sprint-with-grading"

<WritingSprintWithGrading
  language="romanian"
  duration={10} // minutes
  sessionId="session-789"
  onComplete={() => handleComplete()}
  onExit={() => handleExit()}
/>
```

**Features**:
- Comprehensive grammar analysis
- Vocabulary appropriateness checking
- Detailed feedback (appropriate for reflective writing)
- Multiple correction levels

### 4. Translation with Grading

**Component**: `components/forge/translation-with-grading.tsx`

Compares translations to expected output and evaluates accuracy.

**Usage**:
```tsx
import { TranslationWithGrading } from "@/components/forge/translation-with-grading"

<TranslationWithGrading
  language="romanian"
  sessionId="session-101"
  onComplete={() => handleComplete()}
  onExit={() => handleExit()}
/>
```

**Features**:
- Translation accuracy evaluation
- Grammar checking in target language
- Comparison to expected translation
- Meaning preservation scoring

### 5. Conversation with Grading

**Component**: `components/forge/conversation-with-grading.tsx`

Evaluates dialogue responses for appropriateness and naturalness.

**Usage**:
```tsx
import { ConversationWithGrading } from "@/components/forge/conversation-with-grading"

<ConversationWithGrading
  language="korean"
  sessionId="session-202"
  onComplete={() => handleComplete()}
  onExit={() => handleExit()}
/>
```

**Features**:
- Context-aware response evaluation
- Politeness/formality checking
- Grammar in conversational context
- Turn-by-turn feedback

## Integration Patterns

### Pattern 1: Replace Forge Component

In your page or container component:

**Before**:
```tsx
import { WritingSprint } from "@/components/forge/writing-sprint"

export function WritingSprintPage() {
  return (
    <WritingSprint
      language="romanian"
      duration={10}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
```

**After**:
```tsx
import { WritingSprintWithGrading } from "@/components/forge/writing-sprint-with-grading"

export function WritingSprintPage() {
  return (
    <WritingSprintWithGrading
      language="romanian"
      sessionId={generateSessionId()}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
```

### Pattern 2: Conditional Grading

Show grading only when enabled:

```tsx
import { WritingSprint } from "@/components/forge/writing-sprint"
import { WritingSprintWithGrading } from "@/components/forge/writing-sprint-with-grading"

export function WritingSprintPage({ gradingEnabled = true }) {
  if (gradingEnabled) {
    return <WritingSprintWithGrading {...props} />
  }
  return <WritingSprint {...props} />
}
```

### Pattern 3: User Settings

Let users toggle grading:

```tsx
export function ForgeMode() {
  const { settings } = useUserSettings()
  const Component = settings.enableGrading 
    ? WritingSprintWithGrading 
    : WritingSprint

  return <Component {...props} />
}
```

## Data Flow

Each grading wrapper follows this pattern:

```
1. Original Session
   ├─ User completes Forge mode
   └─ Returns: responses/recordings/translations
        │
        ▼
2. Grading Loop
   ├─ Start with first item (index: 0)
   ├─ Submit to /api/grading endpoint
   │  ├─ Context Agent: Gather user data
   │  ├─ Grading Agent: Evaluate input
   │  ├─ Feedback Agent: Generate feedback
   │  └─ Proficiency Tracker: Update data
   ├─ Display GradingResults component
   ├─ User clicks "Next"
   └─ Loop to next item until done
        │
        ▼
3. Complete
   └─ Call onComplete() callback
```

## Error Handling

All grading wrappers include error handling:

```tsx
const { grade, isGrading, result, error } = useGrading()

// Check for errors
if (error) {
  console.error("Grading failed:", error)
  // Show error message to user
}
```

## Performance Considerations

### Quick Fire
- **Mode**: Fast-paced
- **Grading Detail**: Minimal (3 corrections max)
- **Timeout**: 2s per response
- **Best for**: Quick feedback without deep analysis

### Writing Sprint  
- **Mode**: Reflective
- **Grading Detail**: Detailed (10 corrections max)
- **Timeout**: 5s per response
- **Best for**: Comprehensive feedback with examples

### Shadow Speak
- **Mode**: Pronunciation-focused
- **Grading Detail**: Moderate (5 corrections max)
- **Timeout**: 5s per audio (includes STT)
- **Best for**: Audio feedback with transcripts

### Translation
- **Mode**: Accuracy-focused
- **Grading Detail**: Standard (5 corrections max)
- **Timeout**: 3s per translation
- **Best for**: Comparison-based feedback

### Conversation
- **Mode**: Context-aware
- **Grading Detail**: Moderate (5 corrections max)
- **Timeout**: 3s per turn
- **Best for**: Dialogue-appropriate feedback

## Customization

### Adjust Detail Level

Modify the detail level passed to feedback generation:

```tsx
// In feedback-agent.ts
const detailLevel = determineDetailLevel(context.userLevel, mode)
// Currently: quick_fire → minimal, writing_sprint → detailed
// Customize by mode type
```

### Skip Grading for Certain Responses

```tsx
const shouldGrade = (response: string): boolean => {
  // Skip very short responses
  if (response.length < 5) return false
  // Skip if too similar to last attempt
  if (isSimilar(response, lastResponse)) return false
  return true
}
```

### Customize Scoring Weights

```tsx
// In grading-agent.ts
const overallScore = Math.round(
  grammarScore * 0.4 +      // Adjust weights
  vocabularyScore * 0.2 +
  naturalnessScore * 0.4
)
```

## Testing

### Test Each Mode Locally

```bash
# Start dev server
pnpm dev

# Test Quick Fire
# Navigate to /forge/quick-fire

# Test each mode at:
# /forge/quick-fire
# /forge/shadow-speak
# /forge/writing-sprint
# /forge/translation
# /forge/conversation
```

### Mock Grading API

If API is not available:

```tsx
// In useGrading hook, mock response:
const mockResult = {
  success: true,
  scores: {
    overall: 85,
    grammar: 80,
    vocabulary: 90,
    pronunciation: 0,
    fluency: 85,
    naturalness: 85,
  },
  corrections: [],
  feedback: {
    summary: "Good work!",
    encouragement: "Great effort! 👏",
    suggestions: [],
  },
}
```

## Migration Checklist

- [ ] Add `sessionId` prop to all Forge components
- [ ] Replace Forge components with grading versions
- [ ] Update page imports
- [ ] Test text grading works
- [ ] Test audio grading works (shadow-speak)
- [ ] Test proficiency tracking updates
- [ ] Verify error handling
- [ ] Check performance (< 2s for text, < 5s for audio)
- [ ] Review grading results UI
- [ ] Add to production deployment

## Troubleshooting

### Grading Timeout

If grading takes too long:
1. Check API latency
2. Verify Claude API is responding
3. Check AssemblyAI (for audio)
4. Reduce context data (fewer grammar rules, errors)

### Missing Grading Results

If results don't display:
1. Check `isGrading` state (should be false when complete)
2. Verify API returns success: true
3. Check browser console for errors
4. Ensure useGrading hook is initialized

### Low Grammar Scores

If scores are unexpectedly low:
1. Check grammar rules in database
2. Verify rule difficulty matches user level
3. Review rule examples for accuracy
4. Adjust rule weights if needed

### Audio Processing Fails

If audio grading fails:
1. Check ASSEMBLYAI_API_KEY is set
2. Verify audio URL is accessible
3. Check audio format (WAV, MP3, etc.)
4. Review AssemblyAI logs for errors

## Next Steps

1. Deploy grading API to production
2. Roll out one mode at a time
3. Monitor user feedback
4. Refine grammar rules based on common errors
5. A/B test different detail levels
6. Gather proficiency data for SRS optimization

## Support

For issues or questions:
1. Check `docs/GRADING_SYSTEM.md` for detailed API docs
2. Review agent module code in `lib/grading/`
3. Check database schema in `scripts/011-add-grading-system.sql`
4. Test with `curl` against `/api/grading` endpoint
