/**
 * Grading Agent
 * 
 * Responsible for evaluating user input against grammar rules and vocabulary:
 * - Grammar rule validation
 * - Vocabulary appropriateness checking
 * - Naturalness scoring
 * - Error detection and classification
 */

import { aiService } from "@/lib/ai-service"
import type {
  GradingContext,
  GrammarRule,
  GrammarIssue,
  Language,
} from "@/lib/types"

export interface GradingInput {
  text: string
  language: Language
  context: GradingContext
  expectedMeaning?: string // For translation/shadow-speak modes
}

export interface GradingOutput {
  grammarScore: number // 0-100
  vocabularyScore: number // 0-100
  naturalnessScore: number // 0-100
  fluencyScore: number // 0-100
  grammarIssues: GrammarIssue[]
  vocabularyIssues: string[]
  overallScore: number // 0-100
}

/**
 * Grade user input for linguistic accuracy
 */
export async function gradeInput(
  input: GradingInput
): Promise<GradingOutput> {
  const { text, language, context, expectedMeaning } = input

  // Run grammar analysis with AI + rule matching
  const grammarResult = await analyzeGrammarWithRules(
    text,
    language,
    context.grammarRules,
    context.userLevel
  )

  // Check vocabulary appropriateness
  const vocabularyResult = analyzeVocabulary(text, context)

  // Analyze naturalness with AI
  const naturalnessResult = await analyzeNaturalness(text, language)

  // Calculate overall scores
  const grammarScore = calculateGrammarScore(grammarResult.issues)
  const vocabularyScore = vocabularyResult.score
  const naturalnessScore = naturalnessResult.score
  const fluencyScore = Math.round((grammarScore + naturalnessScore) / 2)

  // Weighted overall score (grammar 40%, vocabulary 20%, naturalness 40%)
  const overallScore = Math.round(
    grammarScore * 0.4 +
    vocabularyScore * 0.2 +
    naturalnessScore * 0.4
  )

  return {
    grammarScore,
    vocabularyScore,
    naturalnessScore,
    fluencyScore,
    grammarIssues: grammarResult.issues,
    vocabularyIssues: vocabularyResult.issues,
    overallScore,
  }
}

/**
 * Analyze grammar using both AI and rule-based matching
 */
async function analyzeGrammarWithRules(
  text: string,
  language: Language,
  rules: GrammarRule[],
  userLevel: number
): Promise<{ issues: GrammarIssue[] }> {
  // Get AI-based grammar analysis (using correct method names)
  const aiAnalysis = await aiService.getGrammarFeedback({
    text,
    language,
    type: "grammar"
  })

  const issues: GrammarIssue[] = []

  // Match against database grammar rules
  for (const rule of rules) {
    const ruleIssues = checkAgainstRule(text, rule, language)
    issues.push(...ruleIssues)
  }

  // Combine with AI-detected corrections
  if (aiAnalysis.corrections && Array.isArray(aiAnalysis.corrections)) {
    for (const correction of aiAnalysis.corrections) {
      const position = text.indexOf(correction.original)
      if (position !== -1) {
        issues.push({
          category: "grammar",
          severity: "medium",
          position,
          description: `Grammar: ${correction.explanation}`,
          suggestion: correction.corrected,
          explanation: correction.explanation,
        })
      }
    }
  }

  // Deduplicate issues
  return { issues: deduplicateIssues(issues) }
}

/**
 * Check text against a specific grammar rule
 */
function checkAgainstRule(
  text: string,
  rule: GrammarRule,
  language: Language
): GrammarIssue[] {
  const issues: GrammarIssue[] = []

  // Pattern-based checking for each example in the rule
  for (const example of rule.examples) {
    if (example.incorrect) {
      // Check if text contains the incorrect pattern
      const incorrectPattern = createPatternFromExample(example.incorrect, language)
      const matches = text.match(incorrectPattern)

      if (matches) {
        issues.push({
          ruleId: rule.id,
          category: rule.category,
          severity: mapDifficultyToSeverity(rule.difficultyLevel),
          position: text.indexOf(matches[0]),
          description: `${rule.ruleName}: Found "${matches[0]}", expected similar to "${example.correct}"`,
          suggestion: example.correct,
          explanation: example.explanation,
        })
      }
    }
  }

  return issues
}

/**
 * Create a regex pattern from an example (simplified)
 */
function createPatternFromExample(example: string, language: Language): RegExp {
  // This is a simplified pattern matcher
  // In production, you'd want more sophisticated NLP-based matching

  if (language === "ko") {
    // For Korean, we can match exact particles/endings
    // e.g., "을" vs "를" selection errors
    const escaped = example.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(escaped, "gi")
  }

  if (language === "ro") {
    // For Romanian, match case endings and conjugations
    // This is very simplified - real implementation would parse morphology
    const escaped = example.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(escaped, "gi")
  }

  // Fallback: exact match
  const escaped = example.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(escaped, "gi")
}

/**
 * Analyze vocabulary usage
 */
function analyzeVocabulary(
  text: string,
  context: GradingContext
): { score: number; issues: string[] } {
  const issues: string[] = []

  // Simple word tokenization (would need proper tokenizer for production)
  const words = tokenizeWords(text, context.language)

  // Check each word against user's vocabulary tracking
  const trackedWords = new Set(
    context.vocabularyTracking.map((v) => v.word.toLowerCase())
  )

  let unknownCount = 0
  let tooAdvancedCount = 0

  for (const word of words) {
    const normalized = word.toLowerCase()

    // Skip very common words (articles, prepositions, etc.)
    if (isCommonWord(normalized, context.language)) {
      continue
    }

    if (!trackedWords.has(normalized)) {
      // Word hasn't been seen before
      unknownCount++
      issues.push(`"${word}" may be unfamiliar vocabulary for your level`)
    }
  }

  // Calculate score (penalize unknown words)
  const totalSignificantWords = words.filter((w) =>
    !isCommonWord(w.toLowerCase(), context.language)
  ).length

  const score =
    totalSignificantWords > 0
      ? Math.round(
          ((totalSignificantWords - unknownCount) / totalSignificantWords) * 100
        )
      : 100

  return { score, issues: issues.slice(0, 5) } // Limit to top 5 issues
}

/**
 * Simple word tokenizer
 */
function tokenizeWords(text: string, language: Language): string[] {
  if (language === "ko") {
    // Korean needs special tokenization (would use morphological analyzer in production)
    // For now, split on spaces and common particles
    return text.split(/\s+/).filter((w) => w.length > 0)
  }

  // For Romanian and other languages, split on word boundaries
  return text.match(/\b[\w']+\b/g) || []
}

/**
 * Check if word is a common function word
 */
function isCommonWord(word: string, language: Language): boolean {
  const commonWords: Record<Language, Set<string>> = {
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
    ]),
  }

  return commonWords[language]?.has(word) ?? false
}

/**
 * Calculate grammar score from issues
 */
function calculateGrammarScore(issues: GrammarIssue[]): number {
  if (issues.length === 0) return 100

  // Weight issues by severity
  const totalPenalty = issues.reduce((sum, issue) => {
    const severityWeight: Record<string, number> = {
      low: 5,
      medium: 10,
      high: 15,
    }

    return sum + (severityWeight[issue.severity] || 10)
  }, 0)

  // Cap penalty at 100
  const score = Math.max(0, 100 - totalPenalty)
  return Math.round(score)
}

/**
 * Map difficulty level to issue severity
 */
function mapDifficultyToSeverity(difficultyLevel: number): "low" | "medium" | "high" {
  if (difficultyLevel <= 3) return "low"
  if (difficultyLevel <= 7) return "medium"
  return "high"
}

/**
 * Deduplicate similar issues
 */
function deduplicateIssues(issues: GrammarIssue[]): GrammarIssue[] {
  const seen = new Set<string>()
  const unique: GrammarIssue[] = []

  for (const issue of issues) {
    const key = `${issue.category}-${issue.severity}-${issue.suggestion || issue.description || ""}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(issue)
    }
  }

  return unique
}

/**
 * Analyze naturalness of text using AI
 */
async function analyzeNaturalness(
  text: string,
  language: Language
): Promise<{ score: number }> {
  try {
    const result = await aiService.getNaturalnessFeedback({
      text,
      language,
      type: "naturalness"
    })

    // Convert feedback to a naturalness score (0-100)
    // If AI detected issues, reduce score proportionally
    const baseScore = 85
    const issueCount = result.corrections?.length || 0
    const penaltyPerIssue = 10

    const score = Math.max(0, baseScore - issueCount * penaltyPerIssue)
    return { score }
  } catch {
    // Default to high score if AI service fails
    return { score: 80 }
  }
}
