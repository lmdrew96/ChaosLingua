/**
 * Feedback Agent
 * 
 * Responsible for generating user-friendly feedback and corrections:
 * - Format corrections with explanations
 * - Adjust feedback verbosity based on user level
 * - Generate constructive suggestions
 * - Provide encouragement and next steps
 */

import type {
  GradingContext,
  GradingCorrection,
  GrammarIssue,
  Language,
} from "@/lib/types"
import type { GradingOutput } from "./grading-agent"

export interface FeedbackInput {
  gradingOutput: GradingOutput
  context: GradingContext
  originalText: string
  mode: "quick_fire" | "shadow_speak" | "writing_sprint" | "translation" | "conversation"
}

export interface FeedbackOutput {
  corrections: GradingCorrection[]
  summary: string
  encouragement: string
  suggestions: string[]
  detailLevel: "minimal" | "standard" | "detailed"
}

/**
 * Generate user-friendly feedback from grading results
 */
export async function generateFeedback(
  input: FeedbackInput
): Promise<FeedbackOutput> {
  const { gradingOutput, context, originalText, mode } = input

  // Determine detail level based on user level
  const detailLevel = determineDetailLevel(context.userLevel, mode)

  // Generate corrections from grammar issues
  const corrections = generateCorrections(
    gradingOutput.grammarIssues,
    originalText,
    detailLevel,
    context
  )

  // Generate summary feedback
  const summary = generateSummary(gradingOutput, context.userLevel)

  // Generate encouragement
  const encouragement = generateEncouragement(gradingOutput.overallScore)

  // Generate actionable suggestions
  const suggestions = generateSuggestions(
    gradingOutput,
    context,
    mode
  )

  return {
    corrections,
    summary,
    encouragement,
    suggestions,
    detailLevel,
  }
}

/**
 * Determine appropriate detail level for feedback
 */
function determineDetailLevel(
  userLevel: number,
  mode: string
): "minimal" | "standard" | "detailed" {
  // Quick fire = minimal (fast pace)
  if (mode === "quick_fire") return "minimal"

  // Writing sprint = detailed (time to reflect)
  if (mode === "writing_sprint") return "detailed"

  // For other modes, base on user level
  if (userLevel <= 3) return "detailed" // Beginners need more explanation
  if (userLevel <= 7) return "standard"
  return "minimal" // Advanced learners can infer
}

/**
 * Generate correction objects from grammar issues
 */
function generateCorrections(
  issues: GrammarIssue[],
  originalText: string,
  detailLevel: "minimal" | "standard" | "detailed",
  context: GradingContext
): GradingCorrection[] {
  const corrections: GradingCorrection[] = []

  // Sort by severity (most serious first)
  const severityOrder = { high: 3, medium: 2, low: 1 }
  const sortedIssues = [...issues].sort(
    (a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
  )

  // Limit corrections based on detail level
  const limit = {
    minimal: 3,
    standard: 5,
    detailed: 10,
  }[detailLevel]

  for (const issue of sortedIssues.slice(0, limit)) {
    const correction = createCorrection(issue, originalText, detailLevel, context)
    corrections.push(correction)
  }

  return corrections
}

/**
 * Create a single correction object
 */
function createCorrection(
  issue: GrammarIssue,
  originalText: string,
  detailLevel: "minimal" | "standard" | "detailed",
  context: GradingContext
): GradingCorrection {
  // Extract the problematic segment
  const position = issue.position || 0
  const startPos = Math.max(0, position - 10)
  const endPos = Math.min(originalText.length, position + 50)
  const segment = originalText.slice(startPos, endPos)

  // Get the incorrect text (simplified - would need proper span extraction)
  const incorrect = segment.trim()

  // Get or generate correction
  const correct = issue.suggestion || generateCorrection(incorrect, issue, context)

  // Generate explanation based on detail level
  const explanation = generateExplanation(issue, detailLevel, context)

  // Determine if this is a recurring pattern
  const isRecurring = context.proficiencyPatterns.some(
    (p) => p.category === issue.category && (p.occurrences || 0) > 2
  )

  return {
    original: incorrect,
    corrected: correct,
    explanation,
    isRecurring,
    type: mapCategoryToType(issue.category),
  }
}

/**
 * Generate a correction suggestion
 */
function generateCorrection(
  incorrect: string,
  issue: GrammarIssue,
  context: GradingContext
): string {
  // If we have a rule, try to find the correct form from examples
  if (issue.ruleId && issue.ruleId !== "ai-detected") {
    const rule = context.grammarRules.find((r) => r.id === issue.ruleId)
    if (rule?.examples?.[0]?.correct) {
      return rule.examples[0].correct
    }
  }

  // Fallback: return the incorrect text with a marker
  return `[corrected: ${incorrect}]`
}

/**
 * Generate explanation based on detail level
 */
function generateExplanation(
  issue: GrammarIssue,
  detailLevel: "minimal" | "standard" | "detailed",
  context: GradingContext
): string {
  const description = issue.description || `${issue.category} error`
  
  if (detailLevel === "minimal") {
    // Just the rule name or category
    return description.split(":")[0] || issue.category
  }

  if (detailLevel === "standard") {
    // Rule + brief explanation
    let explanation = description

    if (issue.explanation) {
      explanation += ` — ${issue.explanation}`
    }

    return explanation
  }

  // Detailed: Include examples from the rule
  let explanation = description

  if (issue.explanation) {
    explanation += `\n\n${issue.explanation}`
  }

  // Add example if we have the rule
  if (issue.ruleId && issue.ruleId !== "ai-detected") {
    const rule = context.grammarRules.find((r) => r.id === issue.ruleId)
    if (rule?.examples?.[0]) {
      const example = rule.examples[0]
      explanation += `\n\nExample:\n✗ ${example.incorrect}\n✓ ${example.correct}`
    }
  }

  return explanation
}

/**
 * Generate summary feedback
 */
function generateSummary(output: GradingOutput, userLevel: number): string {
  const { overallScore, grammarScore, vocabularyScore, naturalnessScore } = output

  if (overallScore >= 90) {
    return "Excellent work! Your response is highly accurate and natural."
  }

  if (overallScore >= 75) {
    return "Good job! Your response is mostly correct with a few minor issues."
  }

  if (overallScore >= 60) {
    return "Nice effort! Let's work on improving a few areas."
  }

  // Lower scores - provide specific guidance
  const weakest = Math.min(grammarScore, vocabularyScore, naturalnessScore)

  if (weakest === grammarScore) {
    return "Focus on grammar accuracy. Review the corrections below carefully."
  }

  if (weakest === vocabularyScore) {
    return "Try using vocabulary you're more familiar with for now."
  }

  return "Work on making your phrasing sound more natural."
}

/**
 * Generate encouragement based on score
 */
function generateEncouragement(score: number): string {
  if (score >= 95) return "Outstanding! 🌟"
  if (score >= 85) return "Great work! 👏"
  if (score >= 75) return "Well done! 💪"
  if (score >= 60) return "Keep practicing! 📚"
  return "Don't give up! Every mistake is a learning opportunity. 🌱"
}

/**
 * Generate actionable suggestions
 */
function generateSuggestions(
  output: GradingOutput,
  context: GradingContext,
  mode: string
): string[] {
  const suggestions: string[] = []

  // Grammar-specific suggestions
  if (output.grammarScore < 75) {
    const commonCategories = findCommonErrorCategories(output.grammarIssues)
    if (commonCategories.length > 0) {
      suggestions.push(
        `Review ${commonCategories[0]} rules - this is a recurring challenge`
      )
    }
  }

  // Vocabulary suggestions
  if (output.vocabularyScore < 75) {
    suggestions.push(
      "Try using simpler vocabulary that you've practiced more"
    )
  }

  // Naturalness suggestions
  if (output.naturalnessScore < 75) {
    suggestions.push(
      "Listen to more native content to improve your phrasing"
    )
  }

  // Check weak proficiency patterns
  const weakPatterns = context.proficiencyPatterns
    .filter((p) => p.masteryLevel < 0.5)
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .slice(0, 2)

  for (const pattern of weakPatterns) {
    suggestions.push(
      `Practice more with ${pattern.category} (${Math.round(pattern.masteryLevel * 100)}% mastery)`
    )
  }

  // Mode-specific suggestions
  if (mode === "quick_fire" && output.overallScore >= 80) {
    suggestions.push("Try increasing the difficulty level for more challenge")
  }

  if (mode === "writing_sprint" && output.overallScore < 70) {
    suggestions.push("Take your time to review before submitting")
  }

  // Limit to 3 most relevant suggestions
  return suggestions.slice(0, 3)
}

/**
 * Find most common error categories
 */
function findCommonErrorCategories(issues: GrammarIssue[]): string[] {
  const categoryCounts = new Map<string, number>()

  for (const issue of issues) {
    categoryCounts.set(
      issue.category,
      (categoryCounts.get(issue.category) || 0) + 1
    )
  }

  return Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
}

/**
 * Map grammar category to correction type
 */
function mapCategoryToType(
  category: string
): "grammar" | "vocabulary" | "spelling" | "punctuation" | "style" {
  const mapping: Record<
    string,
    "grammar" | "vocabulary" | "spelling" | "punctuation" | "style"
  > = {
    verb: "grammar",
    noun: "grammar",
    adjective: "grammar",
    article: "grammar",
    case: "grammar",
    particle: "grammar",
    conjugation: "grammar",
    honorific: "grammar",
    word_choice: "vocabulary",
    spelling: "spelling",
    punctuation: "punctuation",
    phrasing: "style",
    naturalness: "style",
  }

  return mapping[category.toLowerCase()] || "grammar"
}
