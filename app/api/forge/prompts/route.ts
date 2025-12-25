import { NextResponse } from "next/server"
import { getForgePrompts } from "@/lib/db/forge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const language = searchParams.get("language") as "ro" | "ko" | null
    const limit = searchParams.get("limit")
    const random = searchParams.get("random") === "true"

    const prompts = await getForgePrompts({
      type: type as "quick_fire" | "shadow_speak" | "writing_sprint" | "translation" | "conversation" | undefined,
      language: language || undefined,
      limit: limit ? Number.parseInt(limit) : undefined,
      random,
    })

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}
