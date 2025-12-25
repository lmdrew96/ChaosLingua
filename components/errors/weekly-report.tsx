"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Award, Target, Lightbulb } from "lucide-react"
import type { ErrorItem } from "@/lib/types"

interface WeeklyReportProps {
  errors: ErrorItem[]
  previousWeekErrors: number
}

export function WeeklyReport({ errors, previousWeekErrors }: WeeklyReportProps) {
  const thisWeekErrors = errors.filter((e) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(e.createdAt) > weekAgo
  }).length

  const change = thisWeekErrors - previousWeekErrors
  const percentChange = previousWeekErrors > 0 ? Math.round((change / previousWeekErrors) * 100) : 0

  // Group errors by type for pattern detection
  const errorPatterns = errors.reduce(
    (acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topPattern = Object.entries(errorPatterns).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="p-6 rounded-xl bg-card border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Weekly Error Report</h3>
        <span className="text-sm text-muted-foreground">Your edge this week</span>
      </div>

      {/* Main stat */}
      <div className="flex items-center gap-6">
        <div>
          <span className="text-4xl font-bold text-error-garden">{thisWeekErrors}</span>
          <p className="text-sm text-muted-foreground">New errors harvested</p>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
            change > 0 ? "bg-green-500/20 text-green-400" : change < 0 ? "bg-red-500/20 text-red-400" : "bg-secondary",
          )}
        >
          {change > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : change < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          <span>
            {percentChange > 0 ? "+" : ""}
            {percentChange}%
          </span>
        </div>
      </div>

      {/* Pattern insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
          <Target className="w-5 h-5 text-error-garden mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Focus Area</p>
            <p className="text-sm text-muted-foreground">
              Your errors cluster around{" "}
              <span className="text-foreground capitalize">{topPattern?.[0] || "vocabulary"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
          <Lightbulb className="w-5 h-5 text-chaos mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Insight</p>
            <p className="text-sm text-muted-foreground">Errors are data, not failures. Keep harvesting!</p>
          </div>
        </div>
      </div>

      {/* Encouragement */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-error-garden/10 border border-error-garden/20">
        <Award className="w-6 h-6 text-error-garden" />
        <p className="text-sm text-foreground">
          Every error you harvest is a seed planted. Your garden is growing beautifully.
        </p>
      </div>
    </div>
  )
}
