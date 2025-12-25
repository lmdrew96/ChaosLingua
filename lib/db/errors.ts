import { sql } from "@/lib/db"
import type { ErrorItem, ErrorType, Language } from "@/lib/types"

export interface CreateErrorInput {
  userId: string
  type: ErrorType
  language: Language
  original: string
  userGuess?: string
  correct: string
  context?: string
}

// Create a new error
export async function createError(input: CreateErrorInput): Promise<ErrorItem> {
  const result = await sql`
    INSERT INTO error_items (user_id, type, language, original, user_guess, correct, context)
    VALUES (${input.userId}, ${input.type}, ${input.language}, ${input.original}, ${input.userGuess || null}, ${input.correct}, ${input.context || null})
    RETURNING *
  `

  const row = result[0]
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    language: row.language,
    original: row.original,
    userGuess: row.user_guess || "",
    correct: row.correct,
    context: row.context || undefined,
    occurrences: row.occurrences,
    lastSeen: new Date(row.last_seen),
    createdAt: new Date(row.created_at),
  }
}

// Get all errors for a user
export async function getUserErrors(
  userId: string,
  options?: {
    language?: Language
    type?: ErrorType
    limit?: number
    offset?: number
  },
): Promise<ErrorItem[]> {
  let query = sql`
    SELECT * FROM error_items
    WHERE user_id = ${userId}
  `

  if (options?.language) {
    query = sql`${query} AND language = ${options.language}`
  }

  if (options?.type) {
    query = sql`${query} AND type = ${options.type}`
  }

  query = sql`${query} ORDER BY last_seen DESC`

  if (options?.limit) {
    query = sql`${query} LIMIT ${options.limit}`
  }

  if (options?.offset) {
    query = sql`${query} OFFSET ${options.offset}`
  }

  const results = await query

  return results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    language: row.language,
    original: row.original,
    userGuess: row.user_guess || "",
    correct: row.correct,
    context: row.context || undefined,
    occurrences: row.occurrences,
    lastSeen: new Date(row.last_seen),
    createdAt: new Date(row.created_at),
  }))
}

// Increment error occurrence
export async function incrementErrorOccurrence(errorId: string): Promise<void> {
  await sql`
    UPDATE error_items
    SET occurrences = occurrences + 1, last_seen = NOW()
    WHERE id = ${errorId}
  `
}

// Delete an error
export async function deleteError(errorId: string, userId: string): Promise<void> {
  await sql`
    DELETE FROM error_items
    WHERE id = ${errorId} AND user_id = ${userId}
  `
}

// Get error stats for user
export async function getErrorStats(userId: string): Promise<{
  total: number
  byType: Record<ErrorType, number>
  byLanguage: Record<Language, number>
}> {
  const total = await sql`
    SELECT COUNT(*) as count FROM error_items WHERE user_id = ${userId}
  `

  const byType = await sql`
    SELECT type, COUNT(*) as count
    FROM error_items
    WHERE user_id = ${userId}
    GROUP BY type
  `

  const byLanguage = await sql`
    SELECT language, COUNT(*) as count
    FROM error_items
    WHERE user_id = ${userId}
    GROUP BY language
  `

  return {
    total: Number(total[0]?.count || 0),
    byType: byType.reduce(
      (acc, row) => {
        acc[row.type as ErrorType] = Number(row.count)
        return acc
      },
      {} as Record<ErrorType, number>,
    ),
    byLanguage: byLanguage.reduce(
      (acc, row) => {
        acc[row.language as Language] = Number(row.count)
        return acc
      },
      {} as Record<Language, number>,
    ),
  }
}
