"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export interface UseVoiceRecorderOptions {
  maxDuration?: number // in seconds
  onRecordingComplete?: (blob: Blob, duration: number) => void
  onError?: (error: string) => void
}

export interface UseVoiceRecorderReturn {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  resetRecording: () => void
  isSupported: boolean
  error: string | null
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const { maxDuration = 300, onRecordingComplete, onError } = options
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false)
      setError("Voice recording is not supported in this browser")
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      chunksRef.current = []
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream

      // Determine best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        
        onRecordingComplete?.(blob, duration)
      }

      mediaRecorder.onerror = () => {
        const errorMsg = "Recording error occurred"
        setError(errorMsg)
        onError?.(errorMsg)
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      startTimeRef.current = Date.now()
      pausedDurationRef.current = 0

      // Start duration timer
      timerRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000)
          setDuration(elapsed)
          
          // Auto-stop at max duration
          if (elapsed >= maxDuration) {
            stopRecording()
          }
        }
      }, 100)

    } catch (err) {
      const errorMsg = err instanceof Error 
        ? err.message.includes("Permission denied") 
          ? "Microphone access denied. Please allow microphone access."
          : err.message
        : "Failed to start recording"
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [maxDuration, onRecordingComplete, onError, isPaused, duration])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      pausedDurationRef.current = Date.now()
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      pausedDurationRef.current = Date.now() - pausedDurationRef.current
      setIsPaused(false)
    }
  }, [isRecording, isPaused])

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setError(null)
    chunksRef.current = []
  }, [audioUrl])

  return {
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
  }
}

// Format seconds to mm:ss
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
