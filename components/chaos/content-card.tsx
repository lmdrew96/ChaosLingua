"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Play, FileText, Headphones, Gamepad2, Clock, Star, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { ContentItem } from "@/lib/types"

interface ContentCardProps {
  content: ContentItem
  onSelect: (content: ContentItem) => void
  onFlag?: (content: ContentItem) => void
  isSelected?: boolean
}

const typeIcons = {
  video: <Play className="w-5 h-5" />,
  audio: <Headphones className="w-5 h-5" />,
  text: <FileText className="w-5 h-5" />,
  interactive: <Gamepad2 className="w-5 h-5" />,
  forge_prompt: <Star className="w-5 h-5" />,
}

const typeColors = {
  video: "bg-red-500/20 text-red-400",
  audio: "bg-blue-500/20 text-blue-400",
  text: "bg-amber-500/20 text-amber-400",
  interactive: "bg-green-500/20 text-green-400",
  forge_prompt: "bg-purple-500/20 text-purple-400",
}

export function ContentCard({ content, onSelect, onFlag, isSelected }: ContentCardProps) {
  const [imageError, setImageError] = useState(false)
  const difficultyColor =
    content.difficulty <= 3 ? "text-green-400" : content.difficulty <= 6 ? "text-yellow-400" : "text-red-400"

  const showFallback = !content.thumbnailUrl || imageError

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all cursor-pointer",
        isSelected ? "border-chaos ring-2 ring-chaos/30" : "border-border hover:border-chaos/50",
        "bg-card",
      )}
      onClick={() => onSelect(content)}
    >
      {/* Thumbnail or gradient */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-chaos/20 to-fog/20">
        {!showFallback ? (
          <Image
            src={content.thumbnailUrl!}
            alt={content.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("p-4 rounded-full", typeColors[content.type])}>{typeIcons[content.type]}</span>
          </div>
        )}

        {/* Type badge */}
        <div className={cn("absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium", typeColors[content.type])}>
          {content.type}
        </div>

        {/* Language badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
          {content.language === "ro" ? "🇷🇴" : "🇰🇷"}
        </div>
      </div>

      {/* Content info */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-chaos transition-colors">
          {content.title}
        </h3>

        {content.description && <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {content.lengthMinutes}m
            </span>
            <span className={cn("font-mono text-xs", difficultyColor)}>Lvl {content.difficulty}</span>
          </div>

          {onFlag && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-error-garden"
              onClick={(e) => {
                e.stopPropagation()
                onFlag(content)
              }}
            >
              <Flag className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1">
          {content.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground capitalize"
            >
              {topic.replace("-", " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
