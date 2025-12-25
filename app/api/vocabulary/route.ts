import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  recordRecognition, 
  recordProduction, 
  getProductionGap, 
  getVocabularyStats 
} from "@/lib/db/vocabulary-tracking"
import type { Language } from "@/lib/types"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") as Language | null
  const type = searchParams.get("type") // "gap" or "stats"

  if (type === "gap") {
    const gap = await getProductionGap(user.id, language || undefined)
    return NextResponse.json(gap)
  }

  const stats = await getVocabularyStats(user.id, language || undefined)
  return NextResponse.json(stats)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { word, language, type } = body

  if (!word || !language || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (type === "recognition") {
    const tracking = await recordRecognition({
      userId: user.id,
      word,
      language: language as Language
    })
    return NextResponse.json(tracking)
  }

  if (type === "production") {
    const tracking = await recordProduction({
      userId: user.id,
      word,
      language: language as Language
    })
    return NextResponse.json(tracking)
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}
