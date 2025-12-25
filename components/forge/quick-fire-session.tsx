"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Zap, Mic, ArrowRight, Check, AlertCircle, Square, Loader2 } from "lucide-react"
import { useForgePrompts } from "@/lib/hooks/use-forge-prompts"
import type { Language } from "@/lib/types"

interface QuickFireSessionProps {
  language: Language
  onComplete: (responses: { prompt: string; response: string; selfAssessment: string }[]) => void
  onExit: () => void
}

// Fallback prompts in case database fetch fails
const fallbackPrompts = {
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
  // Fetch prompts from database
  const { prompts: dbPrompts, isLoading: promptsLoading } = useForgePrompts({
    type: "quick_fire",
    language,
    limit: 5,
    random: true,
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [response, setResponse] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [responses, setResponses] = useState<{ prompt: string; response: string; selfAssessment: string }[]>([])
  const [showSelfReview, setShowSelfReview] = useState(false)
  const [selfAssessment, setSelfAssessment] = useState("")

  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Use database prompts or fallback to hardcoded ones
  const currentPrompts = useMemo(() => {
    if (dbPrompts && dbPrompts.length > 0) {
      return dbPrompts.map(p => p.text)
    }
    return fallbackPrompts[language]
  }, [dbPrompts, language])

  const currentPrompt = currentPrompts[currentIndex]
  const isLastPrompt = currentIndex === currentPrompts.length - 1

  // Show loading state while fetching prompts
  if (promptsLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-forge animate-spin" />
        <p className="text-muted-foreground">Loading prompts...</p>
      </div>
    )
  }

  const handleSubmitResponse = () => {
    if (response.trim() || audioUrl) {
      setShowSelfReview(true)
    }
  }

  const handleSelfReviewSubmit = () => {
    const newResponses = [
      ...responses,
      {
        prompt: currentPrompt,
        response: response.trim() || (audioUrl ? "[Audio Response]" : ""),
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
      setAudioUrl(null)
      setRecordingDuration(0)
    }
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check your permissions.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
                    <Square className="w-4 h-4 mr-2" />
                    Stop ({formatDuration(recordingDuration)})
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
                <span className="text-sm text-red-400">Recording... {formatDuration(recordingDuration)}</span>
              </div>
            )}

            {audioUrl && !isRecording && (
              <div className="p-3 rounded-lg bg-forge/10 border border-forge/20 space-y-2">
                <div className="flex items-center gap-2 text-forge">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm font-medium">Voice Recording ({formatDuration(recordingDuration)})</span>
                </div>
                <audio controls className="w-full h-10" src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAudioUrl(null)
                    setRecordingDuration(0)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Discard recording
                </Button>
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
              disabled={!response.trim() && !audioUrl}
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
