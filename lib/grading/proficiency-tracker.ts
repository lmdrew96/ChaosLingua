/**
 * Proficiency Tracker Agent
 * 
 * Responsible for updating proficiency tracking based on grading results:
 * - Update proficiency patterns
 * - Track vocabulary usage
 * - Record errors for spaced repetition
 * - Calculate mastery levels
 */

import { createError } from "@/lib/db/errors"
import {
  recordProduction,
  recordRecognition,
} from "@/lib/db/vocabulary-tracking"
import {
  updateProficiencyPattern,
  createGradingResult,
} from "@/lib/db/grading"
import type {
  GradingContext,
  Language,
  GrammarIssue,
  ForgeType,
} from "@/lib/types"
import type { GradingOutput } from "./grading-agent"
import type { FeedbackOutput } from "./feedback-agent"

export interface ProficiencyUpdate {
  userId: string
  language: Language
  sessionId: string
  forgeType: ForgeType
  originalText: string
  userInput: string
  gradingOutput: GradingOutput
  feedbackOutput: FeedbackOutput
}

/**
 * Update proficiency tracking based on grading results
 */
export async function updateProficiencyTracking(
  update: ProficiencyUpdate
): Promise<void> {
  const {
    userId,
    language,
    sessionId,
    forgeType,
    originalText,
    userInput,
    gradingOutput,
    feedbackOutput,
  } = update

  // 1. Update proficiency patterns for each grammar issue
  await updateGrammarPatterns(userId, language, gradingOutput.grammarIssues)

  // 2. Track vocabulary production
  await trackVocabularyProduction(userId, language, userInput)

  // 3. Record errors for spaced repetition
  await recordGradingErrors(
    userId,
    language,
    originalText,
    userInput,
    feedbackOutput.corrections
  )

  // 4. Store grading result for analytics
  await saveGradingResult(
    userId,
    sessionId,
    forgeType,
    userInput,
    gradingOutput,
    feedbackOutput
  )
}

/**
 * Update grammar proficiency patterns
 */
async function updateGrammarPatterns(
  userId: string,
  language: Language,
  issues: GrammarIssue[]
): Promise<void> {
  // Track each issue as an incorrect usage
  for (const issue of issues) {
    await updateProficiencyPattern({
      userId,
      language,
      category: issue.category,
      patternType: issue.category,
      isCorrect: false, // These are errors
      grammarRuleId: issue.ruleId,
    })
  }
}

/**
 * Track vocabulary production
 */
async function trackVocabularyProduction(
  userId: string,
  language: Language,
  text: string
): Promise<void> {
  // Extract content words (nouns, verbs, adjectives)
  const words = extractContentWords(text, language)

  // Record production for each word
  for (const word of words) {
    try {
      await recordProduction({ userId, word, language })
    } catch (error) {
      // Skip words that fail (likely duplicates in same session)
      console.error(`Failed to record production for word: ${word}`, error)
    }
  }
}

/**
 * Extract content words from text
 */
function extractContentWords(text: string, language: Language): string[] {
  // Simple tokenization - in production, use proper morphological analyzer
  const words = text
    .toLowerCase()
    .match(/[\w']+/g) || []

  // Filter out function words
  const filtered = words.filter((word) => {
    if (word.length <= 2) return false // Skip short words
    if (isCommonFunctionWord(word, language)) return false
    return true
  })

  // Deduplicate
  return Array.from(new Set(filtered))
}

/**
 * Check if word is a common function word
 */
function isCommonFunctionWord(word: string, language: Language): boolean {
  const functionWords: Record<Language, Set<string>> = {
    ko: new Set([
      "은",
      "는",
      "이",
      "가",
      "을",
      "를",
      "의",
      "에",
      "에서",
      "도",
      "와",
      "과",
      "하고",
      "그리고",
      "하다",
      "있다",
      "없다",
      "되다",
      "것",
      "수",
      "등",
    ]),
    ro: new Set([
      "și",
      "de",
      "a",
      "în",
      "la",
      "cu",
      "pe",
      "un",
      "o",
      "pentru",
      "din",
      "să",
      "ce",
      "mai",
      "al",
      "era",
      "este",
      "sunt",
      "fi",
      "avea",
      "am",
      "ca",
      "dar",
      "nu",
      "se",
    ]),
  }

  return functionWords[language]?.has(word) ?? false
}

/**
 * Record errors for spaced repetition system
 */
async function recordGradingErrors(
  userId: string,
  language: Language,
  original: string,
  userGuess: string,
  corrections: FeedbackOutput["corrections"]
): Promise<void> {
  for (const correction of corrections) {
    // Get incorrect text (fallback to original/corrected fields)
    const incorrectText = (correction as any).incorrect || original
    const correctText = (correction as any).correct || correction.corrected

    // Skip if missing required fields
    if (!incorrectText || !correctText) continue

    try {
      await createError({
        userId,
        type: "grammar", // Default type - would need mapCorrectionTypeToErrorType if type field exists
        language,
        original: incorrectText,
        userGuess: incorrectText,
        correct: correctText,
        context: correction.explanation,
      })
    } catch (error) {
      console.error("Failed to record error:", error)
    }
  }
}

/**
 * Save grading result to database
 */
async function saveGradingResult(
  userId: string,
  sessionId: string,
  forgeType: ForgeType,
  userInput: string,
  gradingOutput: GradingOutput,
  feedbackOutput: FeedbackOutput
): Promise<void> {
  try {
    await createGradingResult({
      submissionId: sessionId, // Using sessionId as submissionId for now
      overallScore: gradingOutput.overallScore,
      grammarScore: gradingOutput.grammarScore,
      vocabularyScore: gradingOutput.vocabularyScore,
      pronunciationScore: 0, // Will be updated by audio processor
      naturalnessScore: gradingOutput.naturalnessScore,
      corrections: feedbackOutput.corrections,
      grammarIssues: gradingOutput.grammarIssues,
      pronunciationErrors: [], // Will be updated by audio processor
      feedback: feedbackOutput.summary,
      suggestions: feedbackOutput.suggestions,
    })
  } catch (error) {
    console.error("Failed to save grading result:", error)
  }
}

/**
 * Calculate pattern mastery from recent performance
 */
export function calculatePatternMastery(
  correctUses: number,
  incorrectUses: number
): number {
  const total = correctUses + incorrectUses
  if (total === 0) return 0

  // Simple accuracy-based mastery
  const accuracy = correctUses / total

  // Apply confidence factor (more data = more confident)
  const confidenceFactor = Math.min(1, total / 10) // Max confidence at 10+ uses

  return accuracy * confidenceFactor
}

/**
 * Determine if pattern should trigger review
 */
export function shouldTriggerReview(
  masteryLevel: number,
  incorrectUses: number
): boolean {
  // Trigger review if:
  // - Mastery below 70% AND has been used incorrectly 3+ times
  // - OR mastery below 50% AND used incorrectly at least once
  return (
    (masteryLevel < 0.7 && incorrectUses >= 3) ||
    (masteryLevel < 0.5 && incorrectUses >= 1)
  )
}

/**
 * Get recommended study patterns based on performance
 */
export function getRecommendedStudyPatterns(
  patterns: Array<{
    category: string
    patternType: string
    masteryLevel: number
    incorrectUses: number
  }>
): Array<{ category: string; priority: "high" | "medium" | "low" }> {
  return patterns
    .filter((p) => p.masteryLevel < 0.8) // Only patterns needing work
    .sort((a, b) => {
      // Prioritize by mastery level (lower = higher priority)
      if (a.masteryLevel !== b.masteryLevel) {
        return a.masteryLevel - b.masteryLevel
      }
      // Then by number of incorrect uses
      return b.incorrectUses - a.incorrectUses
    })
    .slice(0, 5) // Top 5
    .map((p) => ({
      category: p.category,
      priority:
        p.masteryLevel < 0.5
          ? "high"
          : p.masteryLevel < 0.7
            ? "medium"
            : "low",
    }))
}
