"use client"

import { useState, useCallback } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { ChaosSettings } from "@/components/chaos/chaos-settings"
import { ContentCard } from "@/components/chaos/content-card"
import { ChaosTimer } from "@/components/chaos/chaos-timer"
import { ContentViewer } from "@/components/chaos/content-viewer"
import { SessionComplete } from "@/components/chaos/session-complete"
import { GuessPrompt } from "@/components/chaos/guess-prompt"
import { Button } from "@/components/ui/button"
import { mockContent, mockUser } from "@/lib/mock-data"
import { Shuffle, Play, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, ChaosSetting, ContentItem, SessionMood } from "@/lib/types"

type SessionPhase = "setup" | "active" | "viewing" | "guessing" | "complete"

export default function ChaosPage() {
  const router = useRouter()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(mockUser.primaryLanguage)
  const [chaosSetting, setChaosSetting] = useState<ChaosSetting>(mockUser.chaosSetting)
  const [duration, setDuration] = useState(10)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("setup")
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [contentQueue, setContentQueue] = useState<ContentItem[]>([])

  const [sessionStats, setSessionStats] = useState({
    contentViewed: 0,
    errorsHarvested: 0,
    mysteriesAdded: 0,
    duration: 0,
  })

  // Filter content by language and topics
  const filteredContent = mockContent.filter((c) => {
    if (c.language !== currentLanguage) return false
    if (selectedTopics.length > 0 && !c.topics.some((t) => selectedTopics.includes(t))) return false
    return true
  })

  const shuffleContent = useCallback(() => {
    const shuffled = [...filteredContent].sort(() => Math.random() - 0.5)
    setContentQueue(shuffled)
  }, [filteredContent])

  const startSession = () => {
    shuffleContent()
    setSessionPhase("active")
    setSessionStats({ contentViewed: 0, errorsHarvested: 0, mysteriesAdded: 0, duration: duration })
  }

  const handleContentSelect = (content: ContentItem) => {
    setSelectedContent(content)
    setSessionPhase("viewing")
    setSessionStats((prev) => ({ ...prev, contentViewed: prev.contentViewed + 1 }))
  }

  const handleCloseViewer = () => {
    setSelectedContent(null)
    setSessionPhase("active")
  }

  const handleAddToMystery = (phrase: string) => {
    console.log("[v0] Adding to mystery shelf:", phrase)
    setSessionStats((prev) => ({ ...prev, mysteriesAdded: prev.mysteriesAdded + 1 }))
  }

  const handleFlagError = (phrase: string, guess: string) => {
    console.log("[v0] Flagging error:", { phrase, guess })
    setSessionStats((prev) => ({ ...prev, errorsHarvested: prev.errorsHarvested + 1 }))
  }

  const handleSessionComplete = () => {
    setSessionPhase("complete")
  }

  const handleReflectionSubmit = (reflection: string, mood: SessionMood) => {
    console.log("[v0] Session reflection:", { reflection, mood, stats: sessionStats })
    router.push("/")
  }

  const handleNewSession = () => {
    setSessionPhase("setup")
    setSessionStats({ contentViewed: 0, errorsHarvested: 0, mysteriesAdded: 0, duration: 0 })
    setContentQueue([])
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />

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
                  <Shuffle className="w-8 h-8 text-chaos" />
                  The Chaos Engine
                </h1>
                <p className="text-muted-foreground">Structured randomness for exploration</p>
              </div>
            </div>

            {/* Setup Phase */}
            {sessionPhase === "setup" && (
              <div className="space-y-6">
                <ChaosSettings
                  chaosSetting={chaosSetting}
                  onChaosSettingChange={setChaosSetting}
                  duration={duration}
                  onDurationChange={setDuration}
                  topics={["daily-life", "culture", "news", "music", "entertainment", "food", "travel", "technology"]}
                  selectedTopics={selectedTopics}
                  onTopicsChange={setSelectedTopics}
                />

                {/* Content preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Available Content</h2>
                    <span className="text-sm text-muted-foreground">{filteredContent.length} items</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContent.slice(0, 6).map((content) => (
                      <ContentCard key={content.id} content={content} onSelect={() => {}} />
                    ))}
                  </div>
                </div>

                {/* Start button */}
                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    className="bg-chaos text-chaos-foreground hover:bg-chaos/90 px-8"
                    onClick={startSession}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Chaos Session
                  </Button>
                </div>
              </div>
            )}

            {/* Active Session */}
            {sessionPhase === "active" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timer sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-6 rounded-xl border border-chaos/30 bg-card">
                    <ChaosTimer duration={duration} onComplete={handleSessionComplete} isActive={true} />
                  </div>

                  {/* Session stats */}
                  <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                    <h3 className="font-semibold text-foreground text-sm">This Session</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-lg font-bold text-chaos">{sessionStats.contentViewed}</span>
                        <p className="text-xs text-muted-foreground">Viewed</p>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-error-garden">{sessionStats.errorsHarvested}</span>
                        <p className="text-xs text-muted-foreground">Errors</p>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-reflect">{sessionStats.mysteriesAdded}</span>
                        <p className="text-xs text-muted-foreground">Mysteries</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={shuffleContent} className="w-full bg-transparent">
                    <Shuffle className="w-4 h-4 mr-2" />
                    Reshuffle
                  </Button>
                </div>

                {/* Content grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(contentQueue.length > 0 ? contentQueue : filteredContent).map((content) => (
                      <ContentCard key={content.id} content={content} onSelect={handleContentSelect} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Viewing content */}
            {sessionPhase === "viewing" && selectedContent && (
              <ContentViewer
                content={selectedContent}
                onClose={handleCloseViewer}
                onAddToMystery={handleAddToMystery}
                onFlagError={handleFlagError}
              />
            )}

            {/* Guessing phase */}
            {sessionPhase === "guessing" && (
              <div className="max-w-md mx-auto">
                <GuessPrompt
                  word="frumos"
                  context="Ce frumos este aici!"
                  correctAnswer="beautiful"
                  onGuess={(guess, isCorrect) => {
                    if (!isCorrect) {
                      setSessionStats((prev) => ({ ...prev, errorsHarvested: prev.errorsHarvested + 1 }))
                    }
                  }}
                  onSkip={() => setSessionPhase("active")}
                />
              </div>
            )}

            {/* Session complete */}
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
