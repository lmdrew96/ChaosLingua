"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lightbulb, Check, X, Sparkles } from "lucide-react"

interface GuessPromptProps {
  word: string
  context?: string
  correctAnswer: string
  onGuess: (guess: string, isCorrect: boolean) => void
  onSkip: () => void
}

export function GuessPrompt({ word, context, correctAnswer, onGuess, onSkip }: GuessPromptProps) {
  const [guess, setGuess] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmit = () => {
    const correct =
      guess.toLowerCase().trim() === correctAnswer.toLowerCase().trim() ||
      correctAnswer.toLowerCase().includes(guess.toLowerCase().trim())

    setIsCorrect(correct)
    setShowResult(true)
    onGuess(guess, correct)
  }

  const handleNext = () => {
    setGuess("")
    setShowResult(false)
    setIsCorrect(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-chaos/20 text-chaos">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Guess First!</h3>
          <p className="text-sm text-muted-foreground">What do you think this means?</p>
        </div>
      </div>

      {/* Word to guess */}
      <div className="p-4 rounded-lg bg-secondary/50 text-center">
        <span className="text-2xl font-bold text-foreground">{word}</span>
        {context && <p className="text-sm text-muted-foreground mt-2 italic">&ldquo;{context}&rdquo;</p>}
      </div>

      {!showResult ? (
        <>
          <div className="space-y-2">
            <Input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess..."
              className="text-center"
              onKeyDown={(e) => e.key === "Enter" && guess && handleSubmit()}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onSkip}>
              Skip
            </Button>
            <Button
              className="flex-1 bg-chaos text-chaos-foreground hover:bg-chaos/90"
              onClick={handleSubmit}
              disabled={!guess}
            >
              Submit Guess
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div
            className={cn(
              "p-4 rounded-lg flex items-center gap-3",
              isCorrect ? "bg-green-500/20" : "bg-error-garden/20",
            )}
          >
            {isCorrect ? (
              <>
                <Check className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">Correct!</p>
                  <p className="text-sm text-foreground">You got it: {correctAnswer}</p>
                </div>
              </>
            ) : (
              <>
                <X className="w-6 h-6 text-error-garden" />
                <div>
                  <p className="font-semibold text-error-garden">Not quite!</p>
                  <p className="text-sm text-foreground">
                    You guessed: <span className="line-through">{guess}</span>
                  </p>
                  <p className="text-sm text-foreground">
                    Correct: <span className="text-chaos font-semibold">{correctAnswer}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {!isCorrect && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-secondary/30">
              <Sparkles className="w-4 h-4 text-error-garden" />
              <span>This error has been added to your garden for review!</span>
            </div>
          )}

          <Button className="w-full" onClick={handleNext}>
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}
