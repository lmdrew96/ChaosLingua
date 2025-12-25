"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Shuffle, Flower2, Cloud, Flame, Sparkles, BookOpen, Clock, ArrowRight } from "lucide-react"
import type { SessionType } from "@/lib/types"

interface SessionCardProps {
  type: SessionType
  title: string
  description: string
  duration?: string
  onClick: () => void
  featured?: boolean
}

const sessionIcons: Record<SessionType, React.ReactNode> = {
  "chaos-window": <Shuffle className="w-6 h-6" />,
  "playlist-roulette": <Sparkles className="w-6 h-6" />,
  "grammar-spiral": <BookOpen className="w-6 h-6" />,
  "fog-session": <Cloud className="w-6 h-6" />,
  "forge-mode": <Flame className="w-6 h-6" />,
  "error-garden": <Flower2 className="w-6 h-6" />,
  "mystery-shelf": <Sparkles className="w-6 h-6" />,
}

const sessionColors: Record<SessionType, string> = {
  "chaos-window": "bg-chaos text-chaos-foreground hover:bg-chaos/90",
  "playlist-roulette": "bg-chaos text-chaos-foreground hover:bg-chaos/90",
  "grammar-spiral": "bg-fog text-fog-foreground hover:bg-fog/90",
  "fog-session": "bg-fog text-fog-foreground hover:bg-fog/90",
  "forge-mode": "bg-forge text-forge-foreground hover:bg-forge/90",
  "error-garden": "bg-error-garden text-error-garden-foreground hover:bg-error-garden/90",
  "mystery-shelf": "bg-reflect text-reflect-foreground hover:bg-reflect/90",
}

const sessionBorders: Record<SessionType, string> = {
  "chaos-window": "border-chaos/30",
  "playlist-roulette": "border-chaos/30",
  "grammar-spiral": "border-fog/30",
  "fog-session": "border-fog/30",
  "forge-mode": "border-forge/30",
  "error-garden": "border-error-garden/30",
  "mystery-shelf": "border-reflect/30",
}

export function SessionCard({ type, title, description, duration, onClick, featured = false }: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-6 text-left transition-all duration-300",
        "bg-card hover:bg-card/80",
        sessionBorders[type],
        featured && "md:col-span-2 md:row-span-2",
      )}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg transition-transform group-hover:scale-110",
              sessionColors[type],
            )}
          >
            {sessionIcons[type]}
          </div>
          {duration && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Start session</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Decorative gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none",
          type === "chaos-window" && "bg-gradient-to-br from-chaos to-transparent",
          type === "error-garden" && "bg-gradient-to-br from-error-garden to-transparent",
          type === "fog-session" && "bg-gradient-to-br from-fog to-transparent",
          type === "forge-mode" && "bg-gradient-to-br from-forge to-transparent",
        )}
      />
    </button>
  )
}
