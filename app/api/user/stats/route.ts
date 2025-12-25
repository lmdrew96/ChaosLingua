import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getOrCreateUserStats, incrementUserStats } from "@/lib/db/users"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getOrCreateUserStats(user.id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const increments = await request.json()
    await incrementUserStats(user.id, increments)

    const stats = await getOrCreateUserStats(user.id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error updating stats:", error)
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 })
  }
}
