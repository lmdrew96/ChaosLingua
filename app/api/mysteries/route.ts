import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserMysteries, createMystery, resolveMystery } from "@/lib/db/mysteries"
import { incrementUserStats } from "@/lib/db/users"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const language = searchParams.get("language") as "ro" | "ko" | null
    const resolved = searchParams.get("resolved")
    const limit = searchParams.get("limit")

    const mysteries = await getUserMysteries(user.id, {
      language: language || undefined,
      resolved: resolved !== null ? resolved === "true" : undefined,
      limit: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json(mysteries)
  } catch (error) {
    console.error("Error fetching mysteries:", error)
    return NextResponse.json({ error: "Failed to fetch mysteries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const mystery = await createMystery({
      userId: user.id,
      ...data,
    })

    return NextResponse.json(mystery)
  } catch (error) {
    console.error("Error creating mystery:", error)
    return NextResponse.json({ error: "Failed to create mystery" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mysteryId, meaning } = await request.json()
    await resolveMystery(mysteryId, user.id, meaning)

    await incrementUserStats(user.id, { mysteriesResolved: 1 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resolving mystery:", error)
    return NextResponse.json({ error: "Failed to resolve mystery" }, { status: 500 })
  }
}
