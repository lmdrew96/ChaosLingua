"use client"

import { Flower2, TrendingUp, Target, Sparkles } from "lucide-react"
import type { ErrorItem } from "@/lib/types"

interface ErrorStatsProps {
  errors: ErrorItem[]
}

export function ErrorStats({ errors }: ErrorStatsProps) {
  const totalErrors = errors.length
  const highPriority = errors.filter((e) => e.occurrences >= 3).length
  const beautifulFailures = errors.filter((e) => e.type === "beautiful_failure").length

  const errorsByType = errors.reduce(
    (acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostCommonType = Object.entries(errorsByType).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 text-error-garden mb-2">
          <Flower2 className="w-5 h-5" />
          <span className="text-sm font-medium">Total Errors</span>
        </div>
        <span className="text-3xl font-bold text-foreground">{totalErrors}</span>
        <p className="text-xs text-muted-foreground mt-1">In your garden</p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">High Priority</span>
        </div>
        <span className="text-3xl font-bold text-foreground">{highPriority}</span>
        <p className="text-xs text-muted-foreground mt-1">Need attention (3+ times)</p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 text-chaos mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">Beautiful Failures</span>
        </div>
        <span className="text-3xl font-bold text-foreground">{beautifulFailures}</span>
        <p className="text-xs text-muted-foreground mt-1">Creative attempts</p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Focus Area</span>
        </div>
        <span className="text-xl font-bold text-foreground capitalize">{mostCommonType?.[0] || "—"}</span>
        <p className="text-xs text-muted-foreground mt-1">Most common error type</p>
      </div>
    </div>
  )
}
