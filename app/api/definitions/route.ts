import { NextResponse } from "next/server"
import { getDefinition, searchDefinitions, upsertDefinition } from "@/lib/db/definitions"
import { aiService } from "@/lib/ai-service"
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
      // First check database
      let definition = await getDefinition(word, language)
      
      // If not found, try to generate with AI
      if (!definition && aiService.isConfigured()) {
        const aiDefinition = await aiService.generateDefinition(word, language)
        
        if (aiDefinition) {
          // Cache the AI-generated definition in database
          definition = await upsertDefinition({
            language,
            word,
            definition: aiDefinition.definition,
            partOfSpeech: aiDefinition.partOfSpeech,
            examples: aiDefinition.examples,
          })
        }
      }
      
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
