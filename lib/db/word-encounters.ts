import { sql } from "@/lib/db"
import type { WordEncounter, Language } from "@/lib/types"

function rowToEncounter(row: Record<string, unknown>): WordEncounter {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    word: row.word as string,
    language: row.language as Language,
    context: row.context as string | undefined,
    contentId: row.content_id as string | undefined,
    encounterCount: Number(row.encounter_count),
    definitionUnlocked: row.definition_unlocked as boolean,
    selfDiscovered: row.self_discovered as boolean,
    lookedUp: row.looked_up as boolean,
    firstSeen: new Date(row.first_seen as string),
    lastSeen: new Date(row.last_seen as string),
  }
}

export async function recordWordEncounter(data: {
  userId: string
  word: string
  language: Language
  context?: string
  contentId?: string
}): Promise<WordEncounter> {
  // Use upsert to increment count or create new
  const result = await sql`
    INSERT INTO word_encounters (user_id, word, language, context, content_id)
    VALUES (${data.userId}, ${data.word.toLowerCase()}, ${data.language}, ${data.context || null}, ${data.contentId || null})
    ON CONFLICT (user_id, word, language)
    DO UPDATE SET
      encounter_count = word_encounters.encounter_count + 1,
      last_seen = NOW(),
      context = COALESCE(${data.context || null}, word_encounters.context),
      definition_unlocked = CASE 
        WHEN word_encounters.encounter_count + 1 >= 3 THEN true 
        ELSE word_encounters.definition_unlocked 
      END
    RETURNING *
  `
  return rowToEncounter(result[0])
}

export async function getWordEncounters(
  userId: string,
  options?: {
    language?: Language
    unlockedOnly?: boolean
    limit?: number
  }
): Promise<WordEncounter[]> {
  const limit = options?.limit ?? 100

  if (options?.language && options?.unlockedOnly) {
    const result = await sql`
      SELECT * FROM word_encounters
      WHERE user_id = ${userId} 
        AND language = ${options.language}
        AND definition_unlocked = true
      ORDER BY last_seen DESC
      LIMIT ${limit}
    `
    return result.map(rowToEncounter)
  }

  if (options?.language) {
    const result = await sql`
      SELECT * FROM word_encounters
      WHERE user_id = ${userId} AND language = ${options.language}
      ORDER BY last_seen DESC
      LIMIT ${limit}
    `
    return result.map(rowToEncounter)
  }

  if (options?.unlockedOnly) {
    const result = await sql`
      SELECT * FROM word_encounters
      WHERE user_id = ${userId} AND definition_unlocked = true
      ORDER BY last_seen DESC
      LIMIT ${limit}
    `
    return result.map(rowToEncounter)
  }

  const result = await sql`
    SELECT * FROM word_encounters
    WHERE user_id = ${userId}
    ORDER BY last_seen DESC
    LIMIT ${limit}
  `
  return result.map(rowToEncounter)
}

export async function getWordEncounter(
  userId: string,
  word: string,
  language: Language
): Promise<WordEncounter | null> {
  const result = await sql`
    SELECT * FROM word_encounters
    WHERE user_id = ${userId} 
      AND word = ${word.toLowerCase()}
      AND language = ${language}
  `
  return result.length > 0 ? rowToEncounter(result[0]) : null
}

export async function markWordLookedUp(
  userId: string,
  word: string,
  language: Language
): Promise<void> {
  await sql`
    UPDATE word_encounters
    SET looked_up = true, definition_unlocked = true
    WHERE user_id = ${userId}
      AND word = ${word.toLowerCase()}
      AND language = ${language}
  `
}

export async function markWordSelfDiscovered(
  userId: string,
  word: string,
  language: Language
): Promise<void> {
  await sql`
    UPDATE word_encounters
    SET self_discovered = true, definition_unlocked = true
    WHERE user_id = ${userId}
      AND word = ${word.toLowerCase()}
      AND language = ${language}
  `
}

export async function getEncounterStats(userId: string, language?: Language): Promise<{
  totalWords: number
  unlockedWords: number
  selfDiscovered: number
  lookedUp: number
  pendingUnlock: number
}> {
  const langFilter = language ? sql`AND language = ${language}` : sql``
  
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE definition_unlocked = true) as unlocked,
      COUNT(*) FILTER (WHERE self_discovered = true) as self_discovered,
      COUNT(*) FILTER (WHERE looked_up = true) as looked_up,
      COUNT(*) FILTER (WHERE definition_unlocked = false AND encounter_count < 3) as pending
    FROM word_encounters
    WHERE user_id = ${userId} ${langFilter}
  `
  
  const stats = result[0]
  return {
    totalWords: Number(stats.total) || 0,
    unlockedWords: Number(stats.unlocked) || 0,
    selfDiscovered: Number(stats.self_discovered) || 0,
    lookedUp: Number(stats.looked_up) || 0,
    pendingUnlock: Number(stats.pending) || 0
  }
}
