import { NextResponse } from "next/server"
import { getDefinition, searchDefinitions } from "@/lib/db/definitions"
import type { Language } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const word = searchParams.get("word")
    const language = searchParams.get("language") as Language | null
    const search = searchParams.get("search")

    if (!language) {
      return NextResponse.json({ error: "Language is required" }, { status: 400 })
    }

    // If exact word lookup
    if (word) {
      const definition = await getDefinition(word, language)
      // Return null instead of 404 for missing definitions - this is expected for most words
      return NextResponse.json(definition)
    }

    // If search query
    if (search) {
      const definitions = await searchDefinitions(search, language)
      return NextResponse.json(definitions)
    }

    return NextResponse.json({ error: "Word or search query is required" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching definition:", error)
    return NextResponse.json({ error: "Failed to fetch definition" }, { status: 500 })
  }
}
