import { sql } from "@/lib/db"
import type { VocabularyTracking, Language } from "@/lib/types"

function rowToTracking(row: Record<string, unknown>): VocabularyTracking {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    word: row.word as string,
    language: row.language as Language,
    canRecognize: row.can_recognize as boolean,
    canProduce: row.can_produce as boolean,
    recognitionCount: Number(row.recognition_count),
    productionCount: Number(row.production_count),
    lastRecognized: row.last_recognized ? new Date(row.last_recognized as string) : undefined,
    lastProduced: row.last_produced ? new Date(row.last_produced as string) : undefined,
    createdAt: new Date(row.created_at as string),
  }
}

export async function recordRecognition(data: {
  userId: string
  word: string
  language: Language
}): Promise<VocabularyTracking> {
  const result = await sql`
    INSERT INTO vocabulary_tracking (user_id, word, language, can_recognize, recognition_count, last_recognized)
    VALUES (${data.userId}, ${data.word.toLowerCase()}, ${data.language}, true, 1, NOW())
    ON CONFLICT (user_id, word, language)
    DO UPDATE SET
      can_recognize = true,
      recognition_count = vocabulary_tracking.recognition_count + 1,
      last_recognized = NOW()
    RETURNING *
  `
  return rowToTracking(result[0])
}

export async function recordProduction(data: {
  userId: string
  word: string
  language: Language
}): Promise<VocabularyTracking> {
  const result = await sql`
    INSERT INTO vocabulary_tracking (user_id, word, language, can_produce, production_count, last_produced)
    VALUES (${data.userId}, ${data.word.toLowerCase()}, ${data.language}, true, 1, NOW())
    ON CONFLICT (user_id, word, language)
    DO UPDATE SET
      can_produce = true,
      production_count = vocabulary_tracking.production_count + 1,
      last_produced = NOW()
    RETURNING *
  `
  return rowToTracking(result[0])
}

export async function getProductionGap(
  userId: string,
  language?: Language
): Promise<{
  canRecognizeOnly: number
  canProduceOnly: number
  canBoth: number
  gapPercentage: number
  wordsToFocus: VocabularyTracking[]
}> {
  const langFilter = language ? sql`AND language = ${language}` : sql``
  
  const statsResult = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE can_recognize = true AND can_produce = false) as recognize_only,
      COUNT(*) FILTER (WHERE can_produce = true AND can_recognize = false) as produce_only,
      COUNT(*) FILTER (WHERE can_recognize = true AND can_produce = true) as both
    FROM vocabulary_tracking
    WHERE user_id = ${userId} ${langFilter}
  `
  
  const stats = statsResult[0]
  const recognizeOnly = Number(stats.recognize_only) || 0
  const produceOnly = Number(stats.produce_only) || 0
  const both = Number(stats.both) || 0
  
  const totalRecognized = recognizeOnly + both
  const gapPercentage = totalRecognized > 0 
    ? Math.round((recognizeOnly / totalRecognized) * 100) 
    : 0
  
  // Get words user can recognize but not produce - these are focus areas
  const focusResult = await sql`
    SELECT * FROM vocabulary_tracking
    WHERE user_id = ${userId}
      AND can_recognize = true
      AND can_produce = false
      ${langFilter}
    ORDER BY recognition_count DESC
    LIMIT 20
  `
  
  return {
    canRecognizeOnly: recognizeOnly,
    canProduceOnly: produceOnly,
    canBoth: both,
    gapPercentage,
    wordsToFocus: focusResult.map(rowToTracking)
  }
}

export async function getVocabularyStats(
  userId: string,
  language?: Language
): Promise<{
  totalWords: number
  recognized: number
  produced: number
  gapWords: number
}> {
  const langFilter = language ? sql`AND language = ${language}` : sql``
  
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE can_recognize = true) as recognized,
      COUNT(*) FILTER (WHERE can_produce = true) as produced,
      COUNT(*) FILTER (WHERE can_recognize = true AND can_produce = false) as gap
    FROM vocabulary_tracking
    WHERE user_id = ${userId} ${langFilter}
  `
  
  const stats = result[0]
  return {
    totalWords: Number(stats.total) || 0,
    recognized: Number(stats.recognized) || 0,
    produced: Number(stats.produced) || 0,
    gapWords: Number(stats.gap) || 0
  }
}

// Get user vocabulary tracking for grading context
export async function getUserVocabularyTracking(
  userId: string,
  options?: {
    language?: Language
    limit?: number
  }
): Promise<VocabularyTracking[]> {
  const langFilter = options?.language ? sql`AND language = ${options.language}` : sql``
  const limit = options?.limit ?? 100

  const result = await sql`
    SELECT * FROM vocabulary_tracking
    WHERE user_id = ${userId} ${langFilter}
    ORDER BY last_recognized DESC NULLS LAST, last_produced DESC NULLS LAST
    LIMIT ${limit}
  `
  
  return result.map(rowToTracking)
}

