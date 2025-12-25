"use client"

import { useState, useMemo } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { FogSettings } from "@/components/fog/fog-settings"
import { FogContent } from "@/components/fog/fog-content"
import { ChaosTimer } from "@/components/chaos/chaos-timer"
import { SessionComplete } from "@/components/chaos/session-complete"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile } from "@/lib/hooks/use-user-data"
import { useContent } from "@/lib/hooks/use-content"
import { Cloud, Play, ArrowLeft, SkipForward } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, ContentItem, SessionMood } from "@/lib/types"

type SessionPhase = "setup" | "active" | "complete"

function FogPageContent() {
  const router = useRouter()
  const { profile, isLoading: profileLoading } = useUserProfile()
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)
  const [fogLevel, setFogLevel] = useState<number | null>(null)

  // Initialize from profile when loaded
  const effectiveLanguage = currentLanguage ?? profile?.primaryLanguage ?? "ro"
  const effectiveFogLevel = fogLevel ?? profile?.fogLevel ?? 70
  const [delayedLookup, setDelayedLookup] = useState(true)
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("setup")
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null)
  const [contentIndex, setContentIndex] = useState(0)

  const [sessionStats, setSessionStats] = useState({
    contentViewed: 0,
    errorsHarvested: 0,
    mysteriesAdded: 0,
    duration: 20,
  })

  // Fetch content from API
  const { content, isLoading: contentLoading } = useContent({
    language: effectiveLanguage,
  })

  // Filter content for fog sessions (prefer content at or above user's level)
  // If no content above level, include all content
  const fogContent = useMemo(() => {
    const userLevel = profile?.levels?.[effectiveLanguage] ?? 3
    const aboveLevel = content.filter((c) => c.difficulty >= userLevel)
    // If we have content above level, use it; otherwise use all content
    return aboveLevel.length > 0 ? aboveLevel : content
  }, [content, profile, effectiveLanguage])

  const startSession = () => {
    if (fogContent.length > 0) {
      setCurrentContent(fogContent[0])
      setContentIndex(0)
      setSessionPhase("active")
    }
  }

  const handleNextContent = () => {
    const nextIndex = contentIndex + 1
    if (nextIndex < fogContent.length) {
      setContentIndex(nextIndex)
      setCurrentContent(fogContent[nextIndex])
      setSessionStats((prev) => ({ ...prev, contentViewed: prev.contentViewed + 1 }))
    }
  }

  const handleAddToMystery = (word: string, context: string) => {
    console.log("[v0] Adding mystery:", { word, context })
    setSessionStats((prev) => ({ ...prev, mysteriesAdded: prev.mysteriesAdded + 1 }))
  }

  const handleWordEncounter = (word: string) => {
    console.log("[v0] Word encountered in fog:", word)
  }

  const handleSessionComplete = () => {
    setSessionPhase("complete")
  }

  const handleReflectionSubmit = (reflection: string, mood: SessionMood) => {
    console.log("[v0] Fog session reflection:", { reflection, mood, stats: sessionStats })
    router.push("/")
  }

  const handleNewSession = () => {
    setSessionPhase("setup")
    setSessionStats({ contentViewed: 0, errorsHarvested: 0, mysteriesAdded: 0, duration: 20 })
    setContentIndex(0)
    setCurrentContent(null)
  }

  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
  }

  const isLoading = profileLoading || contentLoading

  if (isLoading && sessionPhase === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage={effectiveLanguage} onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              <Skeleton className="h-10 w-64 mb-8" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
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
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <Cloud className="w-8 h-8 text-fog" />
                  The Fog Machine
                </h1>
                <p className="text-muted-foreground">Embrace productive confusion</p>
              </div>
            </div>

            {/* Setup Phase */}
            {sessionPhase === "setup" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FogSettings
                    fogLevel={effectiveFogLevel}
                    onFogLevelChange={setFogLevel}
                    delayedLookup={delayedLookup}
                    onDelayedLookupChange={setDelayedLookup}
                  />

                  {/* Philosophy card */}
                  <div className="p-6 rounded-xl border border-fog/20 bg-fog/5">
                    <h3 className="font-semibold text-foreground mb-3">The Fog Philosophy</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-fog">•</span>
                        <span>Immerse yourself in content above your level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-fog">•</span>
                        <span>Let patterns emerge naturally through exposure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-fog">•</span>
                        <span>Collect mysteries - some resolve through time alone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-fog">•</span>
                        <span>Trust the process: confusion is productive</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Content preview */}
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Session Content</h3>
                    <div className="space-y-3">
                      {fogContent.slice(0, 3).map((content, idx) => (
                        <div key={content.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                          <span className="text-sm font-mono text-muted-foreground">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{content.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Level {content.difficulty} • {content.lengthMinutes} min
                            </p>
                          </div>
                          <span className="text-fog text-xs">Above level</span>
                        </div>
                      ))}
                    </div>
                    {fogContent.length > 3 && (
                      <p className="text-sm text-muted-foreground mt-3 text-center">
                        +{fogContent.length - 3} more pieces of content
                      </p>
                    )}
                  </div>

                  {/* Start button */}
                  <Button
                    size="lg"
                    className="w-full bg-fog text-fog-foreground hover:bg-fog/90"
                    onClick={startSession}
                    disabled={fogContent.length === 0}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Enter the Fog
                  </Button>
                </div>
              </div>
            )}

            {/* Active Session */}
            {sessionPhase === "active" && currentContent && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timer sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-6 rounded-xl border border-fog/30 bg-card">
                    <ChaosTimer duration={20} onComplete={handleSessionComplete} isActive={true} />
                  </div>

                  {/* Session progress */}
                  <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                    <h3 className="font-semibold text-foreground text-sm">Fog Progress</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Content</span>
                        <span className="text-fog">
                          {contentIndex + 1}/{fogContent.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mysteries collected</span>
                        <span className="text-reflect">{sessionStats.mysteriesAdded}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNextContent}
                    disabled={contentIndex >= fogContent.length - 1}
                    className="w-full bg-transparent"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Next Content
                  </Button>
                </div>

                {/* Content area */}
                <div className="lg:col-span-2">
                  <FogContent
                    content={currentContent}
                    fogLevel={effectiveFogLevel}
                    delayedLookup={delayedLookup}
                    onAddToMystery={handleAddToMystery}
                    onWordEncounter={handleWordEncounter}
                  />
                </div>
              </div>
            )}

            {/* Session Complete */}
            {sessionPhase === "complete" && (
              <SessionComplete
                stats={sessionStats}
                onReflectionSubmit={handleReflectionSubmit}
                onNewSession={handleNewSession}
                onGoHome={() => router.push("/")}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function FogPage() {
  return (
    <AuthGuard>
      <FogPageContent />
    </AuthGuard>
  )
}
