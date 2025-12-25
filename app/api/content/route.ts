import { NextResponse } from "next/server"
import { getContentItems } from "@/lib/db/content"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get("language") as "ro" | "ko" | null
    const type = searchParams.get("type")
    const limit = searchParams.get("limit")
    const random = searchParams.get("random") === "true"

    const content = await getContentItems({
      language: language || undefined,
      type: type as "text" | "audio" | "video" | "interactive" | "forge_prompt" | undefined,
      limit: limit ? Number.parseInt(limit) : undefined,
      random,
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}
