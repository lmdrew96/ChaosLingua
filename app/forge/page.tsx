"use client"

import { useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { ForgeModeSelector } from "@/components/forge/forge-mode-selector"
import { QuickFireSession } from "@/components/forge/quick-fire-session"
import { WritingSprint } from "@/components/forge/writing-sprint"
import { ForgeComplete } from "@/components/forge/forge-complete"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { mockUser } from "@/lib/mock-data"
import { Flame, Play, ArrowLeft, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, ForgeType } from "@/lib/types"

type SessionPhase = "setup" | "active" | "complete"

export default function ForgePage() {
  const router = useRouter()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(mockUser.primaryLanguage)
  const [selectedMode, setSelectedMode] = useState<ForgeType | null>(null)
  const [duration, setDuration] = useState(10)
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("setup")

  const [sessionStats, setSessionStats] = useState({
    wordsProduced: 0,
    errorsIdentified: 0,
    selfCorrections: 0,
    duration: 0,
  })

  const startSession = () => {
    if (selectedMode) {
      setSessionPhase("active")
      setSessionStats((prev) => ({ ...prev, duration }))
    }
  }

  const handleQuickFireComplete = (responses: { prompt: string; response: string; selfAssessment: string }[]) => {
    const totalWords = responses.reduce((sum, r) => sum + r.response.split(/\s+/).filter((w) => w.length > 0).length, 0)
    const errorsIdentified = responses.filter((r) => r.selfAssessment.trim().length > 0).length

    setSessionStats({
      wordsProduced: totalWords,
      errorsIdentified,
      selfCorrections: Math.floor(errorsIdentified * 0.5),
      duration,
    })
    setSessionPhase("complete")
  }

  const handleWritingComplete = (text: string, wordCount: number) => {
    setSessionStats({
      wordsProduced: wordCount,
      errorsIdentified: Math.floor(wordCount * 0.1), // Estimate
      selfCorrections: Math.floor(wordCount * 0.05),
      duration,
    })
    setSessionPhase("complete")
  }

  const handleNewSession = () => {
    setSessionPhase("setup")
    setSelectedMode(null)
    setSessionStats({ wordsProduced: 0, errorsIdentified: 0, selfCorrections: 0, duration: 0 })
  }

  const handleExit = () => {
    if (sessionPhase === "active") {
      setSessionPhase("setup")
    } else {
      router.push("/")
    }
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
                  <Flame className="w-8 h-8 text-forge" />
                  The Forge
                </h1>
                <p className="text-muted-foreground">Production practice - speaking & writing</p>
              </div>
            </div>

            {/* Setup Phase */}
            {sessionPhase === "setup" && (
              <div className="space-y-8">
                {/* Mode selector */}
                <ForgeModeSelector selectedMode={selectedMode} onModeSelect={setSelectedMode} />

                {/* Duration selector */}
                {selectedMode && (
                  <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-forge" />
                      <span className="font-semibold text-foreground">Session Duration</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">How long do you want to practice?</span>
                        <span className="text-sm font-mono text-forge">{duration} min</span>
                      </div>
                      <Slider
                        value={[duration]}
                        onValueChange={([value]) => setDuration(value)}
                        min={5}
                        max={20}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 min</span>
                        <span>20 min</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Philosophy */}
                <div className="p-6 rounded-xl border border-forge/20 bg-forge/5">
                  <h3 className="font-semibold text-foreground mb-3">The Forge Philosophy</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-forge">•</span>
                      <span>Move from passive consumption to active creation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-forge">•</span>
                      <span>Self-review first: identify your own mistakes before AI feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-forge">•</span>
                      <span>Track the gap: words you understand vs. words you can produce</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-forge">•</span>
                      <span>Low pressure, high volume: quantity builds quality</span>
                    </li>
                  </ul>
                </div>

                {/* Start button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="bg-forge text-forge-foreground hover:bg-forge/90 px-8"
                    onClick={startSession}
                    disabled={!selectedMode}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Enter the Forge
                  </Button>
                </div>
              </div>
            )}

            {/* Active Session */}
            {sessionPhase === "active" && selectedMode === "quick_fire" && (
              <QuickFireSession language={currentLanguage} onComplete={handleQuickFireComplete} onExit={handleExit} />
            )}

            {sessionPhase === "active" && selectedMode === "writing_sprint" && (
              <WritingSprint
                language={currentLanguage}
                duration={duration}
                onComplete={handleWritingComplete}
                onExit={handleExit}
              />
            )}

            {sessionPhase === "active" && selectedMode && !["quick_fire", "writing_sprint"].includes(selectedMode) && (
              <div className="text-center py-12">
                <Flame className="w-16 h-16 text-forge mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {selectedMode === "shadow_speak" && "Shadow Speak mode is being forged..."}
                  {selectedMode === "translation" && "Translation Practice is being forged..."}
                  {selectedMode === "conversation" && "Conversation Simulation is being forged..."}
                </p>
                <Button variant="outline" onClick={handleExit} className="bg-transparent">
                  Back to Setup
                </Button>
              </div>
            )}

            {/* Complete Phase */}
            {sessionPhase === "complete" && selectedMode && (
              <ForgeComplete
                mode={selectedMode}
                stats={sessionStats}
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
