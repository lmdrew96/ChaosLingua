"use client"

/**
 * Conversation Session with Grading
 * 
 * Grades dialogue responses for accuracy and naturalness
 */

import { useState } from "react"
import { ConversationSession } from "./conversation-session"
import { GradingResults } from "./grading-results"
import { useGrading } from "@/lib/hooks/use-grading"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight } from "lucide-react"
import type { Language } from "@/lib/types"

interface ConversationWithGradingProps {
  language: Language
  sessionId: string
  userId: string
  onComplete: () => void
  onExit: () => void
}

interface DialogueResponse {
  npcText: string
  userResponse: string
  grading?: any
}

export function ConversationWithGrading({
  language,
  sessionId,
  userId,
  onComplete,
  onExit,
}: ConversationWithGradingProps) {
  const { grade, isGrading, result } = useGrading()
  const [responses, setResponses] = useState<DialogueResponse[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const handleSessionComplete = async (stats: {
    turnsCompleted: number
    wordsProduced: number
    dialogue?: Array<{ npcText: string; userResponse: string }>
  }) => {
    if (!userId || !stats.dialogue) {
      console.error("Missing data")
      return
    }

    setResponses(
      stats.dialogue.map((d) => ({
        ...d,
        grading: undefined,
      }))
    )
    setCurrentIndex(0)

    // Grade first response
    const result = await grade({
      userId,
      sessionId,
      language,
      forgeType: "conversation",
      text: stats.dialogue[0].userResponse,
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
    if (!userId) return

    const nextIndex = currentIndex + 1
    if (nextIndex >= responses.length) {
      onComplete()
      return
    }

    setCurrentIndex(nextIndex)

    const result = await grade({
      userId,
      sessionId: `${sessionId}-${nextIndex}`,
      language,
      forgeType: "conversation",
      text: responses[nextIndex].userResponse,
    })

    if (result) {
      setResponses((prev) => {
        const updated = [...prev]
        updated[nextIndex] = { ...updated[nextIndex], grading: result }
        return updated
      })
    }
  }

  if (currentIndex === -1) {
    return (
      <ConversationSession
        language={language}
        onComplete={handleSessionComplete}
        onExit={onExit}
      />
    )
  }

  const current = responses[currentIndex]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Turn {currentIndex + 1} of {responses.length}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {responses.length} Complete
        </p>
      </div>

      {/* Dialogue */}
      <Card className="p-6 space-y-4">
        <div className="bg-secondary/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">NPC:</p>
          <p className="text-lg">{current.npcText}</p>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">You:</p>
          <p className="text-lg">{current.userResponse}</p>
        </div>
      </Card>

      {/* Grading Results */}
      {isGrading ? (
        <Card className="p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Analyzing response...</p>
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
              onClick={handleNextResponse}
            >
              {currentIndex === responses.length - 1 ? "Complete" : "Next Response"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
