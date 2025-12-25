import { sql } from "@/lib/db"
import type { UserProfile, UserStats, Language, ChaosSetting } from "@/lib/types"

export interface DbUserProfile {
  id: string
  primary_language: Language
  languages: Language[]
  levels: Record<Language, number>
  chaos_setting: ChaosSetting
  fog_level: number
  created_at: string
  updated_at: string
}

export interface DbUserStats {
  id: string
  chaos_sessions: number
  errors_harvested: number
  mysteries_resolved: number
  time_in_fog: number
  words_forged: number
  current_streak: number
  last_session_date: string | null
}

export interface DbUserSettings {
  id: string
  dark_mode: boolean
  sound_effects: boolean
  auto_advance: boolean
  notifications_enabled: boolean
  session_reminders: boolean
  weekly_summary: boolean
}

// Get or create user profile
export async function getOrCreateUserProfile(userId: string): Promise<UserProfile> {
  // First try to get existing profile
  const existing = await sql`
    SELECT * FROM user_profiles WHERE id = ${userId}
  `

  if (existing.length > 0) {
    const row = existing[0] as DbUserProfile
    return {
      id: row.id,
      name: "", // Will be filled from auth
      primaryLanguage: row.primary_language,
      languages: row.languages,
      levels: row.levels,
      chaosSetting: row.chaos_setting,
      fogLevel: row.fog_level,
      createdAt: new Date(row.created_at),
    }
  }

  // Create new profile
  const newProfile = await sql`
    INSERT INTO user_profiles (id)
    VALUES (${userId})
    RETURNING *
  `

  const row = newProfile[0] as DbUserProfile
  return {
    id: row.id,
    name: "",
    primaryLanguage: row.primary_language,
    languages: row.languages,
    levels: row.levels,
    chaosSetting: row.chaos_setting,
    fogLevel: row.fog_level,
    createdAt: new Date(row.created_at),
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    primaryLanguage: Language
    languages: Language[]
    levels: Record<Language, number>
    chaosSetting: ChaosSetting
    fogLevel: number
  }>,
): Promise<void> {
  // Handle each field individually to avoid SQL injection and parameter issues
  if (updates.primaryLanguage !== undefined) {
    await sql`UPDATE user_profiles SET primary_language = ${updates.primaryLanguage} WHERE id = ${userId}`
  }
  if (updates.languages !== undefined) {
    await sql`UPDATE user_profiles SET languages = ${updates.languages} WHERE id = ${userId}`
  }
  if (updates.levels !== undefined) {
    await sql`UPDATE user_profiles SET levels = ${JSON.stringify(updates.levels)} WHERE id = ${userId}`
  }
  if (updates.chaosSetting !== undefined) {
    await sql`UPDATE user_profiles SET chaos_setting = ${updates.chaosSetting} WHERE id = ${userId}`
  }
  if (updates.fogLevel !== undefined) {
    await sql`UPDATE user_profiles SET fog_level = ${updates.fogLevel} WHERE id = ${userId}`
  }
}

// Get or create user stats
export async function getOrCreateUserStats(userId: string): Promise<UserStats> {
  const existing = await sql`
    SELECT * FROM user_stats WHERE id = ${userId}
  `

  if (existing.length > 0) {
    const row = existing[0] as DbUserStats
    return {
      chaosSessions: row.chaos_sessions,
      errorsHarvested: row.errors_harvested,
      mysteriesResolved: row.mysteries_resolved,
      timeInFog: Number(row.time_in_fog),
      wordsForged: row.words_forged,
      currentStreak: row.current_streak,
    }
  }

  await sql`
    INSERT INTO user_stats (id)
    VALUES (${userId})
  `

  return {
    chaosSessions: 0,
    errorsHarvested: 0,
    mysteriesResolved: 0,
    timeInFog: 0,
    wordsForged: 0,
    currentStreak: 0,
  }
}

// Update user stats
export async function updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
  const setParts: string[] = []

  if (updates.chaosSessions !== undefined) {
    setParts.push(`chaos_sessions = ${updates.chaosSessions}`)
  }
  if (updates.errorsHarvested !== undefined) {
    setParts.push(`errors_harvested = ${updates.errorsHarvested}`)
  }
  if (updates.mysteriesResolved !== undefined) {
    setParts.push(`mysteries_resolved = ${updates.mysteriesResolved}`)
  }
  if (updates.timeInFog !== undefined) {
    setParts.push(`time_in_fog = ${updates.timeInFog}`)
  }
  if (updates.wordsForged !== undefined) {
    setParts.push(`words_forged = ${updates.wordsForged}`)
  }
  if (updates.currentStreak !== undefined) {
    setParts.push(`current_streak = ${updates.currentStreak}`)
  }

  if (setParts.length === 0) return

  await sql`
    UPDATE user_stats
    SET ${sql.unsafe(setParts.join(", "))}
    WHERE id = ${userId}
  `
}

// Increment specific stats
export async function incrementUserStats(
  userId: string,
  increments: Partial<{
    chaosSessions: number
    errorsHarvested: number
    mysteriesResolved: number
    timeInFog: number
    wordsForged: number
  }>,
): Promise<void> {
  await sql`
    UPDATE user_stats
    SET
      chaos_sessions = chaos_sessions + ${increments.chaosSessions || 0},
      errors_harvested = errors_harvested + ${increments.errorsHarvested || 0},
      mysteries_resolved = mysteries_resolved + ${increments.mysteriesResolved || 0},
      time_in_fog = time_in_fog + ${increments.timeInFog || 0},
      words_forged = words_forged + ${increments.wordsForged || 0},
      last_session_date = CURRENT_DATE
    WHERE id = ${userId}
  `
}

// Get or create user settings
export async function getOrCreateUserSettings(userId: string): Promise<DbUserSettings> {
  const existing = await sql`
    SELECT * FROM user_settings WHERE id = ${userId}
  `

  if (existing.length > 0) {
    return existing[0] as DbUserSettings
  }

  const newSettings = await sql`
    INSERT INTO user_settings (id)
    VALUES (${userId})
    RETURNING *
  `

  return newSettings[0] as DbUserSettings
}

// Update user settings
export async function updateUserSettings(userId: string, updates: Partial<Omit<DbUserSettings, "id">>): Promise<void> {
  const setParts: string[] = []

  if (updates.dark_mode !== undefined) {
    setParts.push(`dark_mode = ${updates.dark_mode}`)
  }
  if (updates.sound_effects !== undefined) {
    setParts.push(`sound_effects = ${updates.sound_effects}`)
  }
  if (updates.auto_advance !== undefined) {
    setParts.push(`auto_advance = ${updates.auto_advance}`)
  }
  if (updates.notifications_enabled !== undefined) {
    setParts.push(`notifications_enabled = ${updates.notifications_enabled}`)
  }
  if (updates.session_reminders !== undefined) {
    setParts.push(`session_reminders = ${updates.session_reminders}`)
  }
  if (updates.weekly_summary !== undefined) {
    setParts.push(`weekly_summary = ${updates.weekly_summary}`)
  }

  if (setParts.length === 0) return

  await sql`
    UPDATE user_settings
    SET ${sql.unsafe(setParts.join(", "))}
    WHERE id = ${userId}
  `
}
