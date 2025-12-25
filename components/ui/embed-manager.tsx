"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Loader2, AlertCircle, Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EmbedType } from "@/lib/types"

interface EmbedManagerProps {
  embedType: EmbedType
  embedId: string
  title?: string
  className?: string
  autoplay?: boolean
  onReady?: () => void
  onError?: (error: string) => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Extract SoundCloud track info from URL
export function extractSoundCloudInfo(url: string): { type: "track" | "playlist"; url: string } | null {
  if (url.includes("soundcloud.com")) {
    const isPlaylist = url.includes("/sets/")
    return { type: isPlaylist ? "playlist" : "track", url }
  }
  return null
}

export function EmbedManager({
  embedType,
  embedId,
  title,
  className,
  autoplay = false,
  onReady,
  onError,
  onTimeUpdate
}: EmbedManagerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onReady?.()
  }, [onReady])

  const handleError = useCallback((message: string) => {
    setError(message)
    setIsLoading(false)
    onError?.(message)
  }, [onError])

  // YouTube embed
  if (embedType === "youtube") {
    const youtubeId = extractYouTubeId(embedId) || embedId
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&rel=0${autoplay ? '&autoplay=1' : ''}`

    return (
      <div ref={containerRef} className={cn("relative w-full aspect-video bg-black rounded-lg overflow-hidden", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary gap-2">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://youtube.com/watch?v=${youtubeId}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open on YouTube
            </Button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || "YouTube video"}
          className={cn("w-full h-full", isLoading && "invisible")}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          onError={() => handleError("Failed to load YouTube video")}
        />
      </div>
    )
  }

  // SoundCloud embed
  if (embedType === "soundcloud") {
    const scInfo = extractSoundCloudInfo(embedId)
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(embedId)}&color=%23ff5500&auto_play=${autoplay}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-lg h-[166px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || "SoundCloud audio"}
          className={cn("w-full", isLoading && "invisible")}
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          onLoad={handleLoad}
          onError={() => handleError("Failed to load SoundCloud audio")}
        />
      </div>
    )
  }

  // Spotify embed
  if (embedType === "spotify") {
    // embedId should be in format: track/XXXXX or playlist/XXXXX or episode/XXXXX
    const embedUrl = `https://open.spotify.com/embed/${embedId}?utm_source=generator&theme=0`

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-lg h-[352px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || "Spotify content"}
          className={cn("w-full rounded-xl", isLoading && "invisible")}
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          onLoad={handleLoad}
          onError={() => handleError("Failed to load Spotify content")}
        />
      </div>
    )
  }

  // External link (fallback)
  if (embedType === "external") {
    return (
      <div className={cn("p-6 rounded-lg bg-secondary border border-border", className)}>
        <div className="flex items-center gap-3">
          <ExternalLink className="w-6 h-6 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{title || "External Content"}</p>
            <p className="text-xs text-muted-foreground truncate">{embedId}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(embedId, '_blank')}
          >
            Open
          </Button>
        </div>
      </div>
    )
  }

  // Internal video (future: self-hosted content)
  if (embedType === "internal") {
    return (
      <div ref={containerRef} className={cn("relative w-full aspect-video bg-black rounded-lg overflow-hidden", className)}>
        <video
          src={embedId}
          controls
          className="w-full h-full"
          onLoadedData={handleLoad}
          onError={() => handleError("Failed to load video")}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  return null
}

// Utility hook for embed detection
export function useEmbedType(url: string): { embedType: EmbedType; embedId: string } | null {
  if (!url) return null

  // YouTube
  const ytId = extractYouTubeId(url)
  if (ytId) {
    return { embedType: "youtube", embedId: ytId }
  }

  // SoundCloud
  if (url.includes("soundcloud.com")) {
    return { embedType: "soundcloud", embedId: url }
  }

  // Spotify
  if (url.includes("spotify.com")) {
    const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
    if (match) {
      return { embedType: "spotify", embedId: `${match[1]}/${match[2]}` }
    }
  }

  // Default to external
  return { embedType: "external", embedId: url }
}
