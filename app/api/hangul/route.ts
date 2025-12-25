import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  recordPractice, 
  getHangulProgress, 
  getNextPractice,
  HANGUL_SYLLABLES,
  HANGUL_ROMANIZATION
} from "@/lib/db/hangul"
import type { HangulSyllableType } from "@/lib/types"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action") // "progress", "next", "reference"
  const type = searchParams.get("type") as HangulSyllableType | null
  const count = parseInt(searchParams.get("count") || "10")

  if (action === "reference") {
    return NextResponse.json({
      syllables: HANGUL_SYLLABLES,
      romanization: HANGUL_ROMANIZATION
    })
  }

  if (action === "next") {
    const nextPractice = await getNextPractice(user.id, type || undefined, count)
    return NextResponse.json(nextPractice)
  }

  // Default: get full progress
  const progress = await getHangulProgress(user.id)
  return NextResponse.json(progress)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { syllable, syllableType, correct, responseTimeMs } = body

  if (!syllable || !syllableType || correct === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const progress = await recordPractice({
    userId: user.id,
    syllable,
    syllableType: syllableType as HangulSyllableType,
    correct,
    responseTimeMs
  })

  return NextResponse.json(progress)
}
