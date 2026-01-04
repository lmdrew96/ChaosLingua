import { sql } from "@/lib/db"
import type {
  GrammarRule,
  GrammarExample,
  PronunciationPhoneme,
  ForgeSubmission,
  GradingResult,
  GradingCorrection,
  GrammarIssue,
  PronunciationError,
  ProficiencyPattern,
  Language,
  ForgeType,
} from "@/lib/types"

// ========================================
// GRAMMAR RULES
// ========================================

export async function getGrammarRules(options?: {
  language?: Language
  category?: string
  difficultyLevel?: { min?: number; max?: number }
  limit?: number
}): Promise<GrammarRule[]> {
  let query = sql`
    SELECT * FROM grammar_rules
    WHERE 1=1
  `

  if (options?.language) {
    query = sql`${query} AND language = ${options.language}`
  }

  if (options?.category) {
    query = sql`${query} AND category = ${options.category}`
  }

  if (options?.difficultyLevel?.min !== undefined) {
    query = sql`${query} AND difficulty_level >= ${options.difficultyLevel.min}`
  }

  if (options?.difficultyLevel?.max !== undefined) {
    query = sql`${query} AND difficulty_level <= ${options.difficultyLevel.max}`
  }

  query = sql`${query} ORDER BY difficulty_level ASC`

  if (options?.limit) {
    query = sql`${query} LIMIT ${options.limit}`
  }

  const results = await query

  return results.map((row) => ({
    id: row.id,
    language: row.language as Language,
    category: row.category,
    ruleName: row.rule_name,
    description: row.description,
    difficultyLevel: row.difficulty_level,
    examples: (row.examples || []) as GrammarExample[],
    gfRglReference: row.gf_rgl_reference || undefined,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }))
}

export async function getGrammarRuleById(id: string): Promise<GrammarRule | null> {
  const results = await sql`
    SELECT * FROM grammar_rules WHERE id = ${id}
  `

  if (results.length === 0) return null

  const row = results[0]
  return {
    id: row.id,
    language: row.language as Language,
    category: row.category,
    ruleName: row.rule_name,
    description: row.description,
    difficultyLevel: row.difficulty_level,
    examples: (row.examples || []) as GrammarExample[],
    gfRglReference: row.gf_rgl_reference || undefined,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export async function createGrammarRule(input: {
  language: Language
  category: string
  ruleName: string
  description: string
  difficultyLevel: number
  examples?: GrammarExample[]
  gfRglReference?: string
  source: string
}): Promise<GrammarRule> {
  const results = await sql`
    INSERT INTO grammar_rules (
      language, category, rule_name, description, difficulty_level,
      examples, gf_rgl_reference, source
    )
    VALUES (
      ${input.language}, ${input.category}, ${input.ruleName}, ${input.description},
      ${input.difficultyLevel}, ${JSON.stringify(input.examples || [])},
      ${input.gfRglReference || null}, ${input.source}
    )
    RETURNING *
  `

  const row = results[0]
  return {
    id: row.id,
    language: row.language as Language,
    category: row.category,
    ruleName: row.rule_name,
    description: row.description,
    difficultyLevel: row.difficulty_level,
    examples: (row.examples || []) as GrammarExample[],
    gfRglReference: row.gf_rgl_reference || undefined,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// ========================================
// PRONUNCIATION PHONEMES
// ========================================

export async function getPronunciationPhonemes(language: Language): Promise<PronunciationPhoneme[]> {
  const results = await sql`
    SELECT * FROM pronunciation_phonemes
    WHERE language = ${language}
    ORDER BY phoneme ASC
  `

  return results.map((row) => ({
    id: row.id,
    language: row.language as Language,
    phoneme: row.phoneme,
    ipa: row.ipa,
    description: row.description || undefined,
    commonErrors: row.common_errors || [],
    exampleWords: row.example_words || undefined,
    createdAt: new Date(row.created_at),
  }))
}

// ========================================
// FORGE SUBMISSIONS
// ========================================

export async function createForgeSubmission(input: {
  userId: string
  sessionId?: string
  forgeType: ForgeType
  promptId?: string
  submissionText?: string
  submissionAudioUrl?: string
  transcript?: string
  language: Language
}): Promise<ForgeSubmission> {
  const results = await sql`
    INSERT INTO forge_submissions (
      user_id, session_id, forge_type, prompt_id,
      submission_text, submission_audio_url, transcript, language
    )
    VALUES (
      ${input.userId}, ${input.sessionId || null}, ${input.forgeType},
      ${input.promptId || null}, ${input.submissionText || null},
      ${input.submissionAudioUrl || null}, ${input.transcript || null},
      ${input.language}
    )
    RETURNING *
  `

  const row = results[0]
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id || undefined,
    forgeType: row.forge_type as ForgeType,
    promptId: row.prompt_id || undefined,
    submissionText: row.submission_text || undefined,
    submissionAudioUrl: row.submission_audio_url || undefined,
    transcript: row.transcript || undefined,
    language: row.language as Language,
    createdAt: new Date(row.created_at),
  }
}

export async function getForgeSubmission(id: string): Promise<ForgeSubmission | null> {
  const results = await sql`
    SELECT * FROM forge_submissions WHERE id = ${id}
  `

  if (results.length === 0) return null

  const row = results[0]
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id || undefined,
    forgeType: row.forge_type as ForgeType,
    promptId: row.prompt_id || undefined,
    submissionText: row.submission_text || undefined,
    submissionAudioUrl: row.submission_audio_url || undefined,
    transcript: row.transcript || undefined,
    language: row.language as Language,
    createdAt: new Date(row.created_at),
  }
}

export async function getUserForgeSubmissions(
  userId: string,
  options?: { forgeType?: ForgeType; limit?: number }
): Promise<ForgeSubmission[]> {
  let query = sql`
    SELECT * FROM forge_submissions
    WHERE user_id = ${userId}
  `

  if (options?.forgeType) {
    query = sql`${query} AND forge_type = ${options.forgeType}`
  }

  query = sql`${query} ORDER BY created_at DESC`

  if (options?.limit) {
    query = sql`${query} LIMIT ${options.limit}`
  }

  const results = await query

  return results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id || undefined,
    forgeType: row.forge_type as ForgeType,
    promptId: row.prompt_id || undefined,
    submissionText: row.submission_text || undefined,
    submissionAudioUrl: row.submission_audio_url || undefined,
    transcript: row.transcript || undefined,
    language: row.language as Language,
    createdAt: new Date(row.created_at),
  }))
}

// ========================================
// GRADING RESULTS
// ========================================

export async function createGradingResult(input: {
  submissionId: string
  overallScore: number
  grammarScore?: number
  vocabularyScore?: number
  naturalnessScore?: number
  pronunciationScore?: number
  corrections: GradingCorrection[]
  feedback: string
  suggestions: string[]
  grammarIssues?: GrammarIssue[]
  vocabularyGaps?: string[]
  pronunciationErrors?: PronunciationError[]
  agentVersion?: string
}): Promise<GradingResult> {
  const results = await sql`
    INSERT INTO grading_results (
      submission_id, overall_score, grammar_score, vocabulary_score,
      naturalness_score, pronunciation_score, corrections, feedback,
      suggestions, grammar_issues, vocabulary_gaps, pronunciation_errors,
      agent_version
    )
    VALUES (
      ${input.submissionId}, ${input.overallScore},
      ${input.grammarScore || null}, ${input.vocabularyScore || null},
      ${input.naturalnessScore || null}, ${input.pronunciationScore || null},
      ${JSON.stringify(input.corrections)}, ${input.feedback},
      ${input.suggestions}, ${JSON.stringify(input.grammarIssues || [])},
      ${input.vocabularyGaps || []}, ${JSON.stringify(input.pronunciationErrors || [])},
      ${input.agentVersion || "v1.0"}
    )
    RETURNING *
  `

  const row = results[0]
  return {
    id: row.id,
    submissionId: row.submission_id,
    overallScore: Number(row.overall_score),
    grammarScore: row.grammar_score ? Number(row.grammar_score) : undefined,
    vocabularyScore: row.vocabulary_score ? Number(row.vocabulary_score) : undefined,
    naturalnessScore: row.naturalness_score ? Number(row.naturalness_score) : undefined,
    pronunciationScore: row.pronunciation_score ? Number(row.pronunciation_score) : undefined,
    corrections: row.corrections as GradingCorrection[],
    feedback: row.feedback,
    suggestions: row.suggestions,
    grammarIssues: (row.grammar_issues || []) as GrammarIssue[],
    vocabularyGaps: row.vocabulary_gaps || [],
    pronunciationErrors: (row.pronunciation_errors || []) as PronunciationError[],
    gradedAt: new Date(row.graded_at),
    agentVersion: row.agent_version,
  }
}

export async function getGradingResult(submissionId: string): Promise<GradingResult | null> {
  const results = await sql`
    SELECT * FROM grading_results WHERE submission_id = ${submissionId}
  `

  if (results.length === 0) return null

  const row = results[0]
  return {
    id: row.id,
    submissionId: row.submission_id,
    overallScore: Number(row.overall_score),
    grammarScore: row.grammar_score ? Number(row.grammar_score) : undefined,
    vocabularyScore: row.vocabulary_score ? Number(row.vocabulary_score) : undefined,
    naturalnessScore: row.naturalness_score ? Number(row.naturalness_score) : undefined,
    pronunciationScore: row.pronunciation_score ? Number(row.pronunciation_score) : undefined,
    corrections: row.corrections as GradingCorrection[],
    feedback: row.feedback,
    suggestions: row.suggestions,
    grammarIssues: (row.grammar_issues || []) as GrammarIssue[],
    vocabularyGaps: row.vocabulary_gaps || [],
    pronunciationErrors: (row.pronunciation_errors || []) as PronunciationError[],
    gradedAt: new Date(row.graded_at),
    agentVersion: row.agent_version,
  }
}

// ========================================
// PROFICIENCY PATTERNS
// ========================================

export async function getProficiencyPatterns(
  userId: string,
  options?: {
    language?: Language
    category?: string
    masteryThreshold?: number
  }
): Promise<ProficiencyPattern[]> {
  let query = sql`
    SELECT * FROM proficiency_patterns
    WHERE user_id = ${userId}
  `

  if (options?.language) {
    query = sql`${query} AND language = ${options.language}`
  }

  if (options?.category) {
    query = sql`${query} AND category = ${options.category}`
  }

  if (options?.masteryThreshold !== undefined) {
    query = sql`${query} AND mastery_level < ${options.masteryThreshold}`
  }

  query = sql`${query} ORDER BY last_seen DESC`

  const results = await query

  return results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    language: row.language as Language,
    category: row.category as "grammar" | "vocabulary" | "pronunciation" | "naturalness",
    patternType: row.pattern_type,
    grammarRuleId: row.grammar_rule_id || undefined,
    occurrences: row.occurrences,
    correctUses: row.correct_uses,
    incorrectUses: row.incorrect_uses,
    masteryLevel: Number(row.mastery_level),
    firstSeen: new Date(row.first_seen),
    lastSeen: new Date(row.last_seen),
    lastCorrect: row.last_correct ? new Date(row.last_correct) : undefined,
    lastIncorrect: row.last_incorrect ? new Date(row.last_incorrect) : undefined,
  }))
}

export async function updateProficiencyPattern(input: {
  userId: string
  language: Language
  category: string
  patternType: string
  isCorrect: boolean
  grammarRuleId?: string
}): Promise<void> {
  await sql`
    SELECT update_proficiency_pattern(
      ${input.userId}, ${input.language}, ${input.category},
      ${input.patternType}, ${input.isCorrect}, ${input.grammarRuleId || null}
    )
  `
}

export async function getWeakPatterns(
  userId: string,
  language: Language,
  limit = 10
): Promise<ProficiencyPattern[]> {
  const results = await sql`
    SELECT * FROM proficiency_patterns
    WHERE user_id = ${userId}
      AND language = ${language}
      AND mastery_level < 0.70
    ORDER BY mastery_level ASC, occurrences DESC
    LIMIT ${limit}
  `

  return results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    language: row.language as Language,
    category: row.category as "grammar" | "vocabulary" | "pronunciation" | "naturalness",
    patternType: row.pattern_type,
    grammarRuleId: row.grammar_rule_id || undefined,
    occurrences: row.occurrences,
    correctUses: row.correct_uses,
    incorrectUses: row.incorrect_uses,
    masteryLevel: Number(row.mastery_level),
    firstSeen: new Date(row.first_seen),
    lastSeen: new Date(row.last_seen),
    lastCorrect: row.last_correct ? new Date(row.last_correct) : undefined,
    lastIncorrect: row.last_incorrect ? new Date(row.last_incorrect) : undefined,
  }))
}
