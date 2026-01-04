/**
 * Context Agent
 * 
 * Responsible for gathering all context needed for grading:
 * - User proficiency level
 * - Relevant grammar rules for user's level
 * - Recent error history
 * - Recent guesses
 * - Proficiency patterns
 * - Vocabulary tracking
 */

import { getGrammarRules, getProficiencyPatterns } from "@/lib/db/grading"
import { getUserErrors } from "@/lib/db/errors"
import { getUserGuesses } from "@/lib/db/guesses"
import { getUserVocabularyTracking } from "@/lib/db/vocabulary-tracking"
import { getOrCreateUserProfile } from "@/lib/db/users"
import type { GradingContext, Language } from "@/lib/types"

export interface ContextAgentOptions {
  userId: string
  language: Language
  includeHistory?: {
    errors?: number // Number of recent errors to include
    guesses?: number // Number of recent guesses to include
  }
}

/**
 * Build comprehensive grading context for a user
 */
export async function buildGradingContext(
  options: ContextAgentOptions
): Promise<GradingContext> {
  const { userId, language, includeHistory } = options

  // Get user profile for proficiency level
  const profile = await getOrCreateUserProfile(userId)
  const userLevel = profile.levels[language] || 1

  // Fetch grammar rules appropriate for user's level
  // Include rules from 1 level below to 1 level above to provide context
  const grammarRules = await getGrammarRules({
    language,
    difficultyLevel: {
      min: Math.max(1, userLevel - 1),
      max: Math.min(10, userLevel + 2),
    },
    limit: 50, // Limit to most relevant rules
  })

  // Fetch recent errors for pattern detection
  const errorLimit = includeHistory?.errors ?? 20
  const recentErrors = await getUserErrors(userId, {
    language,
    limit: errorLimit,
  })

  // Fetch recent guesses to understand learning patterns
  const guessLimit = includeHistory?.guesses ?? 20
  const recentGuesses = await getUserGuesses(userId, {
    language,
    limit: guessLimit,
  })

  // Get proficiency patterns to identify weak areas
  const proficiencyPatterns = await getProficiencyPatterns(userId, {
    language,
    masteryThreshold: 0.7, // Focus on patterns below 70% mastery
  })

  // Get vocabulary tracking for production vs recognition gap
  const vocabularyTracking = await getUserVocabularyTracking(userId, {
    language,
    limit: 100,
  })

  return {
    userId,
    language,
    userLevel,
    grammarRules,
    recentErrors,
    recentGuesses,
    proficiencyPatterns,
    vocabularyTracking,
  }
}

/**
 * Get weak patterns that should be prioritized in feedback
 */
export function getWeakPatternsFromContext(
  context: GradingContext
): { category: string; patternType: string; masteryLevel: number }[] {
  return context.proficiencyPatterns
    .filter((p) => p.masteryLevel < 0.5) // Very weak patterns
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .slice(0, 5) // Top 5 weakest
    .map((p) => ({
      category: p.category,
      patternType: p.patternType,
      masteryLevel: p.masteryLevel,
    }))
}

/**
 * Get relevant grammar rules for specific categories
 */
export function getGrammarRulesByCategory(
  context: GradingContext,
  categories: string[]
): typeof context.grammarRules {
  return context.grammarRules.filter((rule) =>
    categories.includes(rule.category)
  )
}

/**
 * Check if user has encountered this error pattern before
 */
export function hasSeenErrorPattern(
  context: GradingContext,
  patternType: string
): boolean {
  return context.proficiencyPatterns.some(
    (p) => p.patternType === patternType
  )
}

/**
 * Get user's mastery level for a specific pattern
 */
export function getPatternMastery(
  context: GradingContext,
  patternType: string
): number | null {
  const pattern = context.proficiencyPatterns.find(
    (p) => p.patternType === patternType
  )
  return pattern ? pattern.masteryLevel : null
}

/**
 * Analyze if vocabulary is appropriate for user level
 */
export function analyzeVocabularyLevel(
  context: GradingContext,
  words: string[]
): {
  appropriate: string[]
  tooAdvanced: string[]
  shouldKnow: string[]
} {
  const tracked = new Set(
    context.vocabularyTracking.map((v) => v.word.toLowerCase())
  )

  const appropriate: string[] = []
  const tooAdvanced: string[] = []
  const shouldKnow: string[] = []

  for (const word of words) {
    const normalized = word.toLowerCase()
    const tracking = context.vocabularyTracking.find(
      (v) => v.word.toLowerCase() === normalized
    )

    if (tracking) {
      if (tracking.canRecognize) {
        appropriate.push(word)
      } else if (tracking.recognitionCount > 3) {
        shouldKnow.push(word) // Seen many times but not mastered
      }
    } else {
      // New word - check if it's too advanced based on context
      // This is a simplified heuristic; could be enhanced with difficulty scoring
      tooAdvanced.push(word)
    }
  }

  return { appropriate, tooAdvanced, shouldKnow }
}
