"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Volume2, Mic, MicOff, Play, Pause, RotateCcw, ArrowRight, Check, Square, Loader2 } from "lucide-react"
import { useForgePrompts } from "@/lib/hooks/use-forge-prompts"
import type { Language } from "@/lib/types"

interface ShadowSpeakSessionProps {
  language: Language
  onComplete: (stats: { clipsCompleted: number; totalDuration: number }) => void
  onExit: () => void
}

interface AudioClip {
  id: string
  text: string
  audioUrl: string
  duration: number
}

// Fallback audio clips in case database fetch fails
const fallbackClips: Record<Language, AudioClip[]> = {
  ro: [
    {
      id: "ro1",
      text: "Bună ziua! Cum te numești?",
      audioUrl: "",
      duration: 3,
    },
    {
      id: "ro2",
      text: "Mă bucur să te cunosc.",
      audioUrl: "",
      duration: 2,
    },
    {
      id: "ro3",
      text: "Ce mai faci? Totul e bine?",
      audioUrl: "",
      duration: 3,
    },
    {
      id: "ro4",
      text: "Vreau să învăț limba română.",
      audioUrl: "",
      duration: 3,
    },
    {
      id: "ro5",
      text: "Mulțumesc foarte mult pentru ajutor!",
      audioUrl: "",
      duration: 3,
    },
  ],
  ko: [
    {
      id: "ko1",
      text: "안녕하세요! 만나서 반갑습니다.",
      audioUrl: "",
      duration: 3,
    },
    {
      id: "ko2",
      text: "저는 한국어를 배우고 있어요.",
      audioUrl: "",
      duration: 3,
    },
    {
      id: "ko3",
      text: "오늘 날씨가 정말 좋아요.",
      audioUrl: "",
      duration: 3,
    },
    {
      id: "ko4",
      text: "이거 얼마예요?",
      audioUrl: "",
      duration: 2,
    },
    {
      id: "ko5",
      text: "감사합니다! 안녕히 가세요.",
      audioUrl: "",
      duration: 3,
    },
  ],
}

type Phase = "listen" | "shadow" | "compare" | "review"

export function ShadowSpeakSession({ language, onComplete, onExit }: ShadowSpeakSessionProps) {
  // Fetch shadow speak prompts from database
  const { prompts: dbPrompts, isLoading: promptsLoading } = useForgePrompts({
    type: "shadow_speak",
    language,
    limit: 5,
    random: true,
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("listen")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null)
  const [playingOriginal, setPlayingOriginal] = useState(false)
  const [playingUser, setPlayingUser] = useState(false)
  const [completedClips, setCompletedClips] = useState<string[]>([])

  // Convert database prompts to audio clip format or use fallback
  const clips: AudioClip[] = useMemo(() => {
    if (dbPrompts && dbPrompts.length > 0) {
      return dbPrompts.map((p) => ({
        id: p.id,
        text: p.text,
        audioUrl: "", // TTS will be used
        duration: Math.ceil(p.text.length / 10), // Estimate duration based on text length
      }))
    }
    return fallbackClips[language]
  }, [dbPrompts, language])

  const currentClip = clips[currentIndex]
  const isLastClip = currentIndex === clips.length - 1

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const originalAudioRef = useRef<HTMLAudioElement | null>(null)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl)
      window.speechSynthesis.cancel()
    }
  }, [userAudioUrl])

  // Show loading state while fetching prompts
  if (promptsLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-forge animate-spin" />
        <p className="text-muted-foreground">Loading shadow speak prompts...</p>
      </div>
    )
  }

  // Use Web Speech API for TTS as fallback when no audio URL
  const playOriginalAudio = useCallback(() => {
    if (currentClip.audioUrl) {
      // Use actual audio file if available
      if (!originalAudioRef.current) {
        originalAudioRef.current = new Audio(currentClip.audioUrl)
        originalAudioRef.current.onended = () => setPlayingOriginal(false)
      }
      originalAudioRef.current.play()
      setPlayingOriginal(true)
    } else {
      // Fallback to TTS
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(currentClip.text)
      utterance.lang = language === "ro" ? "ro-RO" : "ko-KR"
      utterance.rate = 0.9
      utterance.onend = () => setPlayingOriginal(false)
      speechSynthRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setPlayingOriginal(true)
    }
  }, [currentClip, language])

  const stopOriginalAudio = useCallback(() => {
    if (originalAudioRef.current) {
      originalAudioRef.current.pause()
      originalAudioRef.current.currentTime = 0
    }
    window.speechSynthesis.cancel()
    setPlayingOriginal(false)
  }, [])

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
        setUserAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

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

  const playUserAudio = useCallback(() => {
    if (userAudioUrl && userAudioRef.current) {
      userAudioRef.current.play()
      setPlayingUser(true)
    }
  }, [userAudioUrl])

  const stopUserAudio = useCallback(() => {
    if (userAudioRef.current) {
      userAudioRef.current.pause()
      userAudioRef.current.currentTime = 0
    }
    setPlayingUser(false)
  }, [])

  const handleListenComplete = () => {
    stopOriginalAudio()
    setPhase("shadow")
  }

  const handleShadowComplete = () => {
    stopRecording()
    setPhase("compare")
  }

  const handleNextClip = () => {
    setCompletedClips((prev) => [...prev, currentClip.id])

    if (isLastClip) {
      const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0)
      onComplete({
        clipsCompleted: clips.length,
        totalDuration,
      })
    } else {
      // Reset for next clip
      setCurrentIndex((prev) => prev + 1)
      setPhase("listen")
      setUserAudioUrl(null)
      setRecordingDuration(0)
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl)
    }
  }

  const handleRetry = () => {
    setPhase("listen")
    setUserAudioUrl(null)
    setRecordingDuration(0)
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
        {clips.map((clip, idx) => (
          <div
            key={clip.id}
            className={cn(
              "flex-1 h-2 rounded-full transition-colors",
              completedClips.includes(clip.id)
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
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Shadow Speak</h2>
            <p className="text-sm text-muted-foreground">
              Clip {currentIndex + 1} of {clips.length}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          <Square className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-4 py-4">
        {(["listen", "shadow", "compare"] as const).map((p, idx) => {
          const phases = ["listen", "shadow", "compare"] as const
          const currentPhaseIndex = phases.indexOf(phase as typeof phases[number])
          return (
          <div key={p} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                phase === p
                  ? "bg-forge text-forge-foreground"
                  : currentPhaseIndex > idx
                    ? "bg-forge/30 text-forge"
                    : "bg-secondary text-muted-foreground",
              )}
            >
              {idx + 1}
            </div>
            <span
              className={cn(
                "text-sm capitalize",
                phase === p ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {p}
            </span>
            {idx < 2 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />}
          </div>
        )})}
      </div>

      {/* Main content card */}
      <div className="p-6 rounded-xl border border-forge/30 bg-card space-y-6">
        {/* Text display */}
        <div className="p-6 rounded-lg bg-secondary/50 text-center">
          <p className="text-2xl font-medium text-foreground leading-relaxed">{currentClip.text}</p>
        </div>

        {/* Phase-specific content */}
        {phase === "listen" && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Listen carefully to the native pronunciation. Pay attention to rhythm and intonation.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={playingOriginal ? stopOriginalAudio : playOriginalAudio}
                className={cn(
                  "min-w-[180px]",
                  playingOriginal
                    ? "bg-forge/20 text-forge border-forge"
                    : "bg-forge text-forge-foreground hover:bg-forge/90",
                )}
                variant={playingOriginal ? "outline" : "default"}
              >
                {playingOriginal ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play Audio
                  </>
                )}
              </Button>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleListenComplete} className="bg-transparent">
                Ready to Shadow
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {phase === "shadow" && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Now record yourself saying the same phrase. Try to match the rhythm and intonation.
            </p>

            {/* Recording visualization */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                  isRecording
                    ? "bg-red-500/20 animate-pulse"
                    : userAudioUrl
                      ? "bg-green-500/20"
                      : "bg-secondary",
                )}
              >
                {isRecording ? (
                  <Mic className="w-10 h-10 text-red-500" />
                ) : userAudioUrl ? (
                  <Check className="w-10 h-10 text-green-500" />
                ) : (
                  <MicOff className="w-10 h-10 text-muted-foreground" />
                )}
              </div>

              {isRecording && (
                <p className="text-2xl font-mono text-foreground">{formatDuration(recordingDuration)}</p>
              )}

              {userAudioUrl && !isRecording && (
                <p className="text-sm text-muted-foreground">Recording complete!</p>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!userAudioUrl ? (
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "min-w-[180px]",
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-forge text-forge-foreground hover:bg-forge/90",
                  )}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setUserAudioUrl(null)} className="bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Re-record
                  </Button>
                  <Button
                    onClick={handleShadowComplete}
                    className="bg-forge text-forge-foreground hover:bg-forge/90"
                  >
                    Compare
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {phase === "compare" && (
          <div className="space-y-6">
            <p className="text-center text-muted-foreground">
              Compare your recording to the original. Listen for differences in rhythm, intonation, and pronunciation.
            </p>

            {/* Audio comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3">
                <p className="text-sm font-medium text-foreground text-center">Original</p>
                <Button
                  onClick={playingOriginal ? stopOriginalAudio : playOriginalAudio}
                  variant="outline"
                  className={cn("w-full bg-transparent", playingOriginal && "border-forge text-forge")}
                >
                  {playingOriginal ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>

              {/* User recording */}
              <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3">
                <p className="text-sm font-medium text-foreground text-center">Your Recording</p>
                {userAudioUrl && (
                  <audio ref={userAudioRef} src={userAudioUrl} onEnded={() => setPlayingUser(false)} />
                )}
                <Button
                  onClick={playingUser ? stopUserAudio : playUserAudio}
                  variant="outline"
                  className={cn("w-full bg-transparent", playingUser && "border-forge text-forge")}
                  disabled={!userAudioUrl}
                >
                  {playingUser ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={handleRetry} className="bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleNextClip} className="bg-forge text-forge-foreground hover:bg-forge/90">
                {isLastClip ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Session
                  </>
                ) : (
                  <>
                    Next Clip
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 rounded-lg bg-forge/10 border border-forge/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">💡 Tip:</span>{" "}
          {phase === "listen" && "Close your eyes and focus on the melody of the language."}
          {phase === "shadow" && "Don't worry about perfection—focus on the flow and rhythm."}
          {phase === "compare" && "Notice specific sounds that differ. These are your growth edges."}
        </p>
      </div>
    </div>
  )
}
