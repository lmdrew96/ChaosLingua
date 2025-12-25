"use client"

import { useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { ProgressOverview } from "@/components/progress/progress-overview"
import { ActivityHeatmap } from "@/components/progress/activity-heatmap"
import { InsightsPanel } from "@/components/progress/insights-panel"
import { SessionHistory } from "@/components/progress/session-history"
import { ComprehensionProductionGap } from "@/components/progress/comprehension-production-gap"
import { Button } from "@/components/ui/button"
import { mockStats, mockUser } from "@/lib/mock-data"
import { BarChart3, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, Session } from "@/lib/types"

// Mock session history
const mockSessions: Session[] = [
  {
    id: "1",
    userId: "1",
    type: "chaos-window",
    language: "ro",
    duration: 15,
    startedAt: new Date(Date.now() - 3600000),
    endedAt: new Date(Date.now() - 2700000),
    mood: "energizing",
    reflection: "Found some great music content!",
  },
  {
    id: "2",
    userId: "1",
    type: "forge-mode",
    language: "ko",
    duration: 10,
    startedAt: new Date(Date.now() - 86400000),
    endedAt: new Date(Date.now() - 85800000),
    mood: "neutral",
  },
  {
    id: "3",
    userId: "1",
    type: "fog-session",
    language: "ro",
    duration: 20,
    startedAt: new Date(Date.now() - 172800000),
    endedAt: new Date(Date.now() - 171600000),
    mood: "energizing",
    reflection: "Understood more than expected!",
  },
  {
    id: "4",
    userId: "1",
    type: "error-garden",
    language: "ko",
    duration: 8,
    startedAt: new Date(Date.now() - 259200000),
    mood: "draining",
  },
]

// Mock activity data
const generateActivityData = () => {
  const data: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split("T")[0],
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 8) + 1 : 0,
    })
  }
  return data
}

export default function ProgressPage() {
  const router = useRouter()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(mockUser.primaryLanguage)
  const activityData = generateActivityData()

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
                  <BarChart3 className="w-8 h-8 text-primary" />
                  Progress & Reflections
                </h1>
                <p className="text-muted-foreground">Non-traditional metrics for unconventional learning</p>
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-8">
              {/* Stats overview */}
              <ProgressOverview stats={mockStats} language={currentLanguage} />

              {/* Activity and gap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityHeatmap data={activityData} />
                <ComprehensionProductionGap data={{ comprehension: 72, production: 45 }} />
              </div>

              {/* Insights and history */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InsightsPanel language={currentLanguage} />
                <SessionHistory sessions={mockSessions} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
