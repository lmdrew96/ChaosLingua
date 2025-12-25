"use client"

import { cn } from "@/lib/utils"
import { Shuffle, Flower2, Cloud, Flame, Zap } from "lucide-react"
import type { UserStats } from "@/lib/types"

interface StatsBarProps {
  stats: UserStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const statItems = [
    {
      icon: <Shuffle className="w-4 h-4" />,
      label: "Chaos Sessions",
      value: stats.chaosSessions,
      color: "text-chaos",
    },
    {
      icon: <Flower2 className="w-4 h-4" />,
      label: "Errors Harvested",
      value: stats.errorsHarvested,
      color: "text-error-garden",
    },
    {
      icon: <Cloud className="w-4 h-4" />,
      label: "Hours in Fog",
      value: `${stats.timeInFog}h`,
      color: "text-fog",
    },
    {
      icon: <Flame className="w-4 h-4" />,
      label: "Words Forged",
      value: stats.wordsForged,
      color: "text-forge",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Day Streak",
      value: stats.currentStreak,
      color: "text-primary",
    },
  ]

  return (
    <div className="flex flex-wrap gap-3 md:gap-6">
      {statItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
          <span className={cn("flex-shrink-0", item.color)}>{item.icon}</span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-sm font-semibold text-foreground">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
