"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { HangulDrill, HangulReference } from "@/components/hangul/hangul-drill"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/lib/hooks/use-user-data"
import { ArrowLeft, BookOpen, Target, Trophy, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

function HangulContent() {
  const router = useRouter()
  const { profile } = useUserProfile()
  const [mode, setMode] = useState<"menu" | "drill" | "reference">("menu")
  
  const { data: progress } = useSWR('/api/hangul', fetcher)

  const handleLanguageChange = async (language: "ro" | "ko") => {
    if (language !== "ko") {
      router.push("/")
    }
  }

  const handleDrillComplete = (stats: { correct: number; total: number; averageSpeed: number }) => {
    console.log("Drill complete:", stats)
    setMode("menu")
  }

  if (mode === "drill") {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage="ko" onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
              <HangulDrill
                onComplete={handleDrillComplete}
                onExit={() => setMode("menu")}
              />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (mode === "reference") {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage="ko" onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <Button variant="ghost" onClick={() => setMode("menu")} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <HangulReference />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage="ko" onLanguageChange={handleLanguageChange} />

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
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  한글 Hangul Module
                </h1>
                <p className="text-muted-foreground">Master Korean characters</p>
              </div>
            </div>

            {/* Progress Overview */}
            {progress && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-3xl font-bold text-primary">{progress.overallMastery || 0}%</p>
                  <p className="text-sm text-muted-foreground">Overall Mastery</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {progress.progress?.filter((p: { mastered: boolean }) => p.mastered).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Syllables Mastered</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {progress.averageSpeed ? `${Math.round(progress.averageSpeed / 1000)}s` : "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {progress.progress?.reduce((sum: number, p: { practiceCount: number }) => sum + p.practiceCount, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Practices</p>
                </div>
              </div>
            )}

            {/* Mode Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setMode("drill")}
                className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 text-left hover:border-primary/50 transition-colors"
              >
                <Target className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Practice Drill</h2>
                <p className="text-muted-foreground">
                  Test your recognition of Korean syllables with timed drills.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                  <Zap className="w-4 h-4" />
                  Start practicing
                </div>
              </button>

              <button
                onClick={() => setMode("reference")}
                className="p-6 rounded-xl bg-gradient-to-br from-fog/20 to-fog/5 border border-fog/30 text-left hover:border-fog/50 transition-colors"
              >
                <BookOpen className="w-10 h-10 text-fog mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Reference Chart</h2>
                <p className="text-muted-foreground">
                  Browse all Hangul syllables with romanization guides.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-fog">
                  <BookOpen className="w-4 h-4" />
                  View reference
                </div>
              </button>
            </div>

            {/* Mastery by Type */}
            {progress?.masteryByType && (
              <div className="mt-8 p-6 rounded-xl bg-card border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Progress by Category
                </h3>
                <div className="space-y-4">
                  {Object.entries(progress.masteryByType as Record<string, { percentage: number; mastered: number; total: number }>).map(([type, data]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground capitalize">{type.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground">{data.mastered}/{data.total}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function HangulPage() {
  return (
    <AuthGuard>
      <HangulContent />
    </AuthGuard>
  )
}
