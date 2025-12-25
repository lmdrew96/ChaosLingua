import type { ContentItem, ErrorItem, MysteryItem, UserStats, UserProfile } from "./types"

export const mockUser: UserProfile = {
  id: "1",
  name: "Explorer",
  languages: ["ro", "ko"],
  primaryLanguage: "ro",
  levels: { ro: 4, ko: 3 },
  chaosSetting: "guided-random",
  fogLevel: 70,
  createdAt: new Date(),
}

export const mockStats: UserStats = {
  chaosSessions: 23,
  errorsHarvested: 147,
  mysteriesResolved: 12,
  timeInFog: 8.5,
  wordsForged: 89,
  currentStreak: 5,
}

export const mockContent: ContentItem[] = [
  {
    id: "1",
    type: "video",
    language: "ro",
    difficulty: 5,
    lengthMinutes: 8,
    topics: ["daily-life", "culture"],
    sourceUrl: "https://youtube.com/watch?v=example1",
    title: "O zi obișnuită în București",
    description: "A vlogger explores daily life in Bucharest",
    thumbnailUrl: "/bucharest-city-vlog.jpg",
  },
  {
    id: "2",
    type: "audio",
    language: "ko",
    difficulty: 4,
    lengthMinutes: 5,
    topics: ["music", "culture"],
    title: "한국 팝송 가사 분석",
    description: "K-pop lyrics breakdown with explanations",
    thumbnailUrl: "/kpop-music-colorful.jpg",
  },
  {
    id: "3",
    type: "text",
    language: "ro",
    difficulty: 6,
    lengthMinutes: 4,
    topics: ["news", "politics"],
    sourceUrl: "https://digi24.ro/example",
    title: "Știri din România",
    description: "Current events in Romanian news",
    thumbnailUrl: "/newspaper-headlines.jpg",
  },
  {
    id: "4",
    type: "video",
    language: "ko",
    difficulty: 3,
    lengthMinutes: 12,
    topics: ["entertainment", "variety"],
    title: "런닝맨 하이라이트",
    description: "Running Man show highlights",
    thumbnailUrl: "/korean-variety-show-fun.jpg",
  },
]

export const mockErrors: ErrorItem[] = [
  {
    id: "1",
    userId: "1",
    type: "vocabulary",
    language: "ro",
    original: "frumos",
    userGuess: "delicious",
    correct: "beautiful",
    context: "Ce frumos este aici!",
    occurrences: 3,
    lastSeen: new Date(),
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    userId: "1",
    type: "grammar",
    language: "ko",
    original: "가다",
    userGuess: "gayo",
    correct: "가요",
    context: "Conjugation in present tense",
    occurrences: 5,
    lastSeen: new Date(),
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "3",
    userId: "1",
    type: "beautiful_failure",
    language: "ro",
    original: "căsuță",
    userGuess: "little house thing",
    correct: "little house (diminutive)",
    context: 'A logical guess based on "casă"',
    occurrences: 1,
    lastSeen: new Date(),
    createdAt: new Date(Date.now() - 259200000),
  },
]

export const mockMysteries: MysteryItem[] = [
  {
    id: "1",
    userId: "1",
    language: "ro",
    phrase: "a da în gropi",
    context: "Heard in conversation about driving",
    resolved: false,
    encounters: 2,
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: "2",
    userId: "1",
    language: "ko",
    phrase: "눈치",
    context: "Social awareness concept",
    resolved: true,
    resolvedMeaning: "The ability to read social situations and act accordingly",
    encounters: 7,
    createdAt: new Date(Date.now() - 1209600000),
  },
]

export const forgePrompts = {
  quick_fire: [
    { id: "1", text: "Describe your morning in 3 sentences.", difficulty: 3, language: "ro" as const },
    { id: "2", text: "What did you eat today? Why?", difficulty: 2, language: "ro" as const },
    { id: "3", text: "오늘 뭐 했어요?", difficulty: 3, language: "ko" as const },
    { id: "4", text: "Tell me about your favorite place.", difficulty: 4, language: "ko" as const },
  ],
  writing_sprint: [
    { id: "5", text: "Write about a childhood memory", difficulty: 5, language: "ro" as const },
    { id: "6", text: "Describe your ideal weekend", difficulty: 4, language: "ko" as const },
  ],
}
