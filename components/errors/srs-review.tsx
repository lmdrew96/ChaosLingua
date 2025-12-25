"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Check, 
  X, 
  RotateCcw, 
  Brain,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Meh
} from "lucide-react"
import type { ErrorItem, Language } from "@/lib/types"

interface SRSReviewProps {
  errors: ErrorItem[]
  language: Language
  onReviewComplete: (stats: { reviewed: number; correct: number }) => void
  onExit: () => void
  className?: string
}

type Quality = 0 | 1 | 2 | 3 | 4 | 5

const QUALITY_OPTIONS: { value: Quality; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { value: 0, label: "Blackout", description: "Complete blank", icon: <X className="w-5 h-5" />, color: "bg-red-500" },
  { value: 1, label: "Wrong", description: "Wrong answer", icon: <ThumbsDown className="w-5 h-5" />, color: "bg-red-400" },
  { value: 2, label: "Hard", description: "Barely got it", icon: <Meh className="w-5 h-5" />, color: "bg-orange-500" },
  { value: 3, label: "Good", description: "Got it with effort", icon: <ThumbsUp className="w-5 h-5" />, color: "bg-yellow-500" },
  { value: 4, label: "Easy", description: "Got it quickly", icon: <Check className="w-5 h-5" />, color: "bg-green-500" },
  { value: 5, label: "Perfect", description: "Instant recall", icon: <Sparkles className="w-5 h-5" />, color: "bg-green-400" },
]

export function SRSReview({ errors, language, onReviewComplete, onExit, className }: SRSReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 })

  const currentError = errors[currentIndex]
  const progress = ((currentIndex + 1) / errors.length) * 100

  const handleQualitySelect = useCallback(async (quality: Quality) => {
    // Send review to API
    try {
      await fetch('/api/srs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId: currentError.id,
          quality
        })
      })
    } catch (error) {
      console.error('Failed to record review:', error)
    }

    // Update stats
    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0)
    }))

    // Move to next or complete
    if (currentIndex >= errors.length - 1) {
      onReviewComplete({
        reviewed: stats.reviewed + 1,
        correct: stats.correct + (quality >= 3 ? 1 : 0)
      })
    } else {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
    }
  }, [currentError, currentIndex, errors.length, stats, onReviewComplete])

  if (!currentError) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Reviews Due</h3>
        <p className="text-muted-foreground mb-6">Check back later for more reviews!</p>
        <Button onClick={onExit}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Review {currentIndex + 1} of {errors.length}</span>
          <span>{stats.correct}/{stats.reviewed} correct</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="p-8 rounded-xl bg-card border border-border min-h-[300px] flex flex-col items-center justify-center">
        {!showAnswer ? (
          // Question side
          <div className="text-center space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground capitalize">
              {currentError.type.replace('_', ' ')}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">What is the correct form of:</p>
              <p className={cn(
                "text-3xl font-bold text-foreground",
                language === "ko" && "text-4xl"
              )}>
                {currentError.original}
              </p>
            </div>

            {currentError.context && (
              <p className="text-sm text-muted-foreground italic max-w-md">
                Context: "{currentError.context}"
              </p>
            )}

            <Button onClick={() => setShowAnswer(true)} size="lg" className="mt-6">
              Show Answer
            </Button>
          </div>
        ) : (
          // Answer side
          <div className="text-center space-y-6 w-full">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 mb-1">Your guess was:</p>
                <p className="text-lg text-red-400 line-through">{currentError.userGuess}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-400 mb-1">Correct answer:</p>
                <p className="text-2xl font-bold text-green-400">{currentError.correct}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">How well did you know this?</p>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleQualitySelect(option.value)}
                    className={cn(
                      "p-3 rounded-lg border transition-all hover:scale-105",
                      "flex flex-col items-center gap-1",
                      option.value < 3 
                        ? "border-red-500/30 hover:bg-red-500/10" 
                        : "border-green-500/30 hover:bg-green-500/10"
                    )}
                  >
                    <div className={cn("p-2 rounded-full", option.color, "text-white")}>
                      {option.icon}
                    </div>
                    <span className="text-xs font-medium text-foreground">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onExit}>
          Exit Review
        </Button>
        
        {showAnswer && (
          <Button variant="outline" onClick={() => setShowAnswer(false)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Hide Answer
          </Button>
        )}
      </div>
    </div>
  )
}

interface SRSStatsDisplayProps {
  dueToday: number
  dueThisWeek: number
  mastered: number
  learning: number
  newItems: number
  onStartReview: () => void
  className?: string
}

export function SRSStatsDisplay({
  dueToday,
  dueThisWeek,
  mastered,
  learning,
  newItems,
  onStartReview,
  className
}: SRSStatsDisplayProps) {
  return (
    <div className={cn("p-6 rounded-xl bg-card border border-border", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Spaced Repetition</h3>
        </div>
        
        {dueToday > 0 && (
          <Button onClick={onStartReview} size="sm">
            Review Now ({dueToday})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{dueToday}</p>
          <p className="text-xs text-muted-foreground">Due Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{dueThisWeek}</p>
          <p className="text-xs text-muted-foreground">Due This Week</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-500">{newItems}</p>
          <p className="text-xs text-muted-foreground">New Items</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-500">{learning}</p>
          <p className="text-xs text-muted-foreground">Learning</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{mastered}</p>
          <p className="text-xs text-muted-foreground">Mastered</p>
        </div>
      </div>

      {dueToday === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          All caught up! Check back later for more reviews.
        </p>
      )}
    </div>
  )
}
