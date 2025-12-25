"use client"

import { useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { SessionCard } from "@/components/dashboard/session-card"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { mockStats, mockUser } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import type { Language, SessionType } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(mockUser.primaryLanguage)

  const handleSessionStart = (type: SessionType) => {
    const routes: Record<SessionType, string> = {
      "chaos-window": "/chaos",
      "playlist-roulette": "/chaos?mode=playlist",
      "grammar-spiral": "/chaos?mode=grammar",
      "fog-session": "/fog",
      "forge-mode": "/forge",
      "error-garden": "/errors",
      "mystery-shelf": "/mysteries",
    }
    router.push(routes[type])
  }

  const handleSurpriseMe = () => {
    const sessions: SessionType[] = ["chaos-window", "fog-session", "forge-mode", "error-garden"]
    const random = sessions[Math.floor(Math.random() * sessions.length)]
    handleSessionStart(random)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />

      <div className="flex">
        <AppNav />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">What kind of session today?</h1>
              <p className="text-muted-foreground text-lg">Choose your adventure, {mockUser.name}. The chaos awaits.</p>
            </div>

            {/* Stats Bar */}
            <div className="mb-8">
              <StatsBar stats={mockStats} />
            </div>

            {/* Session Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <SessionCard
                type="chaos-window"
                title="Chaos Window"
                description="Timed free exploration. Wander through content, make connections, embrace the unexpected."
                duration="5-15 min"
                onClick={() => handleSessionStart("chaos-window")}
                featured
              />

              <SessionCard
                type="fog-session"
                title="Deep Fog"
                description="Immerse yourself in above-level content. Embrace confusion and let patterns emerge."
                duration="20-30 min"
                onClick={() => handleSessionStart("fog-session")}
              />

              <SessionCard
                type="error-garden"
                title="Error Garden"
                description="Tend to your mistakes. Review errors, find patterns, and transform failures into growth."
                onClick={() => handleSessionStart("error-garden")}
              />

              <SessionCard
                type="forge-mode"
                title="The Forge"
                description="Production practice. Speaking, writing, creating. Turn passive knowledge into active skills."
                duration="5-15 min"
                onClick={() => handleSessionStart("forge-mode")}
              />

              <SessionCard
                type="mystery-shelf"
                title="Mystery Shelf"
                description="Browse your collected unknowns. Some will resolve through time, others invite deeper exploration."
                onClick={() => handleSessionStart("mystery-shelf")}
              />

              {/* Quick Actions Card */}
              <div className="flex items-stretch">
                <QuickActions onSurpriseMe={handleSurpriseMe} />
              </div>
            </div>

            {/* Philosophy Reminder */}
            <div className="p-6 rounded-xl border border-border/50 bg-card/50">
              <p className="text-sm text-muted-foreground italic text-center">
                &ldquo;We provide the method. You provide the mess.&rdquo;
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
