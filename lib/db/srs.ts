import { sql } from "@/lib/db"
import type { ErrorItem, Language, ErrorType } from "@/lib/types"

// SM-2 Algorithm constants
const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

function rowToError(row: Record<string, unknown>): ErrorItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as ErrorType,
    language: row.language as Language,
    original: row.original as string,
    userGuess: row.user_guess as string,
    correct: row.correct as string,
    context: row.context as string | undefined,
    occurrences: Number(row.occurrences),
    lastSeen: new Date(row.last_seen as string),
    createdAt: new Date(row.created_at as string),
    // SRS fields
    nextReview: row.next_review ? new Date(row.next_review as string) : undefined,
    intervalDays: row.interval_days ? Number(row.interval_days) : undefined,
    easeFactor: row.ease_factor ? Number(row.ease_factor) : undefined,
    reviewCount: row.review_count ? Number(row.review_count) : undefined,
    lastReview: row.last_review ? new Date(row.last_review as string) : undefined,
  }
}

/**
 * Get errors due for SRS review
 */
export async function getErrorsDueForReview(
  userId: string,
  options?: {
    language?: Language
    limit?: number
  }
): Promise<ErrorItem[]> {
  const limit = options?.limit ?? 20
  const now = new Date().toISOString()

  if (options?.language) {
    const result = await sql`
      SELECT * FROM error_items
      WHERE user_id = ${userId}
        AND language = ${options.language}
        AND (next_review IS NULL OR next_review <= ${now})
      ORDER BY 
        CASE WHEN next_review IS NULL THEN 0 ELSE 1 END,
        next_review ASC,
        occurrences DESC
      LIMIT ${limit}
    `
    return result.map(rowToError)
  }

  const result = await sql`
    SELECT * FROM error_items
    WHERE user_id = ${userId}
      AND (next_review IS NULL OR next_review <= ${now})
    ORDER BY 
      CASE WHEN next_review IS NULL THEN 0 ELSE 1 END,
      next_review ASC,
      occurrences DESC
    LIMIT ${limit}
  `
  return result.map(rowToError)
}

/**
 * Process an SRS review response using SM-2 algorithm
 * @param quality - 0-5 rating (0-2 = fail, 3-5 = pass)
 */
export async function processReview(
  errorId: string,
  quality: number // 0-5
): Promise<ErrorItem> {
  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, quality))
  
  // Get current error state
  const current = await sql`
    SELECT * FROM error_items WHERE id = ${errorId}
  `
  
  if (current.length === 0) {
    throw new Error("Error not found")
  }
  
  const error = current[0]
  let interval = Number(error.interval_days) || 1
  let easeFactor = Number(error.ease_factor) || DEFAULT_EASE_FACTOR
  let reviewCount = Number(error.review_count) || 0
  
  // SM-2 Algorithm
  if (quality < 3) {
    // Failed review - reset interval
    interval = 1
  } else {
    // Passed review - calculate new interval
    if (reviewCount === 0) {
      interval = 1
    } else if (reviewCount === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    reviewCount++
  }
  
  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor)
  
  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  
  // Update the error
  const result = await sql`
    UPDATE error_items
    SET 
      interval_days = ${interval},
      ease_factor = ${easeFactor},
      review_count = ${reviewCount},
      next_review = ${nextReview.toISOString()},
      last_review = NOW()
    WHERE id = ${errorId}
    RETURNING *
  `
  
  return rowToError(result[0])
}

/**
 * Get SRS statistics for a user
 */
export async function getSRSStats(userId: string, language?: Language): Promise<{
  totalErrors: number
  dueToday: number
  dueThisWeek: number
  mastered: number // items with interval > 21 days
  learning: number // items with interval 1-21 days
  newItems: number // items never reviewed
}> {
  const langFilter = language ? sql`AND language = ${language}` : sql``
  const now = new Date()
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE next_review IS NULL OR next_review <= ${now.toISOString()}) as due_today,
      COUNT(*) FILTER (WHERE next_review <= ${weekFromNow.toISOString()}) as due_week,
      COUNT(*) FILTER (WHERE interval_days > 21) as mastered,
      COUNT(*) FILTER (WHERE interval_days BETWEEN 1 AND 21) as learning,
      COUNT(*) FILTER (WHERE review_count = 0 OR review_count IS NULL) as new_items
    FROM error_items
    WHERE user_id = ${userId} ${langFilter}
  `
  
  const stats = result[0]
  return {
    totalErrors: Number(stats.total) || 0,
    dueToday: Number(stats.due_today) || 0,
    dueThisWeek: Number(stats.due_week) || 0,
    mastered: Number(stats.mastered) || 0,
    learning: Number(stats.learning) || 0,
    newItems: Number(stats.new_items) || 0
  }
}
