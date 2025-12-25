import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createGuess, getGuessesByUser, getGuessStats } from "@/lib/db/guesses"
import type { Language, GuessType } from "@/lib/types"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") as Language | null
  const sessionId = searchParams.get("sessionId")
  const stats = searchParams.get("stats") === "true"

  if (stats) {
    const guessStats = await getGuessStats(user.id, language || undefined)
    return NextResponse.json(guessStats)
  }

  const guesses = await getGuessesByUser(user.id, {
    language: language || undefined,
    sessionId: sessionId || undefined
  })

  return NextResponse.json(guesses)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { sessionId, contentId, language, guessType, original, userGuess, correctAnswer, isCorrect, isClose, isCreative } = body

  if (!language || !guessType || !original || !userGuess) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const guess = await createGuess({
    userId: user.id,
    sessionId,
    contentId,
    language: language as Language,
    guessType: guessType as GuessType,
    original,
    userGuess,
    correctAnswer,
    isCorrect,
    isClose,
    isCreative
  })

  return NextResponse.json(guess)
}
