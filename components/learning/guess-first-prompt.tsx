"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, Check, X, Sparkles, ArrowRight, Lightbulb } from "lucide-react"
import type { Language, GuessType } from "@/lib/types"

interface GuessFirstPromptProps {
  original: string
  correctAnswer: string
  language: Language
  guessType: GuessType
  context?: string
  hint?: string
  onSubmit: (data: {
    userGuess: string
    isCorrect: boolean
    isClose: boolean
  }) => void
  onSkip?: () => void
  className?: string
}

export function GuessFirstPrompt({
  original,
  correctAnswer,
  language,
  guessType,
  context,
  hint,
  onSubmit,
  onSkip,
  className
}: GuessFirstPromptProps) {
  const [userGuess, setUserGuess] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState<{
    isCorrect: boolean
    isClose: boolean
  } | null>(null)

  const checkGuess = useCallback((guess: string, correct: string): { isCorrect: boolean; isClose: boolean } => {
    const normalizedGuess = guess.toLowerCase().trim()
    const normalizedCorrect = correct.toLowerCase().trim()
    
    // Exact match
    if (normalizedGuess === normalizedCorrect) {
      return { isCorrect: true, isClose: false }
    }
    
    // Close match - Levenshtein distance <= 2 or contains the answer
    const distance = levenshteinDistance(normalizedGuess, normalizedCorrect)
    const isClose = distance <= 2 || 
      normalizedCorrect.includes(normalizedGuess) || 
      normalizedGuess.includes(normalizedCorrect)
    
    return { isCorrect: false, isClose }
  }, [])

  const handleSubmit = () => {
    if (!userGuess.trim()) return
    
    const checkResult = checkGuess(userGuess, correctAnswer)
    setResult(checkResult)
    setShowResult(true)
    
    onSubmit({
      userGuess: userGuess.trim(),
      ...checkResult
    })
  }

  const handleContinue = () => {
    setUserGuess("")
    setShowResult(false)
    setResult(null)
    setShowHint(false)
  }

  const getPromptText = () => {
    switch (guessType) {
      case "word": return "What do you think this word means?"
      case "phrase": return "What do you think this phrase means?"
      case "meaning": return "What does this mean in English?"
      case "translation": return "How would you translate this?"
      case "grammar": return "What's the grammatical form here?"
      default: return "What's your guess?"
    }
  }

  if (showResult && result) {
    return (
      <div className={cn("p-6 rounded-xl bg-card border border-border space-y-4", className)}>
        {/* Result indicator */}
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-lg",
          result.isCorrect ? "bg-green-500/20" : result.isClose ? "bg-yellow-500/20" : "bg-red-500/20"
        )}>
          {result.isCorrect ? (
            <>
              <Check className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-500">Correct!</p>
                <p className="text-sm text-muted-foreground">You got it right.</p>
              </div>
            </>
          ) : result.isClose ? (
            <>
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-500">Close!</p>
                <p className="text-sm text-muted-foreground">You were on the right track.</p>
              </div>
            </>
          ) : (
            <>
              <X className="w-6 h-6 text-red-400" />
              <div>
                <p className="font-semibold text-red-400">Not quite</p>
                <p className="text-sm text-muted-foreground">But every guess is learning!</p>
              </div>
            </>
          )}
        </div>

        {/* Comparison */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Your guess:</p>
            <p className="text-foreground">{userGuess}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Correct answer:</p>
            <p className="text-foreground font-medium">{correctAnswer}</p>
          </div>
        </div>

        <Button onClick={handleContinue} className="w-full">
          <ArrowRight className="w-4 h-4 mr-2" />
          Continue
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("p-6 rounded-xl bg-card border border-border space-y-4", className)}>
      {/* Original text */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">{getPromptText()}</span>
        </div>
        
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <p className={cn(
            "text-lg font-medium text-foreground",
            language === "ko" && "text-xl"
          )}>
            {original}
          </p>
          {context && (
            <p className="text-sm text-muted-foreground mt-2 italic">{context}</p>
          )}
        </div>
      </div>

      {/* Hint */}
      {hint && (
        <div>
          {showHint ? (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <Lightbulb className="w-4 h-4 inline mr-2" />
                {hint}
              </p>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHint(true)}
              className="text-muted-foreground"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Show hint
            </Button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="space-y-3">
        {guessType === "meaning" || guessType === "translation" ? (
          <Textarea
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Type your guess here..."
            className="min-h-[80px]"
          />
        ) : (
          <Input
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Type your guess here..."
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!userGuess.trim()}
            className="flex-1"
          >
            Submit Guess
          </Button>
          
          {onSkip && (
            <Button variant="outline" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Don't worry about being wrong - your guesses help you learn!
      </p>
    </div>
  )
}

// Levenshtein distance for "close" match detection
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}
