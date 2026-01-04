/**
 * useGrading Hook
 * 
 * React hook for submitting and grading Forge responses
 */

import { useState } from "react"
import type { Language, ForgeType } from "@/lib/types"

interface GradeInput {
  userId: string
  sessionId: string
  language: Language
  forgeType: ForgeType
  text?: string
  audioUrl?: string
  originalText?: string
}

interface GradeResult {
  success: boolean
  submissionId?: string
  transcript?: string
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

export function useGrading() {
  const [isGrading, setIsGrading] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const grade = async (input: GradeInput): Promise<GradeResult | null> => {
    setIsGrading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/grading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      const data: GradeResult = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Grading failed")
      }

      if (!data.success) {
        throw new Error(data.error || "Grading was unsuccessful")
      }

      setResult(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      return null
    } finally {
      setIsGrading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return {
    grade,
    isGrading,
    result,
    error,
    reset,
  }
}
