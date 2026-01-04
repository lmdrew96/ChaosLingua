"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Clock, Play, Pause, Check, RotateCcw, Loader2 } from "lucide-react"
import { useForgePrompts } from "@/lib/hooks/use-forge-prompts"
import type { Language } from "@/lib/types"

interface WritingSprintProps {
  language: Language
  duration: number // in minutes
  onComplete: (text: string, wordCount: number) => void
  onExit: () => void
}

// Fallback topics in case database fetch fails
const fallbackTopics = {
  ro: [
    "Descrie ziua ta perfectă de weekend.",
    "Scrie despre o amintire din copilărie.",
    "Ce ai face dacă ai câștiga la loterie?",
    "Descrie camera ta preferată din casă.",
    "Scrie o scrisoare pentru tine din viitor.",
  ],
  ko: [
    "완벽한 주말에 대해 쓰세요.",
    "어린 시절 추억에 대해 쓰세요.",
    "복권에 당첨되면 뭘 할 거예요?",
    "좋아하는 방에 대해 설명하세요.",
    "미래의 자신에게 편지를 쓰세요.",
  ],
}

export function WritingSprint({ language, duration, onComplete, onExit }: WritingSprintProps) {
  // Fetch prompts from database
  const { prompts: dbPrompts, isLoading: promptsLoading } = useForgePrompts({
    type: "writing_sprint",
    language,
    limit: 5,
    random: true,
  })

  const [phase, setPhase] = useState<"ready" | "writing" | "review">("ready")
  const [timeLeft, setTimeLeft] = useState(duration * 60)
  const [isPaused, setIsPaused] = useState(false)
  const [text, setText] = useState("")

  // Select a random topic from database prompts or fallback
  const topic = useMemo(() => {
    if (dbPrompts && dbPrompts.length > 0) {
      return dbPrompts[Math.floor(Math.random() * dbPrompts.length)].text
    }
    const topics = fallbackTopics[language]
    return topics[Math.floor(Math.random() * topics.length)]
  }, [dbPrompts, language])

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleComplete = useCallback(() => {
    setPhase("review")
  }, [])

  useEffect(() => {
    if (phase !== "writing" || isPaused || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, isPaused, timeLeft, handleComplete])

  const startWriting = () => {
    setPhase("writing")
    setTimeLeft(duration * 60)
  }

  const handleSubmit = () => {
    onComplete(text, wordCount)
  }

  // Show loading state while fetching prompts
  if (promptsLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-forge animate-spin" />
        <p className="text-muted-foreground">Loading writing prompts...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-forge/20">
          <Pencil className="w-6 h-6 text-forge" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Writing Sprint</h2>
          <p className="text-sm text-muted-foreground">{duration} minute challenge</p>
        </div>
      </div>

      {/* Ready phase */}
      {phase === "ready" && (
        <div className="space-y-6">
          {/* Topic */}
          <div className="p-6 rounded-xl bg-card border border-forge/30 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Topic</p>
            <p className="text-xl font-medium text-foreground">{topic}</p>
            <p className="text-center text-sm text-muted-foreground mt-3">{language === "ro" ? "🇷🇴" : "🇰🇷"}</p>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
            <p className="text-sm text-foreground font-medium">Sprint Rules:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Keep writing until the timer ends</li>
              <li>• Don&apos;t stop to correct mistakes</li>
              <li>• Quality over perfection - just get words down</li>
              <li>• You&apos;ll review errors afterward</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onExit}>
              Cancel
            </Button>
            <Button className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90" onClick={startWriting}>
              <Play className="w-4 h-4 mr-2" />
              Start Sprint
            </Button>
          </div>
        </div>
      )}

      {/* Writing phase */}
      {phase === "writing" && (
        <div className="space-y-4">
          {/* Timer bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <Clock className={cn("w-5 h-5", timeLeft <= 60 ? "text-red-500" : "text-forge")} />
              <span className={cn("text-2xl font-mono font-bold", timeLeft <= 60 ? "text-red-500" : "text-foreground")}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{wordCount} words</span>
              <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)}>
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Topic reminder */}
          <div className="p-3 rounded-lg bg-forge/10 border border-forge/20 text-center">
            <p className="text-sm text-foreground">{topic}</p>
          </div>

          {/* Writing area */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={language === "ro" ? "Începe să scrii..." : "쓰기 시작하세요..."}
            className="min-h-[400px] text-lg leading-relaxed"
            disabled={isPaused}
            autoFocus
          />

          {isPaused && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-amber-400 font-medium">Paused</p>
              <p className="text-sm text-muted-foreground">Take a breath, then continue</p>
            </div>
          )}

          <Button className="w-full bg-forge text-forge-foreground hover:bg-forge/90" onClick={handleComplete}>
            <Check className="w-4 h-4 mr-2" />
            Finish Early
          </Button>
        </div>
      )}

      {/* Review phase */}
      {phase === "review" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <span className="text-3xl font-bold text-forge">{wordCount}</span>
              <p className="text-sm text-muted-foreground">Words Written</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <span className="text-3xl font-bold text-foreground">{duration - Math.ceil(timeLeft / 60)}</span>
              <p className="text-sm text-muted-foreground">Minutes Used</p>
            </div>
          </div>

          {/* Written text */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Your Writing</h3>
            <div className="p-4 rounded-xl bg-card border border-border max-h-[300px] overflow-y-auto">
              <p className="text-foreground whitespace-pre-wrap">{text || "(No text written)"}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => {
                setPhase("ready")
                setText("")
                setTimeLeft(duration * 60)
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90" onClick={handleSubmit}>
              <Check className="w-4 h-4 mr-2" />
              Save & Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { WritingSprint }
