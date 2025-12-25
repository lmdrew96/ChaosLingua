"use client"

import { cn } from "@/lib/utils"
import { Shuffle, Cloud, Flame, Flower2, Sparkles, Smile, Meh, Frown } from "lucide-react"
import type { Session, SessionType, SessionMood } from "@/lib/types"
import type React from "react"

interface SessionHistoryProps {
  sessions: Session[]
}

const sessionConfig: Record<SessionType, { icon: React.ReactNode; color: string; label: string }> = {
  "chaos-window": { icon: <Shuffle className="w-4 h-4" />, color: "text-chaos", label: "Chaos" },
  "playlist-roulette": { icon: <Shuffle className="w-4 h-4" />, color: "text-chaos", label: "Playlist" },
  "grammar-spiral": { icon: <Flower2 className="w-4 h-4" />, color: "text-fog", label: "Grammar" },
  "fog-session": { icon: <Cloud className="w-4 h-4" />, color: "text-fog", label: "Fog" },
  "forge-mode": { icon: <Flame className="w-4 h-4" />, color: "text-forge", label: "Forge" },
  "error-garden": { icon: <Flower2 className="w-4 h-4" />, color: "text-error-garden", label: "Errors" },
  "mystery-shelf": { icon: <Sparkles className="w-4 h-4" />, color: "text-reflect", label: "Mystery" },
}

const moodIcons: Record<SessionMood, React.ReactNode> = {
  energizing: <Smile className="w-4 h-4 text-green-400" />,
  neutral: <Meh className="w-4 h-4 text-yellow-400" />,
  draining: <Frown className="w-4 h-4 text-red-400" />,
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="font-semibold text-foreground mb-4">Recent Sessions</h3>

      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => {
            const config = sessionConfig[session.type]
            return (
              <div
                key={session.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className={cn("p-2 rounded-lg bg-background", config.color)}>{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{config.label}</span>
                    <span className="text-xs text-muted-foreground">{session.language === "ro" ? "🇷🇴" : "🇰🇷"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(session.startedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{session.duration}m</span>
                  {session.mood && moodIcons[session.mood]}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No sessions yet. Start exploring!</p>
        </div>
      )}
    </div>
  )
}
