"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Languages, ArrowRight, Check, X, Eye, EyeOff, Square, RotateCcw, Lightbulb } from "lucide-react"
import type { Language } from "@/lib/types"

interface TranslationSessionProps {
  language: Language
  onComplete: (results: TranslationResult[]) => void
  onExit: () => void
}

interface TranslationResult {
  sourceText: string
  userTranslation: string
  correctTranslation: string
  selfAssessment: "correct" | "partial" | "wrong"
}

interface TranslationPrompt {
  id: string
  source: string
  target: string
  hint?: string
}

// Sample translation prompts - in production, these would come from the database
const translationPrompts: Record<Language, TranslationPrompt[]> = {
  ro: [
    {
      id: "ro1",
      source: "I want to learn Romanian.",
      target: "Vreau să învăț limba română.",
      hint: "Use 'vreau să' for 'I want to'",
    },
    {
      id: "ro2",
      source: "Where is the train station?",
      target: "Unde este gara?",
      hint: "Gara = train station",
    },
    {
      id: "ro3",
      source: "The book is on the table.",
      target: "Cartea este pe masă.",
      hint: "Remember the definite article suffix!",
    },
    {
      id: "ro4",
      source: "I like this city very much.",
      target: "Îmi place foarte mult acest oraș.",
      hint: "Use 'îmi place' for 'I like'",
    },
    {
      id: "ro5",
      source: "Can you help me, please?",
      target: "Poți să mă ajuți, te rog?",
      hint: "Use 'poți să' for 'can you'",
    },
  ],
  ko: [
    {
      id: "ko1",
      source: "I am learning Korean.",
      target: "저는 한국어를 배우고 있어요.",
      hint: "Use -고 있어요 for present progressive",
    },
    {
      id: "ko2",
      source: "Where is the subway station?",
      target: "지하철역이 어디예요?",
      hint: "지하철역 = subway station",
    },
    {
      id: "ko3",
      source: "This food is delicious.",
      target: "이 음식이 맛있어요.",
      hint: "맛있어요 = is delicious",
    },
    {
      id: "ko4",
      source: "I want to go to Korea.",
      target: "한국에 가고 싶어요.",
      hint: "Use -고 싶어요 for 'want to'",
    },
    {
      id: "ko5",
      source: "How much is this?",
      target: "이거 얼마예요?",
      hint: "얼마예요 = how much is it",
    },
  ],
}

type Phase = "translate" | "reveal" | "assess"

export function TranslationSession({ language, onComplete, onExit }: TranslationSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("translate")
  const [userTranslation, setUserTranslation] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [results, setResults] = useState<TranslationResult[]>([])

  const prompts = translationPrompts[language]
  const currentPrompt = prompts[currentIndex]
  const isLastPrompt = currentIndex === prompts.length - 1

  const handleSubmitTranslation = () => {
    if (userTranslation.trim()) {
      setPhase("reveal")
    }
  }

  const handleSelfAssess = (assessment: "correct" | "partial" | "wrong") => {
    const result: TranslationResult = {
      sourceText: currentPrompt.source,
      userTranslation: userTranslation.trim(),
      correctTranslation: currentPrompt.target,
      selfAssessment: assessment,
    }

    const newResults = [...results, result]
    setResults(newResults)

    if (isLastPrompt) {
      onComplete(newResults)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setPhase("translate")
      setUserTranslation("")
      setShowHint(false)
    }
  }

  const handleSkip = () => {
    const result: TranslationResult = {
      sourceText: currentPrompt.source,
      userTranslation: "",
      correctTranslation: currentPrompt.target,
      selfAssessment: "wrong",
    }

    const newResults = [...results, result]
    setResults(newResults)

    if (isLastPrompt) {
      onComplete(newResults)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setPhase("translate")
      setUserTranslation("")
      setShowHint(false)
    }
  }

  const languageNames: Record<Language, string> = {
    ro: "Romanian",
    ko: "Korean",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {prompts.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-1 h-2 rounded-full transition-colors",
              idx < currentIndex
                ? "bg-forge"
                : idx === currentIndex
                  ? "bg-forge/50"
                  : "bg-secondary",
            )}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-forge/20 text-forge">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Translation Practice</h2>
            <p className="text-sm text-muted-foreground">
              Sentence {currentIndex + 1} of {prompts.length}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          <Square className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>

      {/* Main content card */}
      <div className="p-6 rounded-xl border border-forge/30 bg-card space-y-6">
        {/* Source text */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">English</p>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xl font-medium text-foreground">{currentPrompt.source}</p>
          </div>
        </div>

        {/* Translation input / Reveal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{languageNames[language]}</p>
            {phase === "translate" && currentPrompt.hint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-forge hover:text-forge"
              >
                {showHint ? <EyeOff className="w-4 h-4 mr-1" /> : <Lightbulb className="w-4 h-4 mr-1" />}
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
            )}
          </div>

          {showHint && phase === "translate" && (
            <div className="p-3 rounded-lg bg-forge/10 border border-forge/20">
              <p className="text-sm text-foreground">
                <span className="font-medium">💡 Hint:</span> {currentPrompt.hint}
              </p>
            </div>
          )}

          {phase === "translate" ? (
            <Textarea
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              placeholder={`Type your ${languageNames[language]} translation...`}
              className="min-h-[100px] text-lg"
            />
          ) : (
            <div className="space-y-4">
              {/* User's translation */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Your translation:</p>
                <p className="text-lg text-foreground">{userTranslation || "(skipped)"}</p>
              </div>

              {/* Correct translation */}
              <div className="p-4 rounded-lg bg-forge/10 border border-forge/30">
                <p className="text-sm text-forge mb-1">Native translation:</p>
                <p className="text-lg font-medium text-foreground">{currentPrompt.target}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {phase === "translate" ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSkip}>
              Skip
            </Button>
            <Button
              className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90"
              onClick={handleSubmitTranslation}
              disabled={!userTranslation.trim()}
            >
              Check Translation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">How did you do?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => handleSelfAssess("wrong")}
              >
                <X className="w-4 h-4 mr-2" />
                Wrong
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-400"
                onClick={() => handleSelfAssess("partial")}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Partial
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-400"
                onClick={() => handleSelfAssess("correct")}
              >
                <Check className="w-4 h-4 mr-2" />
                Correct
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats so far */}
      {results.length > 0 && (
        <div className="flex justify-center gap-6 py-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {results.filter((r) => r.selfAssessment === "correct").length}
            </p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {results.filter((r) => r.selfAssessment === "partial").length}
            </p>
            <p className="text-xs text-muted-foreground">Partial</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {results.filter((r) => r.selfAssessment === "wrong").length}
            </p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </div>
        </div>
      )}
    </div>
  )
}
