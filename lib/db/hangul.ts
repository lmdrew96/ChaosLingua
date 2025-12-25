import { sql } from "@/lib/db"
import type { HangulProgress, HangulSyllableType } from "@/lib/types"

function rowToProgress(row: Record<string, unknown>): HangulProgress {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    syllable: row.syllable as string,
    syllableType: row.syllable_type as HangulSyllableType,
    recognitionAccuracy: Number(row.recognition_accuracy),
    readingSpeedMs: row.reading_speed_ms ? Number(row.reading_speed_ms) : undefined,
    practiceCount: Number(row.practice_count),
    mastered: row.mastered as boolean,
    lastPracticed: new Date(row.last_practiced as string),
  }
}

// Korean Hangul syllable definitions
export const HANGUL_SYLLABLES = {
  basic_vowel: ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'],
  basic_consonant: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'],
  double_consonant: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'],
  compound_vowel: ['ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'],
  final_consonant: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄳ', 'ㄵ', 'ㄶ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅄ']
}

export const HANGUL_ROMANIZATION: Record<string, string> = {
  // Basic vowels
  'ㅏ': 'a', 'ㅑ': 'ya', 'ㅓ': 'eo', 'ㅕ': 'yeo', 'ㅗ': 'o',
  'ㅛ': 'yo', 'ㅜ': 'u', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅣ': 'i',
  // Basic consonants
  'ㄱ': 'g/k', 'ㄴ': 'n', 'ㄷ': 'd/t', 'ㄹ': 'r/l', 'ㅁ': 'm',
  'ㅂ': 'b/p', 'ㅅ': 's', 'ㅇ': 'ng/-', 'ㅈ': 'j', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  // Double consonants
  'ㄲ': 'kk', 'ㄸ': 'tt', 'ㅃ': 'pp', 'ㅆ': 'ss', 'ㅉ': 'jj',
  // Compound vowels
  'ㅐ': 'ae', 'ㅒ': 'yae', 'ㅔ': 'e', 'ㅖ': 'ye', 'ㅘ': 'wa',
  'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅢ': 'ui'
}

export async function recordPractice(data: {
  userId: string
  syllable: string
  syllableType: HangulSyllableType
  correct: boolean
  responseTimeMs?: number
}): Promise<HangulProgress> {
  // Get or create progress record
  const existing = await sql`
    SELECT * FROM hangul_progress
    WHERE user_id = ${data.userId} AND syllable = ${data.syllable}
  `
  
  if (existing.length > 0) {
    const current = existing[0]
    const practiceCount = Number(current.practice_count) + 1
    const currentAccuracy = Number(current.recognition_accuracy)
    
    // Calculate new rolling accuracy (weighted towards recent)
    const newAccuracy = ((currentAccuracy * (practiceCount - 1)) + (data.correct ? 100 : 0)) / practiceCount
    
    // Calculate average reading speed
    const currentSpeed = current.reading_speed_ms ? Number(current.reading_speed_ms) : data.responseTimeMs
    const newSpeed = data.responseTimeMs 
      ? Math.round((Number(currentSpeed) + data.responseTimeMs) / 2)
      : currentSpeed
    
    // Check mastery (>90% accuracy, >5 practices)
    const mastered = newAccuracy >= 90 && practiceCount >= 5
    
    const result = await sql`
      UPDATE hangul_progress
      SET 
        recognition_accuracy = ${newAccuracy},
        reading_speed_ms = ${newSpeed || null},
        practice_count = ${practiceCount},
        mastered = ${mastered},
        last_practiced = NOW()
      WHERE user_id = ${data.userId} AND syllable = ${data.syllable}
      RETURNING *
    `
    return rowToProgress(result[0])
  }
  
  // Create new record
  const result = await sql`
    INSERT INTO hangul_progress (
      user_id, syllable, syllable_type, 
      recognition_accuracy, reading_speed_ms, practice_count
    )
    VALUES (
      ${data.userId}, ${data.syllable}, ${data.syllableType},
      ${data.correct ? 100 : 0}, ${data.responseTimeMs || null}, 1
    )
    RETURNING *
  `
  return rowToProgress(result[0])
}

export async function getHangulProgress(userId: string): Promise<{
  progress: HangulProgress[]
  masteryByType: Record<HangulSyllableType, { total: number; mastered: number; percentage: number }>
  overallMastery: number
  averageSpeed: number
}> {
  const result = await sql`
    SELECT * FROM hangul_progress
    WHERE user_id = ${userId}
    ORDER BY syllable_type, syllable
  `
  
  const progress = result.map(rowToProgress)
  
  // Calculate mastery by type
  const masteryByType: Record<HangulSyllableType, { total: number; mastered: number; percentage: number }> = {
    basic_vowel: { total: HANGUL_SYLLABLES.basic_vowel.length, mastered: 0, percentage: 0 },
    basic_consonant: { total: HANGUL_SYLLABLES.basic_consonant.length, mastered: 0, percentage: 0 },
    double_consonant: { total: HANGUL_SYLLABLES.double_consonant.length, mastered: 0, percentage: 0 },
    compound_vowel: { total: HANGUL_SYLLABLES.compound_vowel.length, mastered: 0, percentage: 0 },
    final_consonant: { total: HANGUL_SYLLABLES.final_consonant.length, mastered: 0, percentage: 0 }
  }
  
  let totalMastered = 0
  let totalSyllables = 0
  let totalSpeed = 0
  let speedCount = 0
  
  for (const p of progress) {
    if (p.mastered) {
      masteryByType[p.syllableType].mastered++
      totalMastered++
    }
    if (p.readingSpeedMs) {
      totalSpeed += p.readingSpeedMs
      speedCount++
    }
  }
  
  // Calculate percentages
  for (const type of Object.keys(masteryByType) as HangulSyllableType[]) {
    const m = masteryByType[type]
    m.percentage = m.total > 0 ? Math.round((m.mastered / m.total) * 100) : 0
    totalSyllables += m.total
  }
  
  return {
    progress,
    masteryByType,
    overallMastery: totalSyllables > 0 ? Math.round((totalMastered / totalSyllables) * 100) : 0,
    averageSpeed: speedCount > 0 ? Math.round(totalSpeed / speedCount) : 0
  }
}

export async function getNextPractice(
  userId: string,
  type?: HangulSyllableType,
  count: number = 10
): Promise<{ syllable: string; type: HangulSyllableType; romanization: string }[]> {
  // Get user's current progress
  const progressResult = await sql`
    SELECT syllable, syllable_type, recognition_accuracy, practice_count
    FROM hangul_progress
    WHERE user_id = ${userId}
  `
  
  const practiced = new Map<string, { accuracy: number; count: number }>()
  for (const row of progressResult) {
    practiced.set(row.syllable as string, {
      accuracy: Number(row.recognition_accuracy),
      count: Number(row.practice_count)
    })
  }
  
  // Build practice queue - prioritize:
  // 1. Never practiced syllables
  // 2. Low accuracy syllables
  // 3. Low practice count syllables
  const queue: { syllable: string; type: HangulSyllableType; priority: number }[] = []
  
  const types = type 
    ? [type] 
    : ['basic_vowel', 'basic_consonant', 'double_consonant', 'compound_vowel'] as HangulSyllableType[]
  
  for (const t of types) {
    for (const syllable of HANGUL_SYLLABLES[t]) {
      const progress = practiced.get(syllable)
      let priority = 0
      
      if (!progress) {
        priority = 100 // Never practiced - highest priority
      } else {
        priority = 100 - progress.accuracy + (10 / (progress.count + 1))
      }
      
      queue.push({ syllable, type: t, priority })
    }
  }
  
  // Sort by priority and take top items
  queue.sort((a, b) => b.priority - a.priority)
  
  return queue.slice(0, count).map(item => ({
    syllable: item.syllable,
    type: item.type,
    romanization: HANGUL_ROMANIZATION[item.syllable] || ''
  }))
}
