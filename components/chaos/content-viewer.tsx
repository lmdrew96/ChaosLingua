"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Bookmark, Flag, ExternalLink, Volume2, VolumeX, Eye, EyeOff, Play, FileText, Headphones, Gamepad2, Star } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ContentItem } from "@/lib/types"
import { EmbedManager } from "@/components/ui/embed-manager"
import { DelayedLookupWord } from "@/components/learning/delayed-lookup"

const typeIcons = {
  video: <Play className="w-8 h-8" />,
  audio: <Headphones className="w-8 h-8" />,
  text: <FileText className="w-8 h-8" />,
  interactive: <Gamepad2 className="w-8 h-8" />,
  forge_prompt: <Star className="w-8 h-8" />,
}

const typeColors = {
  video: "bg-red-500/20 text-red-400",
  audio: "bg-blue-500/20 text-blue-400",
  text: "bg-amber-500/20 text-amber-400",
  interactive: "bg-green-500/20 text-green-400",
  forge_prompt: "bg-purple-500/20 text-purple-400",
}

interface ContentViewerProps {
  content: ContentItem
  onClose: () => void
  onAddToMystery: (phrase: string) => void
  onFlagError: (phrase: string, guess: string) => void
  embedded?: boolean
}

export function ContentViewer({ content, onClose, onAddToMystery, embedded = false }: ContentViewerProps) {
  const [selectedText, setSelectedText] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [delayedLookupMode, setDelayedLookupMode] = useState(true)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  const handleTextSelect = () => {
    const selection = window.getSelection()?.toString().trim()
    if (selection) {
      // If it's a single word and delayed lookup is enabled, show the delayed lookup
      if (delayedLookupMode && selection.split(/\s+/).length === 1) {
        setSelectedWord(selection)
      } else {
        setSelectedText(selection)
      }
    }
  }

  const handleWordLearned = useCallback((word: string, selfDiscovered: boolean) => {
    // In a full implementation, this would update the user's vocabulary tracking
    console.log(`Word "${word}" learned (${selfDiscovered ? "self-discovered" : "looked up"})`)
    setSelectedWord(null)
  }, [])

  // Determine embed type from content
  const getEmbedInfo = () => {
    if (!content.sourceUrl) return null
    
    if (content.sourceUrl.includes("youtube.com") || content.sourceUrl.includes("youtu.be")) {
      const videoId = content.sourceUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
      if (videoId) return { type: "youtube" as const, id: videoId }
    }
    
    if (content.sourceUrl.includes("soundcloud.com")) {
      return { type: "soundcloud" as const, url: content.sourceUrl }
    }
    
    if (content.sourceUrl.includes("spotify.com")) {
      return { type: "spotify" as const, url: content.sourceUrl }
    }
    
    return null
  }

  const embedInfo = getEmbedInfo()

  if (embedded) {
    // Embedded mode - no fixed overlay
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{content.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{content.language === "ro" ? "🇷🇴 Romanian" : "🇰🇷 Korean"}</span>
              <span>•</span>
              <span>Level {content.difficulty}</span>
            </div>
          </div>
          {content.sourceUrl && (
            <Button variant="ghost" size="icon" asChild>
              <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5" />
              </a>
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4" onMouseUp={handleTextSelect}>
          {content.thumbnailUrl && !imageError && (
            <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
              <Image 
                src={content.thumbnailUrl} 
                alt={content.title} 
                fill 
                className="object-cover" 
                onError={() => setImageError(true)}
              />
            </div>
          )}
          {(!content.thumbnailUrl || imageError) && (
            <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-chaos/20 to-fog/20 flex items-center justify-center">
              <span className={cn("p-6 rounded-full", typeColors[content.type])}>{typeIcons[content.type]}</span>
            </div>
          )}
          {content.description && (
            <p className="text-foreground leading-relaxed">{content.description}</p>
          )}
          {content.transcript && (
            <div className="mt-4 p-4 rounded-lg bg-secondary/50">
              <p className="text-foreground whitespace-pre-wrap">{content.transcript}</p>
            </div>
          )}
        </div>

        {/* Quick actions for selected text */}
        {selectedText && (
          <div className="p-4 border-t border-border bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-2">Selected: "{selectedText}"</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onAddToMystery(selectedText)
                  setSelectedText("")
                }}
                className="bg-transparent"
              >
                <Bookmark className="w-4 h-4 mr-1" />
                Add to Mystery Shelf
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{content.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{content.language === "ro" ? "🇷🇴 Romanian" : "🇰🇷 Korean"}</span>
              <span>•</span>
              <span>Level {content.difficulty}</span>
              <span>•</span>
              <span>{content.lengthMinutes} min</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(content.type === "audio" || content.type === "video") && (
              <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            )}
            {content.sourceUrl && (
              <Button variant="ghost" size="icon" asChild>
                <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Delayed Lookup Toggle */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setDelayedLookupMode(!delayedLookupMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  delayedLookupMode
                    ? "bg-fog/20 text-fog border border-fog/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {delayedLookupMode ? (
                  <>
                    <Eye className="w-4 h-4" /> Delayed Lookup On
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" /> Instant Lookup
                  </>
                )}
              </button>
            </div>

            {/* Embedded Media Player */}
            {embedInfo && (
              <EmbedManager
                type={embedInfo.type}
                id={embedInfo.type === "youtube" ? embedInfo.id : undefined}
                url={embedInfo.type !== "youtube" ? embedInfo.url : undefined}
                title={content.title}
                autoplay={false}
              />
            )}

            {/* Fallback Media preview for non-embedded content */}
            {!embedInfo && content.type === "video" && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                {content.thumbnailUrl && !imageError ? (
                  <Image
                    src={content.thumbnailUrl}
                    alt={content.title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-chaos/20 to-fog/20">
                    <span className={cn("p-6 rounded-full", typeColors[content.type])}>{typeIcons[content.type]}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full w-16 h-16 bg-chaos text-chaos-foreground">
                    ▶
                  </Button>
                </div>
              </div>
            )}

            {!embedInfo && content.type === "audio" && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <Volume2 className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{content.title}</h3>
                    <p className="text-sm text-muted-foreground">{content.lengthMinutes} minutes</p>
                    <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transcript / Text content */}
            {(content.transcript || content.type === "text") && (
              <div
                className="p-6 rounded-xl bg-card border border-border prose prose-invert max-w-none"
                onMouseUp={handleTextSelect}
              >
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {content.transcript ||
                    `Sample text content for "${content.title}". In a real implementation, this would contain the full article or text content. Users can select any text to add it to their mystery shelf or flag it as an error.
                    
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`}
                </p>
              </div>
            )}

            {/* Selection actions */}
            {selectedText && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 p-4 rounded-xl bg-card border border-chaos shadow-lg flex items-center gap-4">
                <span className="text-sm text-foreground max-w-[200px] truncate">&ldquo;{selectedText}&rdquo;</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onAddToMystery(selectedText)
                      setSelectedText("")
                    }}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Add to Mystery Shelf
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-error-garden border-error-garden bg-transparent"
                    onClick={() => setSelectedText("")}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Flag Unknown
                  </Button>
                </div>
              </div>
            )}

            {/* Delayed Lookup Modal for single words */}
            {selectedWord && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md p-4 z-50">
                <DelayedLookupWord
                  word={selectedWord}
                  language={content.language}
                  onClose={() => setSelectedWord(null)}
                  onLearned={handleWordLearned}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer with description */}
        {content.description && (
          <div className="p-4 border-t border-border bg-secondary/30">
            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">{content.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
