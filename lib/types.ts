export type Language = "ro" | "ko"

export type SessionType =
  | "chaos-window"
  | "playlist-roulette"
  | "grammar-spiral"
  | "fog-session"
  | "forge-mode"
  | "error-garden"
  | "mystery-shelf"

export type ContentType = "text" | "audio" | "video" | "interactive" | "forge_prompt"

export type ForgeType = "quick_fire" | "shadow_speak" | "writing_sprint" | "translation" | "conversation"

export type ErrorType = "vocabulary" | "comprehension" | "grammar" | "production" | "beautiful_failure"

export type ChaosSetting = "full-random" | "guided-random" | "curated"

export type SessionMood = "energizing" | "neutral" | "draining"

export interface UserProfile {
  id: string
  name: string
  languages: Language[]
  primaryLanguage: Language
  levels: Record<Language, number>
  chaosSetting: ChaosSetting
  fogLevel: number
  createdAt: Date
}

export interface ContentItem {
  id: string
  type: ContentType
  language: Language
  difficulty: number
  lengthMinutes: number
  topics: string[]
  sourceUrl?: string
  transcript?: string
  title: string
  description?: string
  thumbnailUrl?: string
}

export interface ErrorItem {
  id: string
  userId: string
  type: ErrorType
  language: Language
  original: string
  userGuess: string
  correct: string
  context?: string
  occurrences: number
  lastSeen: Date
  createdAt: Date
}

export interface MysteryItem {
  id: string
  userId: string
  language: Language
  phrase: string
  context?: string
  resolved: boolean
  resolvedMeaning?: string
  encounters: number
  createdAt: Date
}

export interface Session {
  id: string
  userId: string
  type: SessionType
  language: Language
  duration: number
  startedAt: Date
  endedAt?: Date
  reflection?: string
  mood?: SessionMood
}

export interface UserStats {
  chaosSessions: number
  errorsHarvested: number
  mysteriesResolved: number
  timeInFog: number
  wordsForged: number
  currentStreak: number
}
