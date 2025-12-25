"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { ContentViewer } from "@/components/chaos/content-viewer"
import { SessionComplete } from "@/components/chaos/session-complete"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile } from "@/lib/hooks/use-user-data"
import { useContent } from "@/lib/hooks/use-content"
import { Sparkles, Play, ArrowLeft, SkipForward, Pause, Clock, Music2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, ContentItem, SessionMood } from "@/lib/types"
import { cn } from "@/lib/utils"

type SessionPhase = "setup" | "playing" | "paused" | "complete"

function PlaylistRouletteContent() {
  const router = useRouter()
  const { profile, isLoading: profileLoading } = useUserProfile()
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)

  const effectiveLanguage = currentLanguage ?? profile?.primaryLanguage ?? "ro"
  const [duration, setDuration] = useState(15)
  const [autoAdvanceTime, setAutoAdvanceTime] = useState(60) // seconds per content
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("setup")
  const [contentQueue, setContentQueue] = useState<ContentItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [contentTimeRemaining, setContentTimeRemaining] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const contentTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [sessionStats, setSessionStats] = useState({
    contentViewed: 0,
    errorsHarvested: 0,
    mysteriesAdded: 0,
    duration: 0,
  })

  // Fetch content from API
  const { content, isLoading: contentLoading } = useContent({
    language: effectiveLanguage,
  })

  // Shuffle content for playlist
  const shuffleContent = useCallback(() => {
    const shuffled = [...content].sort(() => Math.random() - 0.5)
    setContentQueue(shuffled)
    setCurrentIndex(0)
  }, [content])

  // Start session
  const startSession = () => {
    shuffleContent()
    setSessionPhase("playing")
    setTimeRemaining(duration * 60)
    setContentTimeRemaining(autoAdvanceTime)
    setSessionStats({ contentViewed: 1, errorsHarvested: 0, mysteriesAdded: 0, duration })
  }

  // Session timer
  useEffect(() => {
    if (sessionPhase === "playing" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setSessionPhase("complete")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [sessionPhase])

  // Content auto-advance timer
  useEffect(() => {
    if (sessionPhase === "playing" && contentTimeRemaining > 0) {
      contentTimerRef.current = setInterval(() => {
        setContentTimeRemaining((prev) => {
          if (prev <= 1) {
            handleNextContent()
            return autoAdvanceTime
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (contentTimerRef.current) clearInterval(contentTimerRef.current)
    }
  }, [sessionPhase, autoAdvanceTime])

  const handleNextContent = () => {
    if (currentIndex < contentQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setContentTimeRemaining(autoAdvanceTime)
      setSessionStats((prev) => ({ ...prev, contentViewed: prev.contentViewed + 1 }))
    } else {
      // Reshuffle and continue
      shuffleContent()
      setSessionStats((prev) => ({ ...prev, contentViewed: prev.contentViewed + 1 }))
    }
  }

  const handlePause = () => {
    setSessionPhase("paused")
    if (timerRef.current) clearInterval(timerRef.current)
    if (contentTimerRef.current) clearInterval(contentTimerRef.current)
  }

  const handleResume = () => {
    setSessionPhase("playing")
  }

  const handleAddToMystery = (phrase: string) => {
    console.log("[Playlist] Adding to mystery:", phrase)
    setSessionStats((prev) => ({ ...prev, mysteriesAdded: prev.mysteriesAdded + 1 }))
  }

  const handleFlagError = (phrase: string, guess: string) => {
    console.log("[Playlist] Flagging error:", { phrase, guess })
    setSessionStats((prev) => ({ ...prev, errorsHarvested: prev.errorsHarvested + 1 }))
  }

  const handleReflectionSubmit = (reflection: string, mood: SessionMood) => {
    console.log("[Playlist] Session reflection:", { reflection, mood, stats: sessionStats })
    router.push("/")
  }

  const handleNewSession = () => {
    setSessionPhase("setup")
    setSessionStats({ contentViewed: 0, errorsHarvested: 0, mysteriesAdded: 0, duration: 0 })
    setContentQueue([])
    setCurrentIndex(0)
  }

  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentContent = contentQueue[currentIndex]
  const isLoading = profileLoading || contentLoading

  if (isLoading && sessionPhase === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage={effectiveLanguage} onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <Skeleton className="h-10 w-64 mb-8" />
              <Skeleton className="h-64 w-full" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={effectiveLanguage} onLanguageChange={handleLanguageChange} />

      <div className="flex">
        <AppNav />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-chaos" />
                  Playlist Roulette
                </h1>
                <p className="text-muted-foreground">Shuffled content queue with auto-advance</p>
              </div>
            </div>

            {/* Setup Phase */}
            {sessionPhase === "setup" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-chaos" />
                      <span className="font-semibold text-foreground">Session Duration</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total session time</span>
                        <span className="text-sm font-mono text-chaos">{duration} min</span>
                      </div>
                      <Slider
                        value={[duration]}
                        onValueChange={([value]) => setDuration(value)}
                        min={5}
                        max={30}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Music2 className="w-5 h-5 text-chaos" />
                      <span className="font-semibold text-foreground">Auto-Advance Speed</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Seconds per content</span>
                        <span className="text-sm font-mono text-chaos">{autoAdvanceTime}s</span>
                      </div>
                      <Slider
                        value={[autoAdvanceTime]}
                        onValueChange={([value]) => setAutoAdvanceTime(value)}
                        min={30}
                        max={120}
                        step={15}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Fast (30s)</span>
                        <span>Slow (120s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-chaos/20 bg-chaos/5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-chaos" />
                    How Playlist Roulette Works
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-chaos">•</span>
                      <span>Content auto-advances on a timer—no decisions needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-chaos">•</span>
                      <span>Random shuffle exposes you to variety</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-chaos">•</span>
                      <span>Skip anytime if something doesn't click</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-chaos">•</span>
                      <span>Flag errors and mysteries as you go</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="bg-chaos text-chaos-foreground hover:bg-chaos/90 px-8"
                    onClick={startSession}
                    disabled={content.length === 0}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Playlist
                  </Button>
                </div>
              </div>
            )}

            {/* Playing / Paused Phase */}
            {(sessionPhase === "playing" || sessionPhase === "paused") && currentContent && (
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Content {sessionStats.contentViewed} • {formatTime(timeRemaining)} remaining
                    </span>
                    <span className="text-chaos font-mono">Next in {formatTime(contentTimeRemaining)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-chaos transition-all"
                      style={{ width: `${(contentTimeRemaining / autoAdvanceTime) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={sessionPhase === "playing" ? handlePause : handleResume}
                    className="bg-transparent"
                  >
                    {sessionPhase === "playing" ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextContent}
                    className="bg-transparent"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />
                    Skip
                  </Button>
                </div>

                {/* Content Viewer */}
                <div className={cn(sessionPhase === "paused" && "opacity-50")}>
                  <ContentViewer
                    content={currentContent}
                    onClose={() => setSessionPhase("complete")}
                    onAddToMystery={handleAddToMystery}
                    onFlagError={handleFlagError}
                    embedded
                  />
                </div>

                {sessionPhase === "paused" && (
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-muted-foreground">Paused. Click play to resume.</p>
                  </div>
                )}
              </div>
            )}

            {/* Complete Phase */}
            {sessionPhase === "complete" && (
              <SessionComplete
                stats={sessionStats}
                onReflectionSubmit={handleReflectionSubmit}
                onNewSession={handleNewSession}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function PlaylistRoulettePage() {
  return (
    <AuthGuard>
      <PlaylistRouletteContent />
    </AuthGuard>
  )
}
