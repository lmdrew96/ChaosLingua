"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Play, 
  RotateCcw, 
  Check, 
  X, 
  ArrowRight, 
  Trophy,
  Target,
  Clock,
  Zap
} from "lucide-react"
import type { HangulSyllableType, HangulProgress } from "@/lib/types"

interface HangulDrillProps {
  onComplete: (stats: { correct: number; total: number; averageSpeed: number }) => void
  onExit: () => void
  className?: string
}

// Romanization map
const ROMANIZATION: Record<string, string> = {
  // Basic vowels
  'ㅏ': 'a', 'ㅑ': 'ya', 'ㅓ': 'eo', 'ㅕ': 'yeo', 'ㅗ': 'o',
  'ㅛ': 'yo', 'ㅜ': 'u', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅣ': 'i',
  // Basic consonants
  'ㄱ': 'g/k', 'ㄴ': 'n', 'ㄷ': 'd/t', 'ㄹ': 'r/l', 'ㅁ': 'm',
  'ㅂ': 'b/p', 'ㅅ': 's', 'ㅇ': '-/ng', 'ㅈ': 'j', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  // Double consonants
  'ㄲ': 'kk', 'ㄸ': 'tt', 'ㅃ': 'pp', 'ㅆ': 'ss', 'ㅉ': 'jj',
  // Compound vowels
  'ㅐ': 'ae', 'ㅒ': 'yae', 'ㅔ': 'e', 'ㅖ': 'ye', 'ㅘ': 'wa',
  'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅢ': 'ui'
}

const SYLLABLE_SETS: Record<HangulSyllableType, { name: string; syllables: string[] }> = {
  basic_vowel: {
    name: "Basic Vowels",
    syllables: ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ']
  },
  basic_consonant: {
    name: "Basic Consonants",
    syllables: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
  },
  double_consonant: {
    name: "Double Consonants",
    syllables: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ']
  },
  compound_vowel: {
    name: "Compound Vowels",
    syllables: ['ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ']
  },
  final_consonant: {
    name: "Final Consonants",
    syllables: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ']
  }
}

type DrillMode = "recognition" | "typing" | "speed"

interface DrillQuestion {
  syllable: string
  type: HangulSyllableType
  romanization: string
}

export function HangulDrill({ onComplete, onExit, className }: HangulDrillProps) {
  const [selectedTypes, setSelectedTypes] = useState<HangulSyllableType[]>(["basic_vowel", "basic_consonant"])
  const [mode, setMode] = useState<DrillMode>("recognition")
  const [isStarted, setIsStarted] = useState(false)
  const [questions, setQuestions] = useState<DrillQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0, speeds: [] as number[] })
  const [startTime, setStartTime] = useState<number>(0)
  
  const inputRef = useRef<HTMLInputElement>(null)

  const currentQuestion = questions[currentIndex]

  const generateQuestions = useCallback(() => {
    const allSyllables: DrillQuestion[] = []
    
    for (const type of selectedTypes) {
      const set = SYLLABLE_SETS[type]
      for (const syllable of set.syllables) {
        allSyllables.push({
          syllable,
          type,
          romanization: ROMANIZATION[syllable] || syllable
        })
      }
    }
    
    // Shuffle
    for (let i = allSyllables.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSyllables[i], allSyllables[j]] = [allSyllables[j], allSyllables[i]]
    }
    
    return allSyllables.slice(0, 20) // 20 questions per drill
  }, [selectedTypes])

  const startDrill = () => {
    const newQuestions = generateQuestions()
    setQuestions(newQuestions)
    setCurrentIndex(0)
    setStats({ correct: 0, total: 0, speeds: [] })
    setIsStarted(true)
    setStartTime(Date.now())
  }

  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return
    
    const responseTime = Date.now() - startTime
    const normalized = userInput.toLowerCase().trim()
    const correctAnswers = currentQuestion.romanization.toLowerCase().split('/').map(s => s.trim())
    const correct = correctAnswers.some(ans => normalized === ans || normalized.includes(ans))
    
    setIsCorrect(correct)
    setShowResult(true)
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      speeds: [...prev.speeds, responseTime]
    }))

    // Record practice to API
    fetch('/api/hangul', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syllable: currentQuestion.syllable,
        syllableType: currentQuestion.type,
        correct,
        responseTimeMs: responseTime
      })
    }).catch(console.error)
  }, [currentQuestion, userInput, startTime])

  const nextQuestion = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      // Drill complete
      const avgSpeed = stats.speeds.length > 0 
        ? Math.round(stats.speeds.reduce((a, b) => a + b, 0) / stats.speeds.length)
        : 0
      onComplete({
        correct: stats.correct + (isCorrect ? 1 : 0),
        total: stats.total + 1,
        averageSpeed: avgSpeed
      })
    } else {
      setCurrentIndex(prev => prev + 1)
      setUserInput("")
      setShowResult(false)
      setStartTime(Date.now())
      inputRef.current?.focus()
    }
  }, [currentIndex, questions.length, stats, isCorrect, onComplete])

  const toggleType = (type: HangulSyllableType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Setup screen
  if (!isStarted) {
    return (
      <div className={cn("p-6 space-y-6", className)}>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Hangul Drill</h2>
          <p className="text-muted-foreground">Practice Korean character recognition</p>
        </div>

        {/* Type selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Select syllable types to practice:</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(SYLLABLE_SETS) as [HangulSyllableType, { name: string; syllables: string[] }][]).map(([type, data]) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleType(type)}
                className="justify-start"
              >
                {selectedTypes.includes(type) && <Check className="w-4 h-4 mr-2" />}
                {data.name} ({data.syllables.length})
              </Button>
            ))}
          </div>
        </div>

        {/* Mode selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Drill mode:</p>
          <div className="flex gap-2">
            <Button
              variant={mode === "recognition" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("recognition")}
              className="flex-1"
            >
              <Target className="w-4 h-4 mr-2" />
              Recognition
            </Button>
            <Button
              variant={mode === "speed" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("speed")}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Speed
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onExit} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={startDrill} 
            disabled={selectedTypes.length === 0}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Drill
          </Button>
        </div>
      </div>
    )
  }

  // Drill in progress
  return (
    <div className={cn("p-6 space-y-6", className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{stats.correct} correct</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current syllable */}
      {currentQuestion && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className={cn(
            "w-32 h-32 rounded-2xl flex items-center justify-center",
            "bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30"
          )}>
            <span className="text-6xl font-bold text-foreground">
              {currentQuestion.syllable}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Type the romanization:
          </p>

          {!showResult ? (
            <div className="w-full max-w-xs space-y-3">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Type here..."
                className="text-center text-lg"
                autoFocus
              />
              <Button onClick={checkAnswer} className="w-full" disabled={!userInput.trim()}>
                Check Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className={cn(
                "p-4 rounded-lg",
                isCorrect ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isCorrect ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                  <span className={cn(
                    "font-bold",
                    isCorrect ? "text-green-500" : "text-red-500"
                  )}>
                    {isCorrect ? "Correct!" : "Not quite"}
                  </span>
                </div>
                
                {!isCorrect && (
                  <p className="text-muted-foreground">
                    Correct answer: <span className="font-medium text-foreground">{currentQuestion.romanization}</span>
                  </p>
                )}
              </div>

              <Button onClick={nextQuestion} className="gap-2">
                {currentIndex >= questions.length - 1 ? (
                  <>
                    <Trophy className="w-4 h-4" />
                    Finish
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Next
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Exit button */}
      <Button variant="ghost" onClick={onExit} className="w-full">
        Exit Drill
      </Button>
    </div>
  )
}

interface HangulReferenceProps {
  className?: string
}

export function HangulReference({ className }: HangulReferenceProps) {
  const [activeTab, setActiveTab] = useState<HangulSyllableType>("basic_vowel")

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground">Hangul Reference</h3>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(SYLLABLE_SETS) as [HangulSyllableType, { name: string }][]).map(([type, data]) => (
          <Button
            key={type}
            variant={activeTab === type ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(type)}
          >
            {data.name}
          </Button>
        ))}
      </div>

      {/* Syllable grid */}
      <div className="grid grid-cols-5 gap-3">
        {SYLLABLE_SETS[activeTab].syllables.map((syllable) => (
          <div
            key={syllable}
            className="p-3 rounded-lg bg-secondary/50 border border-border text-center hover:bg-secondary transition-colors"
          >
            <span className="text-2xl font-bold text-foreground block mb-1">{syllable}</span>
            <span className="text-xs text-muted-foreground">{ROMANIZATION[syllable]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
