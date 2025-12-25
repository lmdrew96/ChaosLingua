"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useVoiceRecorder, formatDuration } from "@/lib/hooks/use-voice-recorder"
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Volume2, AlertCircle, Check } from "lucide-react"

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  originalText?: string
  originalAudioUrl?: string
  maxDuration?: number
  className?: string
}

export function VoiceRecorder({
  onRecordingComplete,
  originalText,
  originalAudioUrl,
  maxDuration = 120,
  className
}: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isSupported,
    error
  } = useVoiceRecorder({
    maxDuration,
    onRecordingComplete,
    onError: (err) => console.error("Recording error:", err)
  })

  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const recordingAudioRef = useRef<HTMLAudioElement>(null)
  const originalAudioRef = useRef<HTMLAudioElement>(null)

  // Handle audio playback
  useEffect(() => {
    if (recordingAudioRef.current) {
      recordingAudioRef.current.onended = () => setIsPlayingRecording(false)
    }
    if (originalAudioRef.current) {
      originalAudioRef.current.onended = () => setIsPlayingOriginal(false)
    }
  }, [audioUrl, originalAudioUrl])

  const toggleRecordingPlayback = () => {
    if (!recordingAudioRef.current || !audioUrl) return
    
    if (isPlayingRecording) {
      recordingAudioRef.current.pause()
      setIsPlayingRecording(false)
    } else {
      recordingAudioRef.current.play()
      setIsPlayingRecording(true)
    }
  }

  const toggleOriginalPlayback = () => {
    if (!originalAudioRef.current || !originalAudioUrl) return
    
    if (isPlayingOriginal) {
      originalAudioRef.current.pause()
      setIsPlayingOriginal(false)
    } else {
      originalAudioRef.current.play()
      setIsPlayingOriginal(true)
    }
  }

  if (!isSupported) {
    return (
      <div className={cn("p-4 rounded-lg bg-destructive/10 border border-destructive/20", className)}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Recording Not Supported</p>
            <p className="text-sm text-muted-foreground">
              Voice recording is not available in this browser. Try using Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Original text/audio to compare against */}
      {(originalText || originalAudioUrl) && (
        <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Listen & Repeat:</p>
          
          {originalText && (
            <p className="text-lg text-foreground">{originalText}</p>
          )}
          
          {originalAudioUrl && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleOriginalPlayback}
                className="gap-2"
              >
                {isPlayingOriginal ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Original
              </Button>
              <audio ref={originalAudioRef} src={originalAudioUrl} />
            </div>
          )}
        </div>
      )}

      {/* Recording controls */}
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border border-border">
        {/* Recording indicator */}
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all",
          isRecording 
            ? "bg-red-500/20 ring-4 ring-red-500/40 animate-pulse" 
            : audioBlob
            ? "bg-green-500/20 ring-4 ring-green-500/40"
            : "bg-secondary"
        )}>
          {isRecording ? (
            <Mic className="w-8 h-8 text-red-500" />
          ) : audioBlob ? (
            <Check className="w-8 h-8 text-green-500" />
          ) : (
            <MicOff className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Duration display */}
        <div className="text-2xl font-mono text-foreground">
          {formatDuration(duration)}
          {maxDuration && (
            <span className="text-sm text-muted-foreground ml-2">
              / {formatDuration(maxDuration)}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              size="lg"
              className="gap-2 bg-red-500 hover:bg-red-600"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? resumeRecording : pauseRecording}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="gap-2"
              >
                <Square className="w-5 h-5" />
                Stop
              </Button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleRecordingPlayback}
                className="gap-2"
              >
                {isPlayingRecording ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Play Recording
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={resetRecording}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {audioUrl && (
          <audio ref={recordingAudioRef} src={audioUrl} />
        )}

        {/* Recording status */}
        <p className="text-sm text-muted-foreground text-center">
          {isRecording 
            ? isPaused 
              ? "Recording paused" 
              : "Recording in progress..."
            : audioBlob
            ? "Recording complete! Play it back or re-record."
            : "Tap to start recording"}
        </p>
      </div>

      {/* Comparison mode (when both original and recording exist) */}
      {originalAudioUrl && audioBlob && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm font-medium text-foreground mb-3">Compare:</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOriginalPlayback}
              className="flex-1"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Original
            </Button>
            <span className="text-muted-foreground">vs</span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRecordingPlayback}
              className="flex-1"
            >
              <Mic className="w-4 h-4 mr-2" />
              Your Recording
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
