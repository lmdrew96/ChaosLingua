import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserSessions, createSession, endSession, getSessionStats } from "@/lib/db/sessions"
import { incrementUserStats } from "@/lib/db/users"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const language = searchParams.get("language") as "ro" | "ko" | null
    const limit = searchParams.get("limit")

    const sessions = await getUserSessions(user.id, {
      type: type as
        | "chaos-window"
        | "playlist-roulette"
        | "grammar-spiral"
        | "fog-session"
        | "forge-mode"
        | "error-garden"
        | "mystery-shelf"
        | undefined,
      language: language || undefined,
      limit: limit ? Number.parseInt(limit) : undefined,
    })

    const stats = await getSessionStats(user.id)

    return NextResponse.json({ sessions, stats })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const session = await createSession({
      userId: user.id,
      ...data,
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, duration, reflection, mood } = await request.json()
    await endSession(sessionId, user.id, { duration, reflection, mood })

    const increments: { chaosSessions?: number; timeInFog?: number } = { chaosSessions: 1 }
    if (duration) {
      increments.timeInFog = duration / 3600
    }
    await incrementUserStats(user.id, increments)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error ending session:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}
