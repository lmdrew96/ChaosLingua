"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Cloud, BookmarkPlus, Eye, EyeOff, Lock, Unlock } from "lucide-react"
import type { ContentItem } from "@/lib/types"

interface FogContentProps {
  content: ContentItem
  fogLevel: number
  delayedLookup: boolean
  onAddToMystery: (word: string, context: string) => void
  onWordEncounter: (word: string) => void
}

interface TrackedWord {
  word: string
  encounters: number
  unlocked: boolean
  definition?: string
}

// Mock definitions for demo
const mockDefinitions: Record<string, string> = {
  frumos: "beautiful, handsome",
  casă: "house, home",
  머리: "head, hair",
  사랑: "love",
  먹다: "to eat",
}

export function FogContent({ content, fogLevel, delayedLookup, onAddToMystery, onWordEncounter }: FogContentProps) {
  const [trackedWords, setTrackedWords] = useState<Map<string, TrackedWord>>(new Map())
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [showDefinition, setShowDefinition] = useState(false)

  // Simulated fog content with some words to interact with
  const fogText =
    content.language === "ro"
      ? `Astăzi am mers la casă. Era foarte frumos afară și am decis să plec în parc. Am văzut mulți copii care se jucau.`
      : `오늘 저는 집에 갔어요. 밖이 아주 좋았고, 공원에 가기로 했어요. 많은 아이들이 놀고 있었어요.`

  // Words that can be interacted with
  const interactiveWords =
    content.language === "ro" ? ["casă", "frumos", "parc", "copii"] : ["집", "좋았고", "공원", "아이들"]

  const handleWordClick = (word: string) => {
    setSelectedWord(word)
    setShowDefinition(false)
    onWordEncounter(word)

    // Track encounters
    setTrackedWords((prev) => {
      const current = prev.get(word) || { word, encounters: 0, unlocked: false }
      const updated = {
        ...current,
        encounters: current.encounters + 1,
        unlocked: current.encounters + 1 >= 3 || !delayedLookup,
      }
      return new Map(prev).set(word, updated)
    })
  }

  const currentWordData = selectedWord ? trackedWords.get(selectedWord) : null
  const canShowDefinition = currentWordData?.unlocked || !delayedLookup

  // Render text with interactive words highlighted
  const renderFogText = () => {
    const words = fogText.split(/(\s+)/)
    return words.map((word, idx) => {
      const cleanWord = word.replace(/[.,!?]/g, "")
      const isInteractive = interactiveWords.includes(cleanWord)
      const wordData = trackedWords.get(cleanWord)

      if (isInteractive) {
        return (
          <button
            key={idx}
            onClick={() => handleWordClick(cleanWord)}
            className={cn(
              "relative inline px-0.5 rounded transition-all",
              selectedWord === cleanWord
                ? "bg-fog/30 text-fog"
                : wordData?.encounters
                  ? wordData.unlocked
                    ? "bg-green-500/20 text-green-400"
                    : "bg-amber-500/20 text-amber-400"
                  : "hover:bg-fog/20 text-foreground underline decoration-fog/50 decoration-dotted underline-offset-4",
            )}
          >
            {word}
            {wordData && !wordData.unlocked && delayedLookup && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        )
      }
      return <span key={idx}>{word}</span>
    })
  }

  return (
    <div className="space-y-6">
      {/* Fog indicator */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-fog/10 border border-fog/20">
        <div className="flex items-center gap-3">
          <Cloud className="w-5 h-5 text-fog" />
          <div>
            <p className="text-sm font-medium text-foreground">Fog Level: {fogLevel}%</p>
            <p className="text-xs text-muted-foreground">
              Content is {fogLevel >= 70 ? "well above" : fogLevel >= 50 ? "above" : "near"} your level
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {delayedLookup ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>Delayed lookup {delayedLookup ? "on" : "off"}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-foreground">{renderFogText()}</p>
        </div>
      </div>

      {/* Selected word panel */}
      {selectedWord && (
        <div className="p-4 rounded-xl border border-fog/30 bg-fog/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">{selectedWord}</span>
              <span className="text-sm text-muted-foreground">{content.language === "ro" ? "🇷🇴" : "🇰🇷"}</span>
            </div>

            {currentWordData && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Seen {currentWordData.encounters}x</span>
                {currentWordData.unlocked ? (
                  <Unlock className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" />
                )}
              </div>
            )}
          </div>

          {/* Definition section */}
          {canShowDefinition ? (
            <div className="space-y-3">
              {!showDefinition ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDefinition(true)}
                  className="w-full bg-transparent border-fog/30 text-fog hover:bg-fog/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Reveal Definition
                </Button>
              ) : (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-foreground">{mockDefinitions[selectedWord] || "Definition not found"}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Locked</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Encounter this word {3 - (currentWordData?.encounters || 0)} more time
                {3 - (currentWordData?.encounters || 0) !== 1 ? "s" : ""} to unlock the definition
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={() => {
                onAddToMystery(selectedWord, fogText)
                setSelectedWord(null)
              }}
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Add to Mystery Shelf
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Click on underlined words to explore. Trust the fog - meaning will emerge.</p>
      </div>
    </div>
  )
}
