"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Flower2, Check, X, ArrowRight, Sparkles, Brain } from "lucide-react"
import type { ErrorItem } from "@/lib/types"

interface ErrorReviewProps {
  error: ErrorItem
  onCorrect: () => void
  onIncorrect: () => void
  onSkip: () => void
}

type ReviewPhase = "recall" | "reveal" | "feedback"

export function ErrorReview({ error, onCorrect, onIncorrect, onSkip }: ErrorReviewProps) {
  const [phase, setPhase] = useState<ReviewPhase>("recall")
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmit = () => {
    const correct =
      userAnswer.toLowerCase().trim() === error.correct.toLowerCase().trim() ||
      error.correct.toLowerCase().includes(userAnswer.toLowerCase().trim())

    setIsCorrect(correct)
    setPhase("reveal")
  }

  const handleFeedback = (wasCorrect: boolean) => {
    if (wasCorrect) {
      onCorrect()
    } else {
      onIncorrect()
    }
    // Reset for next error
    setPhase("recall")
    setUserAnswer("")
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-error-garden/20">
          <Flower2 className="w-8 h-8 text-error-garden" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Error Review</h2>
        <p className="text-sm text-muted-foreground">
          You&apos;ve gotten this wrong {error.occurrences} time{error.occurrences > 1 ? "s" : ""}
        </p>
      </div>

      {/* The word/phrase */}
      <div className="p-6 rounded-xl bg-card border border-error-garden/30 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">{error.language === "ro" ? "🇷🇴" : "🇰🇷"}</span>
        </div>
        <span className="text-3xl font-bold text-foreground">{error.original}</span>

        {error.context && <p className="mt-3 text-sm text-muted-foreground italic">&ldquo;{error.context}&rdquo;</p>}
      </div>

      {/* Recall phase */}
      {phase === "recall" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">What does this mean?</label>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="text-center text-lg"
              onKeyDown={(e) => e.key === "Enter" && userAnswer && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onSkip}>
              Skip
            </Button>
            <Button
              className="flex-1 bg-error-garden text-error-garden-foreground hover:bg-error-garden/90"
              onClick={handleSubmit}
              disabled={!userAnswer}
            >
              Check
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Reveal phase */}
      {phase === "reveal" && (
        <div className="space-y-4">
          {/* Result */}
          <div
            className={cn("p-4 rounded-xl flex items-center gap-3", isCorrect ? "bg-green-500/20" : "bg-red-500/20")}
          >
            {isCorrect ? (
              <>
                <Check className="w-8 h-8 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">Excellent!</p>
                  <p className="text-sm text-foreground">You remembered: {error.correct}</p>
                </div>
              </>
            ) : (
              <>
                <X className="w-8 h-8 text-red-400" />
                <div>
                  <p className="font-semibold text-red-400">Not quite</p>
                  <p className="text-sm text-foreground">
                    You said: <span className="line-through">{userAnswer}</span>
                  </p>
                  <p className="text-sm text-foreground">
                    Correct: <span className="text-error-garden font-semibold">{error.correct}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Previous guess reminder */}
          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Brain className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="text-muted-foreground">
                You originally guessed: <span className="text-foreground">&ldquo;{error.userGuess}&rdquo;</span>
              </p>
            </div>
          </div>

          {/* Beautiful failure badge */}
          {error.type === "beautiful_failure" && (
            <div className="p-3 rounded-lg bg-error-garden/10 border border-error-garden/30 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-error-garden mt-0.5" />
              <div className="text-sm">
                <p className="text-error-garden font-medium">Beautiful Failure!</p>
                <p className="text-muted-foreground">Your guess was creative and logical, even if not correct.</p>
              </div>
            </div>
          )}

          {/* Self-assessment */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">Did you really know this?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                onClick={() => handleFeedback(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Still learning
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                onClick={() => handleFeedback(true)}
              >
                <Check className="w-4 h-4 mr-2" />
                Got it now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
