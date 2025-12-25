"use client"

import { useState, useMemo } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { ProgressOverview } from "@/components/progress/progress-overview"
import { ActivityHeatmap } from "@/components/progress/activity-heatmap"
import { InsightsPanel } from "@/components/progress/insights-panel"
import { SessionHistory } from "@/components/progress/session-history"
import { ComprehensionProductionGap } from "@/components/progress/comprehension-production-gap"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile, useUserStats } from "@/lib/hooks/use-user-data"
import { useSessions } from "@/lib/hooks/use-sessions"
import { BarChart3, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language } from "@/lib/types"

// Generate activity data from real sessions
const generateActivityData = (sessions: { startedAt: Date }[]) => {
  const data: { date: string; count: number }[] = []
  const today = new Date()
  const countByDate = new Map<string, number>()

  // Count sessions by date
  sessions.forEach((s) => {
    const date = new Date(s.startedAt).toISOString().split("T")[0]
    countByDate.set(date, (countByDate.get(date) || 0) + 1)
  })

  // Generate last 84 days
  for (let i = 83; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    data.push({
      date: dateStr,
      count: countByDate.get(dateStr) || 0,
    })
  }
  return data
}

function ProgressContent() {
  const router = useRouter()
  const { profile, isLoading: profileLoading } = useUserProfile()
  const { stats, isLoading: statsLoading } = useUserStats()
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)

  const effectiveLanguage = currentLanguage ?? profile?.primaryLanguage ?? "ro"

  const { sessions, isLoading: sessionsLoading } = useSessions({ limit: 50 })

  const activityData = useMemo(() => generateActivityData(sessions), [sessions])

  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
  }

  const isLoading = profileLoading || statsLoading || sessionsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage={effectiveLanguage} onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              <Skeleton className="h-10 w-64 mb-8" />
              <Skeleton className="h-32 w-full mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
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
                  <BarChart3 className="w-8 h-8 text-primary" />
                  Progress & Reflections
                </h1>
                <p className="text-muted-foreground">Non-traditional metrics for unconventional learning</p>
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-8">
              {/* Stats overview */}
              <ProgressOverview stats={stats} language={effectiveLanguage} />

              {/* Activity and gap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityHeatmap data={activityData} />
                <ComprehensionProductionGap data={{ comprehension: 72, production: 45 }} />
              </div>

              {/* Insights and history */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InsightsPanel language={effectiveLanguage} />
                <SessionHistory sessions={sessions} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  return (
    <AuthGuard>
      <ProgressContent />
    </AuthGuard>
  )
}
