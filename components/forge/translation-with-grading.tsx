"use client"

/**
 * Translation Session with Grading
 * 
 * Compares translations against expected output
 */

import { useState } from "react"
import { TranslationSession } from "./translation-session"
import { GradingResults } from "./grading-results"
import { useGrading } from "@/lib/hooks/use-grading"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight } from "lucide-react"
import type { Language } from "@/lib/types"

interface TranslationWithGradingProps {
  language: Language
  sessionId: string
  userId: string
  onComplete: () => void
  onExit: () => void
}

interface TranslationAttempt {
  sourceText: string
  userTranslation: string
  expectedTranslation: string
  selfAssessment: "correct" | "partial" | "wrong"
  grading?: any
}

export function TranslationWithGrading({
  language,
  sessionId,
  userId,
  onComplete,
  onExit,
}: TranslationWithGradingProps) {
  const { grade, isGrading, result } = useGrading()
  const [attempts, setAttempts] = useState<TranslationAttempt[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const handleSessionComplete = async (results: any[]) => {
    if (!userId) {
      console.error("User not authenticated")
      return
    }

    setAttempts(
      results.map((r) => ({
        ...r,
        grading: undefined,
      }))
    )
    setCurrentIndex(0)

    // Grade first translation
    const result = await grade({
      userId,
      sessionId,
      language,
      forgeType: "translation",
      text: results[0].userTranslation,
      originalText: results[0].sourceText,
    })

    if (result) {
      setAttempts((prev) => {
        const updated = [...prev]
        updated[0] = { ...updated[0], grading: result }
        return updated
      })
    }
  }

  const handleNextTranslation = async () => {
    if (!userId) return

    const nextIndex = currentIndex + 1
    if (nextIndex >= attempts.length) {
      onComplete()
      return
    }

    setCurrentIndex(nextIndex)

    const result = await grade({
      userId,
      sessionId: `${sessionId}-${nextIndex}`,
      language,
      forgeType: "translation",
      text: attempts[nextIndex].userTranslation,
      originalText: attempts[nextIndex].sourceText,
    })

    if (result) {
      setAttempts((prev) => {
        const updated = [...prev]
        updated[nextIndex] = { ...updated[nextIndex], grading: result }
        return updated
      })
    }
  }

  if (currentIndex === -1) {
    return (
      <TranslationSession
        language={language}
        onComplete={handleSessionComplete}
        onExit={onExit}
      />
    )
  }

  const current = attempts[currentIndex]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Translation {currentIndex + 1} of {attempts.length}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {attempts.length} Complete
        </p>
      </div>

      {/* Translations */}
      <Card className="p-6 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Source Text
          </h4>
          <p className="text-lg">{current.sourceText}</p>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Your Translation
          </h4>
          <p className="text-lg">{current.userTranslation}</p>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Expected Translation
          </h4>
          <p className="text-foreground text-sm">{current.expectedTranslation}</p>
        </div>
      </Card>

      {/* Grading Results */}
      {isGrading ? (
        <Card className="p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Analyzing translation...</p>
        </Card>
      ) : current.grading ? (
        <>
          <GradingResults
            scores={current.grading.scores}
            corrections={current.grading.corrections}
            feedback={current.grading.feedback}
          />

          {/* Navigation */}
          <div className="flex gap-3">
            {currentIndex === 0 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={onExit}
              >
                Exit
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={handleNextTranslation}
            >
              {currentIndex === attempts.length - 1 ? "Complete" : "Next Translation"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
