"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChaosTimerProps {
  duration: number // in minutes
  onComplete: () => void
  onPause?: () => void
  onResume?: () => void
  isActive: boolean
}

export function ChaosTimer({ duration, onComplete, isActive }: ChaosTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60)
  const [isPaused, setIsPaused] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100

  const handleReset = useCallback(() => {
    setTimeLeft(duration * 60)
    setIsPaused(false)
  }, [duration])

  useEffect(() => {
    if (!isActive || isPaused || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isPaused, timeLeft, onComplete])

  useEffect(() => {
    handleReset()
  }, [duration, handleReset])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular progress */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
            className={cn(
              "transition-all duration-1000",
              progress < 50 ? "text-chaos" : progress < 80 ? "text-yellow-500" : "text-error-garden",
            )}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-foreground">{formatTime(timeLeft)}</span>
          <span className="text-sm text-muted-foreground mt-1">{isPaused ? "Paused" : "Remaining"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={handleReset} className="text-muted-foreground bg-transparent">
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          size="lg"
          onClick={() => setIsPaused(!isPaused)}
          className={cn(
            "w-14 h-14 rounded-full",
            isPaused ? "bg-chaos text-chaos-foreground" : "bg-secondary text-foreground",
          )}
        >
          {isPaused ? <Play className="w-6 h-6 ml-1" /> : <Pause className="w-6 h-6" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onComplete}
          className="text-muted-foreground hover:text-chaos hover:border-chaos bg-transparent"
        >
          <Check className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
