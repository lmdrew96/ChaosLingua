import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { saveForgeResponse, getUserForgeResponses } from "@/lib/db/forge"
import { incrementUserStats } from "@/lib/db/users"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    const responses = await getUserForgeResponses(user.id, {
      limit: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error("Error fetching responses:", error)
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const response = await saveForgeResponse({
      userId: user.id,
      ...data,
    })

    await incrementUserStats(user.id, { wordsForged: data.wordCount })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error saving response:", error)
    return NextResponse.json({ error: "Failed to save response" }, { status: 500 })
  }
}
