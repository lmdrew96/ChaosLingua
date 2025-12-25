import { sql } from "@/lib/db"
import type { UserGuess, GuessType, Language } from "@/lib/types"

function rowToGuess(row: Record<string, unknown>): UserGuess {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    sessionId: row.session_id as string | undefined,
    contentId: row.content_id as string | undefined,
    language: row.language as Language,
    guessType: row.guess_type as GuessType,
    original: row.original as string,
    userGuess: row.user_guess as string,
    correctAnswer: row.correct_answer as string | undefined,
    isCorrect: row.is_correct as boolean | undefined,
    isClose: row.is_close as boolean,
    isCreative: row.is_creative as boolean,
    createdAt: new Date(row.created_at as string),
  }
}

export async function createGuess(data: {
  userId: string
  sessionId?: string
  contentId?: string
  language: Language
  guessType: GuessType
  original: string
  userGuess: string
  correctAnswer?: string
  isCorrect?: boolean
  isClose?: boolean
  isCreative?: boolean
}): Promise<UserGuess> {
  const result = await sql`
    INSERT INTO user_guesses (
      user_id, session_id, content_id, language, guess_type,
      original, user_guess, correct_answer, is_correct, is_close, is_creative
    )
    VALUES (
      ${data.userId}, ${data.sessionId || null}, ${data.contentId || null},
      ${data.language}, ${data.guessType}, ${data.original}, ${data.userGuess},
      ${data.correctAnswer || null}, ${data.isCorrect ?? null},
      ${data.isClose ?? false}, ${data.isCreative ?? false}
    )
    RETURNING *
  `
  return rowToGuess(result[0])
}

export async function getGuessesByUser(
  userId: string,
  options?: {
    language?: Language
    sessionId?: string
    isCorrect?: boolean
    limit?: number
  }
): Promise<UserGuess[]> {
  const limit = options?.limit ?? 50

  if (options?.sessionId) {
    const result = await sql`
      SELECT * FROM user_guesses
      WHERE user_id = ${userId} AND session_id = ${options.sessionId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.map(rowToGuess)
  }

  if (options?.language && options?.isCorrect !== undefined) {
    const result = await sql`
      SELECT * FROM user_guesses
      WHERE user_id = ${userId} 
        AND language = ${options.language}
        AND is_correct = ${options.isCorrect}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.map(rowToGuess)
  }

  if (options?.language) {
    const result = await sql`
      SELECT * FROM user_guesses
      WHERE user_id = ${userId} AND language = ${options.language}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.map(rowToGuess)
  }

  const result = await sql`
    SELECT * FROM user_guesses
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result.map(rowToGuess)
}

export async function getGuessStats(userId: string, language?: Language): Promise<{
  total: number
  correct: number
  incorrect: number
  close: number
  creative: number
  accuracy: number
}> {
  const langFilter = language ? sql`AND language = ${language}` : sql``
  
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_correct = true) as correct,
      COUNT(*) FILTER (WHERE is_correct = false) as incorrect,
      COUNT(*) FILTER (WHERE is_close = true) as close,
      COUNT(*) FILTER (WHERE is_creative = true) as creative
    FROM user_guesses
    WHERE user_id = ${userId} ${langFilter}
  `
  
  const stats = result[0]
  const total = Number(stats.total) || 0
  const correct = Number(stats.correct) || 0
  
  return {
    total,
    correct,
    incorrect: Number(stats.incorrect) || 0,
    close: Number(stats.close) || 0,
    creative: Number(stats.creative) || 0,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
  }
}

export async function markGuessAsCreative(guessId: string): Promise<void> {
  await sql`
    UPDATE user_guesses
    SET is_creative = true
    WHERE id = ${guessId}
  `
}
