"use client"

/**
 * Shadow Speak Session with Grading
 * 
 * Grades audio pronunciation and accuracy
 */

import { useState } from "react"
import { ShadowSpeakSession } from "./shadow-speak-session"
import { GradingResults } from "./grading-results"
import { useGrading } from "@/lib/hooks/use-grading"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight } from "lucide-react"
import type { Language } from "@/lib/types"

interface ShadowSpeakWithGradingProps {
  language: Language
  sessionId: string
  userId: string
  onComplete: () => void
  onExit: () => void
}

interface AudioClipAttempt {
  clipId: string
  clipText: string
  audioUrl: string
  grading?: any
}

export function ShadowSpeakWithGrading({
  language,
  sessionId,
  userId,
  onComplete,
  onExit,
}: ShadowSpeakWithGradingProps) {
  const { grade, isGrading, result } = useGrading()
  const [attempts, setAttempts] = useState<AudioClipAttempt[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const handleSessionComplete = async (stats: {
    clipsCompleted: number
    totalDuration: number
    recordings?: Array<{ clipId: string; clipText: string; audioUrl: string }>
  }) => {
    if (!userId || !stats.recordings) {
      console.error("Missing data")
      return
    }

    setAttempts(
      stats.recordings.map((r) => ({
        ...r,
        grading: undefined,
      }))
    )
    setCurrentIndex(0)

    // Grade first attempt
    const result = await grade({
      userId,
      sessionId,
      language,
      forgeType: "shadow_speak",
      audioUrl: stats.recordings[0].audioUrl,
      originalText: stats.recordings[0].clipText,
    })

    if (result) {
      setAttempts((prev) => {
        const updated = [...prev]
        updated[0] = { ...updated[0], grading: result }
        return updated
      })
    }
  }

  const handleNextClip = async () => {
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
      forgeType: "shadow_speak",
      audioUrl: attempts[nextIndex].audioUrl,
      originalText: attempts[nextIndex].clipText,
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
      <ShadowSpeakSession
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
          Clip {currentIndex + 1} of {attempts.length}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {attempts.length} Complete
        </p>
      </div>

      {/* Clip Text */}
      <Card className="p-6 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Original Text
          </h4>
          <p className="text-lg">{current.clipText}</p>
        </div>
      </Card>

      {/* Grading Results */}
      {isGrading ? (
        <Card className="p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Analyzing pronunciation...</p>
        </Card>
      ) : current.grading ? (
        <>
          <GradingResults
            scores={current.grading.scores}
            corrections={current.grading.corrections}
            feedback={current.grading.feedback}
            transcript={current.grading.transcript}
            audioQuality={current.grading.audioQuality}
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
              onClick={handleNextClip}
            >
              {currentIndex === attempts.length - 1 ? "Complete" : "Next Clip"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
