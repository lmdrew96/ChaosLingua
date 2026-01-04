/**
 * Example: Integrating Grading into Writing Sprint
 * 
 * This shows how to integrate the grading system into the Writing Sprint component
 */

"use client"

import { useState } from "react"
import { WritingSprint } from "./writing-sprint"
import { GradingResults } from "./grading-results"
import { useGrading } from "@/lib/hooks/use-grading"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Language } from "@/lib/types"

interface WritingSprintWithGradingProps {
  language: Language
  duration: number
  sessionId: string
  userId: string // Pass userId directly instead of using useSession
  onComplete: () => void
  onExit: () => void
}

export function WritingSprintWithGrading({
  language,
  duration,
  sessionId,
  userId,
  onComplete,
  onExit,
}: WritingSprintWithGradingProps) {
  const { grade, isGrading, result } = useGrading()
  const [showResults, setShowResults] = useState(false)

  const handleWritingComplete = async (text: string, wordCount: number) => {
    // Submit for grading
    await grade({
      userId,
      sessionId,
      language,
      forgeType: "writing_sprint",
      text,
    })

    setShowResults(true)
  }

  const handleResultsComplete = () => {
    setShowResults(false)
    onComplete()
  }

  return (
    <>
      {/* Show writing sprint until completed */}
      {!showResults && !isGrading && (
        <WritingSprint
          language={language}
          duration={duration}
          onComplete={handleWritingComplete}
          onExit={onExit}
        />
      )}

      {/* Show loading while grading */}
      {isGrading && (
        <Card className="p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Analyzing your writing...</p>
          <p className="text-sm text-muted-foreground">
            Checking grammar, vocabulary, and naturalness
          </p>
        </Card>
      )}

      {/* Show grading results */}
      {showResults && result && (
        <div className="space-y-4">
          <GradingResults
            scores={result.scores}
            corrections={result.corrections}
            feedback={result.feedback}
          />

          <div className="flex gap-3">
            <button
              onClick={onExit}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-transparent hover:bg-secondary transition-colors"
            >
              Exit
            </button>
            <button
              onClick={handleResultsComplete}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  )
}
