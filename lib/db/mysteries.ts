import { sql } from "@/lib/db"
import type { MysteryItem, Language } from "@/lib/types"

export interface CreateMysteryInput {
  userId: string
  language: Language
  phrase: string
  context?: string
}

// Create a new mystery
export async function createMystery(input: CreateMysteryInput): Promise<MysteryItem> {
  const result = await sql`
    INSERT INTO mystery_items (user_id, language, phrase, context)
    VALUES (${input.userId}, ${input.language}, ${input.phrase}, ${input.context || null})
    RETURNING *
  `

  const row = result[0]
  return {
    id: row.id,
    userId: row.user_id,
    language: row.language,
    phrase: row.phrase,
    context: row.context || undefined,
    resolved: row.resolved,
    resolvedMeaning: row.resolved_meaning || undefined,
    encounters: row.encounters,
    createdAt: new Date(row.created_at),
  }
}

// Get all mysteries for a user
export async function getUserMysteries(
  userId: string,
  options?: {
    language?: Language
    resolved?: boolean
    limit?: number
  },
): Promise<MysteryItem[]> {
  let query = sql`
    SELECT * FROM mystery_items
    WHERE user_id = ${userId}
  `

  if (options?.language) {
    query = sql`${query} AND language = ${options.language}`
  }

  if (options?.resolved !== undefined) {
    query = sql`${query} AND resolved = ${options.resolved}`
  }

  query = sql`${query} ORDER BY created_at DESC`

  if (options?.limit) {
    query = sql`${query} LIMIT ${options.limit}`
  }

  const results = await query

  return results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    language: row.language,
    phrase: row.phrase,
    context: row.context || undefined,
    resolved: row.resolved,
    resolvedMeaning: row.resolved_meaning || undefined,
    encounters: row.encounters,
    createdAt: new Date(row.created_at),
  }))
}

// Resolve a mystery
export async function resolveMystery(mysteryId: string, userId: string, meaning: string): Promise<void> {
  await sql`
    UPDATE mystery_items
    SET resolved = true, resolved_meaning = ${meaning}
    WHERE id = ${mysteryId} AND user_id = ${userId}
  `
}

// Increment mystery encounters
export async function incrementMysteryEncounter(mysteryId: string): Promise<void> {
  await sql`
    UPDATE mystery_items
    SET encounters = encounters + 1
    WHERE id = ${mysteryId}
  `
}

// Delete a mystery
export async function deleteMystery(mysteryId: string, userId: string): Promise<void> {
  await sql`
    DELETE FROM mystery_items
    WHERE id = ${mysteryId} AND user_id = ${userId}
  `
}
