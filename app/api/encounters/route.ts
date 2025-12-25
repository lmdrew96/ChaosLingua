import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  recordWordEncounter, 
  getWordEncounters, 
  getWordEncounter,
  markWordLookedUp,
  markWordSelfDiscovered,
  getEncounterStats 
} from "@/lib/db/word-encounters"
import type { Language } from "@/lib/types"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") as Language | null
  const word = searchParams.get("word")
  const unlockedOnly = searchParams.get("unlockedOnly") === "true"
  const stats = searchParams.get("stats") === "true"

  // Get stats
  if (stats) {
    const encounterStats = await getEncounterStats(user.id, language || undefined)
    return NextResponse.json(encounterStats)
  }

  // Get specific word
  if (word && language) {
    const encounter = await getWordEncounter(user.id, word, language)
    return NextResponse.json(encounter)
  }

  // Get all encounters
  const encounters = await getWordEncounters(user.id, {
    language: language || undefined,
    unlockedOnly
  })

  return NextResponse.json(encounters)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { word, language, context, contentId } = body

  if (!word || !language) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const encounter = await recordWordEncounter({
    userId: user.id,
    word,
    language: language as Language,
    context,
    contentId
  })

  return NextResponse.json(encounter)
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { word, language, action } = body

  if (!word || !language || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (action === "lookup") {
    await markWordLookedUp(user.id, word, language as Language)
  } else if (action === "self-discovered") {
    await markWordSelfDiscovered(user.id, word, language as Language)
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const encounter = await getWordEncounter(user.id, word, language as Language)
  return NextResponse.json(encounter)
}
