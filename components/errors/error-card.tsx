"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Flower2, Sparkles, BookOpen, MessageSquare, Pencil, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ErrorItem, ErrorType } from "@/lib/types"

interface ErrorCardProps {
  error: ErrorItem
  onReview: (error: ErrorItem) => void
  onDismiss?: (error: ErrorItem) => void
  showDetails?: boolean
}

const errorTypeConfig: Record<ErrorType, { icon: React.ReactNode; label: string; color: string }> = {
  vocabulary: {
    icon: <BookOpen className="w-4 h-4" />,
    label: "Vocabulary",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  comprehension: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "Comprehension",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  grammar: {
    icon: <Pencil className="w-4 h-4" />,
    label: "Grammar",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  production: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "Production",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  beautiful_failure: {
    icon: <Sparkles className="w-4 h-4" />,
    label: "Beautiful Failure",
    color: "bg-error-garden/20 text-error-garden border-error-garden/30",
  },
}

export function ErrorCard({ error, onReview, showDetails = false }: ErrorCardProps) {
  const config = errorTypeConfig[error.type]
  const isHighPriority = error.occurrences >= 3

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border p-5 transition-all",
        "bg-card hover:bg-card/80 cursor-pointer",
        isHighPriority ? "border-error-garden/50" : "border-border",
      )}
      onClick={() => onReview(error)}
    >
      {/* Priority indicator */}
      {isHighPriority && <div className="absolute top-0 left-0 w-full h-1 bg-error-garden" />}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs", config.color)}>
            {config.icon}
            <span>{config.label}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{error.language === "ro" ? "🇷🇴" : "🇰🇷"}</span>
            <span>x{error.occurrences}</span>
          </div>
        </div>

        {/* Error content */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Flower2 className="w-5 h-5 text-error-garden flex-shrink-0" />
            <span className="text-lg font-semibold text-foreground">{error.original}</span>
          </div>

          <div className="ml-8 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Your guess: </span>
              <span className="text-red-400 line-through">{error.userGuess}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Correct: </span>
              <span className="text-chaos font-medium">{error.correct}</span>
            </p>
          </div>
        </div>

        {/* Context */}
        {error.context && showDetails && (
          <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground italic">
            &ldquo;{error.context}&rdquo;
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Last seen: {error.lastSeen ? new Date(error.lastSeen).toLocaleDateString() : "Unknown"}
          </span>

          <Button
            size="sm"
            variant="ghost"
            className="text-error-garden hover:text-error-garden hover:bg-error-garden/10"
            onClick={(e) => {
              e.stopPropagation()
              onReview(error)
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Review
          </Button>
        </div>
      </div>

      {/* Beautiful failure sparkle */}
      {error.type === "beautiful_failure" && (
        <div className="absolute -top-2 -right-2 p-2 rounded-full bg-error-garden/20">
          <Sparkles className="w-4 h-4 text-error-garden animate-pulse" />
        </div>
      )}
    </div>
  )
}
