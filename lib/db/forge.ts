import { sql } from "@/lib/db"
import type { ForgeType, Language } from "@/lib/types"

export interface ForgePrompt {
  id: string
  type: ForgeType
  language: Language
  text: string
  difficulty: number
}

export interface ForgeResponse {
  id: string
  userId: string
  sessionId?: string
  promptId?: string
  responseText: string
  wordCount: number
  selfCorrections: number
  errorsIdentified: number
  createdAt: Date
}

// Get forge prompts
export async function getForgePrompts(options?: {
  type?: ForgeType
  language?: Language
  difficulty?: { min?: number; max?: number }
  limit?: number
  random?: boolean
}): Promise<ForgePrompt[]> {
  let query = sql`SELECT * FROM forge_prompts WHERE 1=1`

  if (options?.type) {
    query = sql`${query} AND type = ${options.type}`
  }

  if (options?.language) {
    query = sql`${query} AND language = ${options.language}`
  }

  if (options?.difficulty?.min !== undefined) {
    query = sql`${query} AND difficulty >= ${options.difficulty.min}`
  }

  if (options?.difficulty?.max !== undefined) {
    query = sql`${query} AND difficulty <= ${options.difficulty.max}`
  }

  if (options?.random) {
    query = sql`${query} ORDER BY RANDOM()`
  }

  if (options?.limit) {
    query = sql`${query} LIMIT ${options.limit}`
  }

  const results = await query

  return results.map((row) => ({
    id: row.id,
    type: row.type,
    language: row.language,
    text: row.text,
    difficulty: row.difficulty,
  }))
}

// Save forge response
export async function saveForgeResponse(input: {
  userId: string
  sessionId?: string
  promptId?: string
  responseText: string
  wordCount: number
  selfCorrections?: number
  errorsIdentified?: number
}): Promise<ForgeResponse> {
  const result = await sql`
    INSERT INTO forge_responses (user_id, session_id, prompt_id, response_text, word_count, self_corrections, errors_identified)
    VALUES (${input.userId}, ${input.sessionId || null}, ${input.promptId || null}, ${input.responseText}, ${input.wordCount}, ${input.selfCorrections || 0}, ${input.errorsIdentified || 0})
    RETURNING *
  `

  const row = result[0]
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id || undefined,
    promptId: row.prompt_id || undefined,
    responseText: row.response_text,
    wordCount: row.word_count,
    selfCorrections: row.self_corrections,
    errorsIdentified: row.errors_identified,
    createdAt: new Date(row.created_at),
  }
}

// Get user forge responses
export async function getUserForgeResponses(userId: string, options?: { limit?: number }): Promise<ForgeResponse[]> {
  let query = sql`
    SELECT * FROM forge_responses
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `

  if (options?.limit) {
    query = sql`${query} LIMIT ${options.limit}`
  }

  const results = await query

  return results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id || undefined,
    promptId: row.prompt_id || undefined,
    responseText: row.response_text,
    wordCount: row.word_count,
    selfCorrections: row.self_corrections,
    errorsIdentified: row.errors_identified,
    createdAt: new Date(row.created_at),
  }))
}
