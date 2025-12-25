"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, Flower2, BookmarkPlus, RotateCcw, Home, Smile, Meh, Frown } from "lucide-react"
import type { SessionMood } from "@/lib/types"

interface SessionCompleteProps {
  stats: {
    contentViewed: number
    errorsHarvested: number
    mysteriesAdded: number
    duration: number
  }
  onReflectionSubmit: (reflection: string, mood: SessionMood) => void
  onNewSession: () => void
  onGoHome?: () => void
}

const moodOptions: { value: SessionMood; icon: React.ReactNode; label: string }[] = [
  { value: "energizing", icon: <Smile className="w-6 h-6" />, label: "Energizing" },
  { value: "neutral", icon: <Meh className="w-6 h-6" />, label: "Neutral" },
  { value: "draining", icon: <Frown className="w-6 h-6" />, label: "Draining" },
]

export function SessionComplete({ stats, onReflectionSubmit, onNewSession, onGoHome }: SessionCompleteProps) {
  const [reflection, setReflection] = useState("")
  const [mood, setMood] = useState<SessionMood | null>(null)

  const handleSubmit = () => {
    if (mood) {
      onReflectionSubmit(reflection, mood)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Completion header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-4 rounded-full bg-chaos/20">
          <Trophy className="w-12 h-12 text-chaos" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Session Complete!</h2>
        <p className="text-muted-foreground">Great work embracing the chaos.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <span className="text-2xl font-bold text-chaos">{stats.contentViewed}</span>
          <p className="text-xs text-muted-foreground mt-1">Content Explored</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <span className="text-2xl font-bold text-error-garden">{stats.errorsHarvested}</span>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Flower2 className="w-3 h-3" /> Errors
          </p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <span className="text-2xl font-bold text-reflect">{stats.mysteriesAdded}</span>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <BookmarkPlus className="w-3 h-3" /> Mysteries
          </p>
        </div>
      </div>

      {/* Mood selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">How did this session feel?</label>
        <div className="flex gap-3">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setMood(option.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                mood === option.value ? "border-chaos bg-chaos/10" : "border-border hover:border-chaos/50",
              )}
            >
              <span className={cn(mood === option.value ? "text-chaos" : "text-muted-foreground")}>{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reflection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">One thing you noticed (optional)</label>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="A pattern, a connection, something confusing..."
          className="resize-none h-24"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onGoHome && (
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        )}
        <Button className="flex-1 bg-chaos text-chaos-foreground hover:bg-chaos/90" onClick={onNewSession}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {mood && (
        <Button variant="ghost" className="w-full" onClick={handleSubmit}>
          Save Reflection & Exit
        </Button>
      )}
    </div>
  )
}
