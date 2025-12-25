import { sql } from "@/lib/db"
import type { Session, SessionType, SessionMood, Language } from "@/lib/types"

export interface CreateSessionInput {
  userId: string
  type: SessionType
  language: Language
}

// Start a new session
export async function createSession(input: CreateSessionInput): Promise<Session> {
  const result = await sql`
    INSERT INTO sessions (user_id, type, language)
    VALUES (${input.userId}, ${input.type}, ${input.language})
    RETURNING *
  `

  const row = result[0]
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    language: row.language,
    duration: row.duration,
    startedAt: new Date(row.started_at),
    endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
    reflection: row.reflection || undefined,
    mood: row.mood || undefined,
  }
}

// End a session
export async function endSession(
  sessionId: string,
  userId: string,
  data: {
    duration: number
    reflection?: string
    mood?: SessionMood
  },
): Promise<void> {
  await sql`
    UPDATE sessions
    SET
      ended_at = NOW(),
      duration = ${data.duration},
      reflection = ${data.reflection || null},
      mood = ${data.mood || null}
    WHERE id = ${sessionId} AND user_id = ${userId}
  `
}

// Get user sessions
export async function getUserSessions(
  userId: string,
  options?: {
    type?: SessionType
    language?: Language
    limit?: number
    offset?: number
  },
): Promise<Session[]> {
  let query = sql`
    SELECT * FROM sessions
    WHERE user_id = ${userId}
  `

  if (options?.type) {
    query = sql`${query} AND type = ${options.type}`
  }

  if (options?.language) {
    query = sql`${query} AND language = ${options.language}`
  }

  query = sql`${query} ORDER BY started_at DESC`

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
    duration: row.duration,
    startedAt: new Date(row.started_at),
    endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
    reflection: row.reflection || undefined,
    mood: row.mood || undefined,
  }))
}

// Get session stats
export async function getSessionStats(userId: string): Promise<{
  totalSessions: number
  totalDuration: number
  byType: Record<SessionType, number>
  recentMoods: SessionMood[]
}> {
  const total = await sql`
    SELECT COUNT(*) as count, SUM(duration) as total_duration
    FROM sessions
    WHERE user_id = ${userId}
  `

  const byType = await sql`
    SELECT type, COUNT(*) as count
    FROM sessions
    WHERE user_id = ${userId}
    GROUP BY type
  `

  const recentMoods = await sql`
    SELECT mood FROM sessions
    WHERE user_id = ${userId} AND mood IS NOT NULL
    ORDER BY started_at DESC
    LIMIT 10
  `

  return {
    totalSessions: Number(total[0]?.count || 0),
    totalDuration: Number(total[0]?.total_duration || 0),
    byType: byType.reduce(
      (acc, row) => {
        acc[row.type as SessionType] = Number(row.count)
        return acc
      },
      {} as Record<SessionType, number>,
    ),
    recentMoods: recentMoods.map((row) => row.mood as SessionMood),
  }
}
