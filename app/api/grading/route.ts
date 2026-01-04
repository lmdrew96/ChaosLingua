/**
 * Grading API Endpoint
 * 
 * Orchestrates the multi-agent grading workflow:
 * 1. Context Agent: Gather user context
 * 2. Audio Processor (if audio): Convert audio to text
 * 3. Grading Agent: Evaluate linguistic accuracy
 * 4. Feedback Agent: Generate user-friendly feedback
 * 5. Proficiency Tracker: Update tracking tables
 */

import { NextRequest, NextResponse } from "next/server"
import { createForgeSubmission } from "@/lib/db/grading"
import { buildGradingContext } from "@/lib/grading/context-agent"
import { gradeInput } from "@/lib/grading/grading-agent"
import { generateFeedback } from "@/lib/grading/feedback-agent"
import { updateProficiencyTracking } from "@/lib/grading/proficiency-tracker"
import { processAudio } from "@/lib/grading/audio-processor"
import type { Language, ForgeType } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 30 // 30 seconds max

interface GradeRequest {
  userId: string
  sessionId: string
  language: Language
  forgeType: ForgeType
  text?: string // For text input
  audioUrl?: string // For audio input
  originalText?: string // For translation/shadow-speak modes
}

interface GradeResponse {
  success: boolean
  submissionId?: string
  transcript?: string // If audio input
  scores: {
    overall: number
    grammar: number
    vocabulary: number
    pronunciation: number
    fluency: number
    naturalness: number
  }
  corrections: Array<{
    type: string
    incorrect: string
    correct: string
    explanation: string
    isRecurring?: boolean
  }>
  feedback: {
    summary: string
    encouragement: string
    suggestions: string[]
  }
  audioQuality?: "good" | "fair" | "poor"
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<GradeResponse>> {
  try {
    const body: GradeRequest = await request.json()
    const { userId, sessionId, language, forgeType, text, audioUrl, originalText } = body

    // Validate input
    if (!userId || !sessionId || !language || !forgeType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          scores: { overall: 0, grammar: 0, vocabulary: 0, pronunciation: 0, fluency: 0, naturalness: 0 },
          corrections: [],
          feedback: { summary: "", encouragement: "", suggestions: [] },
        },
        { status: 400 }
      )
    }

    if (!text && !audioUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Either text or audioUrl must be provided",
          scores: { overall: 0, grammar: 0, vocabulary: 0, pronunciation: 0, fluency: 0, naturalness: 0 },
          corrections: [],
          feedback: { summary: "", encouragement: "", suggestions: [] },
        },
        { status: 400 }
      )
    }

    // Start timer for performance monitoring
    const startTime = Date.now()

    // STEP 1: Build grading context
    console.log("Building grading context...")
    const context = await buildGradingContext({
      userId,
      language,
      includeHistory: {
        errors: 20,
        guesses: 20,
      },
    })

    // STEP 2: Process audio if provided
    let userInput = text || ""
    let transcript: string | undefined
    let pronunciationScore = 0
    let audioQuality: "good" | "fair" | "poor" | undefined
    let pronunciationErrors: any[] = []

    if (audioUrl) {
      console.log("Processing audio...")
      const audioResult = await processAudio({
        audioUrl,
        expectedText: originalText,
        language,
      })

      userInput = audioResult.transcript
      transcript = audioResult.transcript
      pronunciationScore = audioResult.pronunciationScore
      audioQuality = audioResult.audioQuality
      pronunciationErrors = audioResult.pronunciationErrors
    }

    // Create submission record
    const submission = await createForgeSubmission({
      userId,
      sessionId,
      forgeType,
      language,
      submissionText: text || undefined,
      submissionAudioUrl: audioUrl || undefined,
      transcript: transcript || undefined,
    })

    // STEP 3: Grade the input
    console.log("Grading input...")
    const gradingOutput = await gradeInput({
      text: userInput,
      language,
      context,
      expectedMeaning: originalText,
    })

    // STEP 4: Generate feedback
    console.log("Generating feedback...")
    const feedbackOutput = await generateFeedback({
      gradingOutput,
      context,
      originalText: originalText || "",
      mode: forgeType,
    })

    // STEP 5: Update proficiency tracking
    console.log("Updating proficiency tracking...")
    await updateProficiencyTracking({
      userId,
      language,
      sessionId,
      forgeType,
      originalText: originalText || "",
      userInput,
      gradingOutput,
      feedbackOutput,
    })

    // Log performance
    const duration = Date.now() - startTime
    console.log(`Grading completed in ${duration}ms`)

    // Normalize corrections to match GradeResponse format
    const normalizedCorrections = feedbackOutput.corrections.map(
      (correction) => ({
        type: correction.type || "grammar",
        incorrect: correction.incorrect || correction.original || "",
        correct: correction.correct || correction.corrected || "",
        explanation: correction.explanation,
        isRecurring: correction.isRecurring,
      })
    )

    // Return response
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      transcript,
      scores: {
        overall: gradingOutput.overallScore,
        grammar: gradingOutput.grammarScore,
        vocabulary: gradingOutput.vocabularyScore,
        pronunciation: pronunciationScore,
        fluency: gradingOutput.fluencyScore,
        naturalness: gradingOutput.naturalnessScore,
      },
      corrections: normalizedCorrections,
      feedback: {
        summary: feedbackOutput.summary,
        encouragement: feedbackOutput.encouragement,
        suggestions: feedbackOutput.suggestions,
      },
      audioQuality,
    })
  } catch (error) {
    console.error("Grading error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        scores: {
          overall: 0,
          grammar: 0,
          vocabulary: 0,
          pronunciation: 0,
          fluency: 0,
          naturalness: 0,
        },
        corrections: [],
        feedback: {
          summary: "An error occurred during grading",
          encouragement: "",
          suggestions: [],
        },
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "grading-api",
    timestamp: new Date().toISOString(),
  })
}
