import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { aiService } from "@/lib/ai-service"
import type { Language } from "@/lib/types"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!aiService.isConfigured()) {
    return NextResponse.json({ 
      error: "AI service not configured",
      fallback: true,
      feedback: {
        isCorrect: true,
        score: 75,
        feedback: "AI feedback unavailable. Keep practicing!",
        corrections: [],
        suggestions: ["Continue your excellent work!"]
      }
    }, { status: 200 })
  }

  const body = await request.json()
  const { action, text, language, targetText, sourceText, userTranslation, context, userMessage, errors, guesses } = body

  if (!action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 })
  }

  try {
    switch (action) {
      case "grammar": {
        if (!text || !language) {
          return NextResponse.json({ error: "Missing text or language" }, { status: 400 })
        }
        const feedback = await aiService.getGrammarFeedback({
          text,
          language: language as Language,
          type: "grammar",
          targetText
        })
        return NextResponse.json(feedback)
      }

      case "naturalness": {
        if (!text || !language) {
          return NextResponse.json({ error: "Missing text or language" }, { status: 400 })
        }
        const feedback = await aiService.getNaturalnessFeedback({
          text,
          language: language as Language,
          type: "naturalness"
        })
        return NextResponse.json(feedback)
      }

      case "translation": {
        if (!sourceText || !userTranslation || !language) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const feedback = await aiService.getTranslationFeedback(
          sourceText,
          userTranslation,
          language as Language
        )
        return NextResponse.json(feedback)
      }

      case "patterns": {
        if (!language) {
          return NextResponse.json({ error: "Missing language" }, { status: 400 })
        }
        const analysis = await aiService.analyzePatterns({
          errors: errors || [],
          guesses: guesses || [],
          language: language as Language
        })
        return NextResponse.json(analysis)
      }

      case "conversation": {
        if (!context || !userMessage || !language) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const response = await aiService.generateConversationResponse(
          context,
          userMessage,
          language as Language
        )
        return NextResponse.json({ response })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ 
      error: "AI service error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Return AI service status
  return NextResponse.json({
    configured: aiService.isConfigured(),
    features: {
      grammar: true,
      naturalness: true,
      translation: true,
      patterns: true,
      conversation: true
    }
  })
}
