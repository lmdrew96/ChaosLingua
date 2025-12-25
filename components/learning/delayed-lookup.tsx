"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lock, Unlock, BookOpen, Sparkles, HelpCircle } from "lucide-react"
import type { Language, WordEncounter } from "@/lib/types"

interface DelayedLookupWordProps {
  word: string
  language: Language
  definition?: string
  encounter?: WordEncounter
  onEncounter: (word: string) => Promise<WordEncounter>
  onLookup: (word: string) => Promise<void>
  onSelfDiscovered: (word: string) => Promise<void>
  className?: string
}

export function DelayedLookupWord({
  word,
  language,
  definition,
  encounter,
  onEncounter,
  onLookup,
  onSelfDiscovered,
  className
}: DelayedLookupWordProps) {
  const [showDefinition, setShowDefinition] = useState(false)
  const [localEncounter, setLocalEncounter] = useState<WordEncounter | undefined>(encounter)
  const [isLoading, setIsLoading] = useState(false)

  const encounterCount = localEncounter?.encounterCount ?? 0
  const isUnlocked = localEncounter?.definitionUnlocked ?? false
  const remainingEncounters = Math.max(0, 3 - encounterCount)

  const handleClick = useCallback(async () => {
    if (!localEncounter) {
      // First encounter - record it
      setIsLoading(true)
      try {
        const newEncounter = await onEncounter(word)
        setLocalEncounter(newEncounter)
      } finally {
        setIsLoading(false)
      }
    } else if (isUnlocked && definition) {
      setShowDefinition(!showDefinition)
    }
  }, [localEncounter, isUnlocked, definition, showDefinition, word, onEncounter])

  const handleLookup = useCallback(async () => {
    setIsLoading(true)
    try {
      await onLookup(word)
      setLocalEncounter(prev => prev ? { ...prev, definitionUnlocked: true, lookedUp: true } : prev)
      setShowDefinition(true)
    } finally {
      setIsLoading(false)
    }
  }, [word, onLookup])

  const handleSelfDiscovered = useCallback(async () => {
    setIsLoading(true)
    try {
      await onSelfDiscovered(word)
      setLocalEncounter(prev => prev ? { ...prev, definitionUnlocked: true, selfDiscovered: true } : prev)
    } finally {
      setIsLoading(false)
    }
  }, [word, onSelfDiscovered])

  return (
    <span className={cn("inline-block", className)}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "px-1 py-0.5 rounded transition-all",
          isUnlocked 
            ? "bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer"
            : "bg-fog/20 hover:bg-fog/30 text-fog cursor-help",
          isLoading && "opacity-50"
        )}
      >
        {word}
        {!isUnlocked && (
          <Lock className="w-3 h-3 inline ml-1 opacity-50" />
        )}
      </button>

      {/* Tooltip/Popover for word details */}
      {(showDefinition || (!isUnlocked && localEncounter)) && (
        <span className="relative">
          <span className="absolute left-0 top-full mt-1 z-50 min-w-[200px] p-3 rounded-lg bg-popover border border-border shadow-lg">
            {isUnlocked && definition ? (
              <span className="block space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookOpen className="w-4 h-4" />
                  Definition
                </span>
                <span className="block text-sm text-muted-foreground">{definition}</span>
                {localEncounter?.selfDiscovered && (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Sparkles className="w-3 h-3" />
                    Self-discovered!
                  </span>
                )}
              </span>
            ) : (
              <span className="block space-y-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-fog" />
                  <span>
                    {remainingEncounters > 0 
                      ? `See ${remainingEncounters} more time${remainingEncounters > 1 ? 's' : ''} to unlock`
                      : "Definition locked"}
                  </span>
                </span>
                
                <span className="block space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={handleSelfDiscovered}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    I figured it out!
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full text-xs text-muted-foreground"
                    onClick={handleLookup}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Look it up anyway
                  </Button>
                </span>

                <span className="block text-xs text-center text-muted-foreground">
                  Encounters: {encounterCount}/3
                </span>
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  )
}

interface DelayedLookupTextProps {
  text: string
  language: Language
  definitions?: Record<string, string>
  onEncounter: (word: string) => Promise<WordEncounter>
  onLookup: (word: string) => Promise<void>
  onSelfDiscovered: (word: string) => Promise<void>
  className?: string
}

export function DelayedLookupText({
  text,
  language,
  definitions = {},
  onEncounter,
  onLookup,
  onSelfDiscovered,
  className
}: DelayedLookupTextProps) {
  // Split text into words while preserving punctuation and spaces
  const tokens = text.split(/(\s+|[,.!?;:"'()[\]{}])/g).filter(Boolean)

  return (
    <p className={cn("text-foreground leading-relaxed", className)}>
      {tokens.map((token, index) => {
        // Check if it's a word (not just punctuation/space)
        const isWord = /^[\p{L}\p{M}]+$/u.test(token)
        
        if (!isWord) {
          return <span key={index}>{token}</span>
        }

        return (
          <DelayedLookupWord
            key={`${token}-${index}`}
            word={token}
            language={language}
            definition={definitions[token.toLowerCase()]}
            onEncounter={onEncounter}
            onLookup={onLookup}
            onSelfDiscovered={onSelfDiscovered}
          />
        )
      })}
    </p>
  )
}
