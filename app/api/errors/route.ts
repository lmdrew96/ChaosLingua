import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserErrors, createError, getErrorStats } from "@/lib/db/errors"
import { incrementUserStats } from "@/lib/db/users"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const language = searchParams.get("language") as "ro" | "ko" | null
    const type = searchParams.get("type") as string | null
    const limit = searchParams.get("limit")

    const errors = await getUserErrors(user.id, {
      language: language || undefined,
      type: type as "vocabulary" | "comprehension" | "grammar" | "production" | "beautiful_failure" | undefined,
      limit: limit ? Number.parseInt(limit) : undefined,
    })

    const stats = await getErrorStats(user.id)

    return NextResponse.json({ errors, stats })
  } catch (error) {
    console.error("Error fetching errors:", error)
    return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const errorItem = await createError({
      userId: user.id,
      ...data,
    })

    await incrementUserStats(user.id, { errorsHarvested: 1 })

    return NextResponse.json(errorItem)
  } catch (error) {
    console.error("Error creating error:", error)
    return NextResponse.json({ error: "Failed to create error" }, { status: 500 })
  }
}
