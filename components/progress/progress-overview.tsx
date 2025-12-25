"use client"

import { cn } from "@/lib/utils"
import { Shuffle, Flower2, Cloud, Flame, Sparkles, TrendingUp, Calendar } from "lucide-react"
import type { UserStats, Language } from "@/lib/types"

interface ProgressOverviewProps {
  stats: UserStats
  language: Language
}

export function ProgressOverview({ stats, language }: ProgressOverviewProps) {
  const statCards = [
    {
      icon: <Shuffle className="w-6 h-6" />,
      label: "Chaos Sessions",
      value: stats.chaosSessions,
      color: "text-chaos",
      bgColor: "bg-chaos/10",
      description: "Sessions embracing randomness",
    },
    {
      icon: <Flower2 className="w-6 h-6" />,
      label: "Errors Harvested",
      value: stats.errorsHarvested,
      color: "text-error-garden",
      bgColor: "bg-error-garden/10",
      description: "Mistakes transformed into learning",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      label: "Hours in Fog",
      value: stats.timeInFog,
      color: "text-fog",
      bgColor: "bg-fog/10",
      description: "Time in productive confusion",
    },
    {
      icon: <Flame className="w-6 h-6" />,
      label: "Words Forged",
      value: stats.wordsForged,
      color: "text-forge",
      bgColor: "bg-forge/10",
      description: "Words produced through practice",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      label: "Mysteries Resolved",
      value: stats.mysteriesResolved,
      color: "text-reflect",
      bgColor: "bg-reflect/10",
      description: "Unknowns that became known",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Consecutive days of practice",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Language indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{language === "ro" ? "🇷🇴" : "🇰🇷"}</span>
        <span>{language === "ro" ? "Romanian" : "Korean"} Progress</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Philosophy reminder */}
      <div className="p-4 rounded-xl border border-border/50 bg-card/50 text-center">
        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Progress here isn&apos;t about streaks or XP. It&apos;s about chaos embraced, errors harvested, and
          understanding forged through confusion.
        </p>
      </div>
    </div>
  )
}
