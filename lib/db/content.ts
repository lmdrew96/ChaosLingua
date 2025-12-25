import { sql } from "@/lib/db"
import type { ContentItem, ContentType, Language } from "@/lib/types"

// Get content items
export async function getContentItems(options?: {
  language?: Language
  type?: ContentType
  difficulty?: { min?: number; max?: number }
  topics?: string[]
  limit?: number
  random?: boolean
}): Promise<ContentItem[]> {
  let query = sql`SELECT * FROM content_items WHERE 1=1`

  if (options?.language) {
    query = sql`${query} AND language = ${options.language}`
  }

  if (options?.type) {
    query = sql`${query} AND type = ${options.type}`
  }

  if (options?.difficulty?.min !== undefined) {
    query = sql`${query} AND difficulty >= ${options.difficulty.min}`
  }

  if (options?.difficulty?.max !== undefined) {
    query = sql`${query} AND difficulty <= ${options.difficulty.max}`
  }

  if (options?.topics && options.topics.length > 0) {
    query = sql`${query} AND topics && ${options.topics}`
  }

  if (options?.random) {
    query = sql`${query} ORDER BY RANDOM()`
  } else {
    query = sql`${query} ORDER BY created_at DESC`
  }

  if (options?.limit) {
    query = sql`${query} LIMIT ${options.limit}`
  }

  const results = await query

  return results.map((row) => ({
    id: row.id,
    type: row.type,
    language: row.language,
    difficulty: row.difficulty,
    lengthMinutes: row.length_minutes,
    topics: row.topics || [],
    sourceUrl: row.source_url || undefined,
    transcript: row.transcript || undefined,
    title: row.title,
    description: row.description || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
  }))
}

// Get a single content item
export async function getContentItem(id: string): Promise<ContentItem | null> {
  const result = await sql`
    SELECT * FROM content_items WHERE id = ${id}
  `

  if (result.length === 0) return null

  const row = result[0]
  return {
    id: row.id,
    type: row.type,
    language: row.language,
    difficulty: row.difficulty,
    lengthMinutes: row.length_minutes,
    topics: row.topics || [],
    sourceUrl: row.source_url || undefined,
    transcript: row.transcript || undefined,
    title: row.title,
    description: row.description || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
  }
}
