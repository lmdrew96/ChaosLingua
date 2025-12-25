"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Cloud, BookmarkPlus, Eye, EyeOff, Lock, Unlock, Loader2 } from "lucide-react"
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

interface Definition {
  word: string
  definition: string
  partOfSpeech?: string
  examples?: string[]
}

export function FogContent({ content, fogLevel, delayedLookup, onAddToMystery, onWordEncounter }: FogContentProps) {
  const [trackedWords, setTrackedWords] = useState<Map<string, TrackedWord>>(new Map())
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [showDefinition, setShowDefinition] = useState(false)
  const [definitionData, setDefinitionData] = useState<Definition | null>(null)
  const [loadingDefinition, setLoadingDefinition] = useState(false)

  // Reset state when content changes
  useEffect(() => {
    setTrackedWords(new Map())
    setSelectedWord(null)
    setShowDefinition(false)
    setDefinitionData(null)
  }, [content.id])

  // Sample texts in target languages
  const sampleTexts = {
    ro: [
      `Astăzi am mers la piață să cumpăr legume proaspete. Am găsit roșii foarte frumoase și castraveți. Vânzătorul mi-a recomandat și niște ardei.`,
      `Bucureștiul este capitala României. Este un oraș mare cu multe clădiri vechi și parcuri frumoase. Îmi place să merg pe Calea Victoriei.`,
      `Ieri am văzut un film românesc foarte interesant. A fost despre o familie din sat care se mută la oraș. Actorii au fost excelenți.`,
    ],
    ko: [
      `오늘 저는 서울에서 친구를 만났어요. 우리는 카페에서 커피를 마시고 이야기를 많이 했어요. 정말 즐거운 시간이었어요.`,
      `한국 음식을 정말 좋아해요. 특히 김치찌개와 비빔밥을 자주 먹어요. 매운 음식도 잘 먹을 수 있어요.`,
      `주말에 남산타워에 갔어요. 서울 시내가 한눈에 보여서 너무 아름다웠어요. 사진도 많이 찍었어요.`,
    ]
  }

  // Check if text is in the expected language (Korean text should contain Hangul)
  const isKoreanText = (text: string) => /[가-힣]/.test(text)

  // Use actual content text if it matches the language, otherwise use sample text
  const fogText = useMemo(() => {
    const rawText = content.transcript || ""
    
    if (content.language === "ko") {
      // For Korean content, check if the text actually contains Korean
      if (rawText && isKoreanText(rawText)) {
        return rawText
      }
      // Use random Korean sample text based on content id for consistency
      const index = content.id.charCodeAt(content.id.length - 1) % sampleTexts.ko.length
      return sampleTexts.ko[index]
    } else {
      // For Romanian, use the transcript if available
      if (rawText && rawText.length > 20) {
        return rawText
      }
      // Use sample Romanian text based on content id for consistency
      const index = content.id.charCodeAt(content.id.length - 1) % sampleTexts.ro.length
      return sampleTexts.ro[index]
    }
  }, [content.id, content.language, content.transcript])

  // Extract interactive words from actual content (words 4+ characters for Romanian, 2+ for Korean)
  const interactiveWords = useMemo(() => {
    const words = fogText.split(/\s+/).map(w => w.replace(/[.,!?;:"""'']/g, ""))
    const uniqueWords = [...new Set(words)]
    if (content.language === "ko") {
      return uniqueWords.filter(w => w.length >= 2).slice(0, 15)
    }
    return uniqueWords.filter(w => w.length >= 4).slice(0, 15)
  }, [fogText, content.language])

  // Fetch definition when word is selected and can be shown
  useEffect(() => {
    if (selectedWord && showDefinition) {
      setLoadingDefinition(true)
      fetch(`/api/definitions?word=${encodeURIComponent(selectedWord)}&language=${content.language}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setDefinitionData(data))
        .catch(() => setDefinitionData(null))
        .finally(() => setLoadingDefinition(false))
    }
  }, [selectedWord, showDefinition, content.language])

  const handleWordClick = (word: string) => {
    setSelectedWord(word)
    setShowDefinition(false)
    setDefinitionData(null)
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
      {/* Content title */}
      <div className="p-4 rounded-lg bg-card border border-border">
        <h2 className="font-semibold text-foreground">{content.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Level {content.difficulty} • {content.lengthMinutes} min • {content.type}
        </p>
      </div>

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
              ) : loadingDefinition ? (
                <div className="p-3 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                  <p className="text-foreground">{definitionData?.definition || "Definition not found"}</p>
                  {definitionData?.partOfSpeech && (
                    <p className="text-xs text-muted-foreground italic">{definitionData.partOfSpeech}</p>
                  )}
                  {definitionData?.examples && definitionData.examples.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      {definitionData.examples.slice(0, 2).map((ex, i) => (
                        <p key={i} className="italic">&ldquo;{ex}&rdquo;</p>
                      ))}
                    </div>
                  )}
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
