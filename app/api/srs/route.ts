import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getErrorsDueForReview, processReview, getSRSStats } from "@/lib/db/srs"
import type { Language } from "@/lib/types"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") as Language | null
  const stats = searchParams.get("stats") === "true"

  if (stats) {
    const srsStats = await getSRSStats(user.id, language || undefined)
    return NextResponse.json(srsStats)
  }

  const dueErrors = await getErrorsDueForReview(user.id, {
    language: language || undefined
  })

  return NextResponse.json(dueErrors)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { errorId, quality } = body

  if (!errorId || quality === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Validate quality is 0-5
  if (quality < 0 || quality > 5) {
    return NextResponse.json({ error: "Quality must be 0-5" }, { status: 400 })
  }

  const updatedError = await processReview(errorId, quality)
  return NextResponse.json(updatedError)
}
