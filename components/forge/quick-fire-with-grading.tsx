"use client"

/**
 * Quick Fire Session with Grading
 * 
 * Adds AI grading feedback after each response
 */

import { useState } from "react"
import { QuickFireSession } from "./quick-fire-session"
import { GradingResults } from "./grading-results"
import { useGrading } from "@/lib/hooks/use-grading"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight } from "lucide-react"
import type { Language } from "@/lib/types"

interface QuickFireWithGradingProps {
  language: Language
  sessionId: string
  userId: string
  onComplete: () => void
  onExit: () => void
}

interface ResponseWithGrading {
  prompt: string
  response: string
  selfAssessment: string
  grading?: any
}

export function QuickFireWithGrading({
  language,
  sessionId,
  userId,
  onComplete,
  onExit,
}: QuickFireWithGradingProps) {
  const { grade, isGrading, result } = useGrading()
  const [responses, setResponses] = useState<ResponseWithGrading[]>([])
  const [currentGradingIndex, setCurrentGradingIndex] = useState(-1)

  const handleSessionComplete = async (
    sessionResponses: Array<{ prompt: string; response: string; selfAssessment: string }>
  ) => {

    // Grade first response immediately
    setResponses(
      sessionResponses.map((r) => ({
        ...r,
        grading: undefined,
      }))
    )
    setCurrentGradingIndex(0)

    // Grade first response
    const result = await grade({
      userId,
      sessionId,
      language,
      forgeType: "quick_fire",
      text: sessionResponses[0].response,
    })

    if (result) {
      setResponses((prev) => {
        const updated = [...prev]
        updated[0] = { ...updated[0], grading: result }
        return updated
      })
    }
  }

  const handleNextResponse = async () => {
    const nextIndex = currentGradingIndex + 1
    if (nextIndex >= responses.length) {
      onComplete()
      return
    }

    setCurrentGradingIndex(nextIndex)

    // Grade next response
    const result = await grade({
      userId,
      sessionId: `${sessionId}-${nextIndex}`,
      language,
      forgeType: "quick_fire",
      text: responses[nextIndex].response,
    })

    if (result) {
      setResponses((prev) => {
        const updated = [...prev]
        updated[nextIndex] = { ...updated[nextIndex], grading: result }
        return updated
      })
    }
  }

  // Show session if not started
  if (currentGradingIndex === -1) {
    return (
      <QuickFireSession
        language={language}
        onComplete={handleSessionComplete}
        onExit={onExit}
      />
    )
  }

  // Show grading results
  const current = responses[currentGradingIndex]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Prompt {currentGradingIndex + 1} of {responses.length}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentGradingIndex + 1} / {responses.length} Complete
        </p>
      </div>

      {/* Prompt & Response */}
      <Card className="p-6 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Prompt
          </h4>
          <p className="text-lg">{current.prompt}</p>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Your Response
          </h4>
          <p className="text-foreground">{current.response}</p>
        </div>
      </Card>

      {/* Grading Results */}
      {isGrading ? (
        <Card className="p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Analyzing your response...</p>
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
            {currentGradingIndex === 0 && (
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
              onClick={handleNextResponse}
            >
              {currentGradingIndex === responses.length - 1
                ? "Complete"
                : "Next Response"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
