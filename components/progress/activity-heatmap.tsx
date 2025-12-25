"use client"

import { cn } from "@/lib/utils"

interface ActivityHeatmapProps {
  data: { date: string; count: number }[]
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Generate last 12 weeks of data
  const weeks = 12
  const days = weeks * 7

  // Create a map of date to count
  const dataMap = new Map(data.map((d) => [d.date, d.count]))

  // Generate dates for the heatmap
  const dates: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    dates.push({
      date: dateStr,
      count: dataMap.get(dateStr) || 0,
    })
  }

  // Group by weeks
  const weekGroups: { date: string; count: number }[][] = []
  for (let i = 0; i < dates.length; i += 7) {
    weekGroups.push(dates.slice(i, i + 7))
  }

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-secondary"
    if (count <= 2) return "bg-chaos/30"
    if (count <= 5) return "bg-chaos/50"
    if (count <= 10) return "bg-chaos/70"
    return "bg-chaos"
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="font-semibold text-foreground mb-4">Activity</h3>

      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-2">
          {dayLabels.map((day, idx) => (
            <div
              key={idx}
              className="h-3 flex items-center"
              style={{ visibility: idx % 2 === 0 ? "visible" : "hidden" }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 overflow-x-auto">
          {weekGroups.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={cn("w-3 h-3 rounded-sm transition-colors", getIntensity(day.count))}
                  title={`${day.date}: ${day.count} activities`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm bg-chaos/30" />
          <div className="w-3 h-3 rounded-sm bg-chaos/50" />
          <div className="w-3 h-3 rounded-sm bg-chaos/70" />
          <div className="w-3 h-3 rounded-sm bg-chaos" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
