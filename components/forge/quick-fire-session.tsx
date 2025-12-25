"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Zap, Mic, MicOff, ArrowRight, Check, AlertCircle } from "lucide-react"
import type { Language } from "@/lib/types"

interface QuickFireSessionProps {
  language: Language
  onComplete: (responses: { prompt: string; response: string; selfAssessment: string }[]) => void
  onExit: () => void
}

const prompts = {
  ro: [
    "Descrie dimineața ta în 3 propoziții.",
    "Ce ai mâncat azi? De ce?",
    "Care este locul tău preferat din oraș?",
    "Spune-mi despre un prieten bun.",
    "Ce vreme este afară acum?",
  ],
  ko: [
    "오늘 아침에 뭐 했어요?",
    "좋아하는 음식이 뭐예요? 왜요?",
    "주말에 보통 뭐 해요?",
    "가족에 대해 말해 주세요.",
    "지금 날씨가 어때요?",
  ],
}

export function QuickFireSession({ language, onComplete, onExit }: QuickFireSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [response, setResponse] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [responses, setResponses] = useState<{ prompt: string; response: string; selfAssessment: string }[]>([])
  const [showSelfReview, setShowSelfReview] = useState(false)
  const [selfAssessment, setSelfAssessment] = useState("")

  const currentPrompts = prompts[language]
  const currentPrompt = currentPrompts[currentIndex]
  const isLastPrompt = currentIndex === currentPrompts.length - 1

  const handleSubmitResponse = () => {
    if (response.trim()) {
      setShowSelfReview(true)
    }
  }

  const handleSelfReviewSubmit = () => {
    const newResponses = [
      ...responses,
      {
        prompt: currentPrompt,
        response: response.trim(),
        selfAssessment: selfAssessment.trim(),
      },
    ]
    setResponses(newResponses)

    if (isLastPrompt) {
      onComplete(newResponses)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setResponse("")
      setSelfAssessment("")
      setShowSelfReview(false)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real implementation, this would handle voice recording
    if (!isRecording) {
      console.log("[v0] Started recording")
    } else {
      console.log("[v0] Stopped recording")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {currentPrompts.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-1 h-2 rounded-full transition-colors",
              idx < currentIndex ? "bg-forge" : idx === currentIndex ? "bg-forge/50" : "bg-secondary",
            )}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-forge/20">
          <Zap className="w-6 h-6 text-forge" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Quick Fire</h2>
          <p className="text-sm text-muted-foreground">
            Prompt {currentIndex + 1} of {currentPrompts.length}
          </p>
        </div>
      </div>

      {/* Prompt */}
      <div className="p-6 rounded-xl bg-card border border-forge/30">
        <p className="text-xl font-medium text-foreground text-center">{currentPrompt}</p>
        <p className="text-center text-sm text-muted-foreground mt-2">{language === "ro" ? "🇷🇴" : "🇰🇷"}</p>
      </div>

      {!showSelfReview ? (
        <>
          {/* Response input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Your Response</label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                className={cn("bg-transparent", isRecording && "border-red-500 text-red-500")}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Record Voice
                  </>
                )}
              </Button>
            </div>

            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={language === "ro" ? "Scrie răspunsul tău aici..." : "여기에 답을 쓰세요..."}
              className="min-h-[120px] text-lg"
            />

            {isRecording && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-red-400">Recording...</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onExit}>
              Exit Session
            </Button>
            <Button
              className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90"
              onClick={handleSubmitResponse}
              disabled={!response.trim()}
            >
              Submit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Self review */}
          <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <AlertCircle className="w-5 h-5 text-forge" />
              <span className="font-medium">Self Review</span>
            </div>
            <p className="text-sm text-muted-foreground">What do you think you got wrong? Any mistakes you noticed?</p>

            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-foreground italic">&ldquo;{response}&rdquo;</p>
            </div>

            <Textarea
              value={selfAssessment}
              onChange={(e) => setSelfAssessment(e.target.value)}
              placeholder="I think I might have made a mistake with... / I'm not sure about..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowSelfReview(false)}>
              Edit Response
            </Button>
            <Button
              className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90"
              onClick={handleSelfReviewSubmit}
            >
              <Check className="w-4 h-4 mr-2" />
              {isLastPrompt ? "Complete Session" : "Next Prompt"}
            </Button>
          </div>
        </>
      )}

      {/* Tips */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Don&apos;t overthink it. Speed over perfection. The errors are the learning.</p>
      </div>
    </div>
  )
}
