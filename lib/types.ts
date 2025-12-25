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

export type GuessType = "word" | "phrase" | "meaning" | "translation" | "grammar"

export type EmbedType = "youtube" | "soundcloud" | "spotify" | "internal" | "external"

export type SubmissionStatus = "pending" | "approved" | "rejected" | "flagged"

export type HangulSyllableType = "basic_vowel" | "basic_consonant" | "double_consonant" | "compound_vowel" | "final_consonant"

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
  vocabularyDensity?: number
  grammarFeatures?: string[]
  culturalNotes?: string
  embedType?: EmbedType
  embedId?: string
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
  // SRS fields
  nextReview?: Date
  intervalDays?: number
  easeFactor?: number
  reviewCount?: number
  lastReview?: Date
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
  wordsRecognized?: number
  wordsSelfDiscovered?: number
  guessesMade?: number
  guessesCorrect?: number
  voiceRecordings?: number
  hangulMasteryPercent?: number
}

// Guess logging
export interface UserGuess {
  id: string
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
  createdAt: Date
}

// Delayed lookup / word encounters
export interface WordEncounter {
  id: string
  userId: string
  word: string
  language: Language
  context?: string
  contentId?: string
  encounterCount: number
  definitionUnlocked: boolean
  selfDiscovered: boolean
  lookedUp: boolean
  firstSeen: Date
  lastSeen: Date
}

// Content submission for moderation
export interface ContentSubmission {
  id: string
  userId: string
  type: ContentType
  language: Language
  title: string
  description?: string
  sourceUrl?: string
  difficulty?: number
  topics: string[]
  status: SubmissionStatus
  moderatorId?: string
  moderatorNotes?: string
  autoFlags: string[]
  createdAt: Date
  reviewedAt?: Date
}

// Voice recording
export interface VoiceRecording {
  id: string
  userId: string
  sessionId?: string
  forgeResponseId?: string
  language: Language
  recordingUrl?: string
  durationSeconds?: number
  transcript?: string
  originalText?: string
  createdAt: Date
}

// Vocabulary production tracking
export interface VocabularyTracking {
  id: string
  userId: string
  word: string
  language: Language
  canRecognize: boolean
  canProduce: boolean
  recognitionCount: number
  productionCount: number
  lastRecognized?: Date
  lastProduced?: Date
  createdAt: Date
}

// Hangul progress (Korean-specific)
export interface HangulProgress {
  id: string
  userId: string
  syllable: string
  syllableType: HangulSyllableType
  recognitionAccuracy: number
  readingSpeedMs?: number
  practiceCount: number
  mastered: boolean
  lastPracticed: Date
}
