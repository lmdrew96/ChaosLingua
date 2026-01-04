/**
 * Audio Processor
 * 
 * Responsible for audio-to-text conversion and pronunciation scoring:
 * - Speech-to-text transcription (AssemblyAI)
 * - Pronunciation analysis and scoring
 * - Phoneme-level error detection
 * - Audio quality validation
 */

import type {
  Language,
  PronunciationError,
} from "@/lib/types"

export interface AudioProcessingInput {
  audioUrl: string // URL to audio file
  expectedText?: string // For shadow-speak mode
  language: Language
}

export interface AudioProcessingOutput {
  transcript: string
  confidence: number // 0-1
  pronunciationScore: number // 0-100
  pronunciationErrors: PronunciationError[]
  audioQuality: "good" | "fair" | "poor"
}

// AssemblyAI API configuration
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const ASSEMBLYAI_API_URL = "https://api.assemblyai.com/v2"

/**
 * Process audio for transcription and pronunciation scoring
 */
export async function processAudio(
  input: AudioProcessingInput
): Promise<AudioProcessingOutput> {
  const { audioUrl, expectedText, language } = input

  // 1. Upload audio to AssemblyAI
  const uploadUrl = await uploadAudio(audioUrl)

  // 2. Request transcription with pronunciation assessment
  const transcriptId = await requestTranscription(uploadUrl, language)

  // 3. Poll for results
  const result = await pollTranscriptionResult(transcriptId)

  // 4. Extract pronunciation errors
  const pronunciationErrors = extractPronunciationErrors(
    result,
    expectedText,
    language
  )

  // 5. Calculate pronunciation score
  const pronunciationScore = calculatePronunciationScore(
    result,
    pronunciationErrors
  )

  // 6. Assess audio quality
  const audioQuality = assessAudioQuality(result)

  return {
    transcript: result.text,
    confidence: result.confidence,
    pronunciationScore,
    pronunciationErrors,
    audioQuality,
  }
}

/**
 * Upload audio file to AssemblyAI
 */
async function uploadAudio(audioUrl: string): Promise<string> {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY is not configured")
  }

  // If it's already a public URL, return it
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    return audioUrl
  }

  // Otherwise, upload the local file
  // (This assumes audioUrl is a path to a local file or data URL)
  const response = await fetch(`${ASSEMBLYAI_API_URL}/upload`, {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      "content-type": "application/octet-stream",
    },
    body: await fetchAudioData(audioUrl),
  })

  if (!response.ok) {
    throw new Error(`Failed to upload audio: ${response.statusText}`)
  }

  const data = await response.json()
  return data.upload_url
}

/**
 * Fetch audio data from URL or data URI
 */
async function fetchAudioData(audioUrl: string): Promise<ArrayBuffer> {
  // Handle data URLs
  if (audioUrl.startsWith("data:")) {
    const base64 = audioUrl.split(",")[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Handle file URLs or fetch from server
  const response = await fetch(audioUrl)
  return response.arrayBuffer()
}

/**
 * Request transcription from AssemblyAI
 */
async function requestTranscription(
  audioUrl: string,
  language: Language
): Promise<string> {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY is not configured")
  }

  // Map our language codes to AssemblyAI language codes
  const languageCode = mapLanguageToAssemblyAI(language)

  const response = await fetch(`${ASSEMBLYAI_API_URL}/transcript`, {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_code: languageCode,
      // Enable additional features
      punctuate: true,
      format_text: true,
      // Request word-level timestamps for pronunciation analysis
      word_boost: [],
      boost_param: "default",
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to request transcription: ${response.statusText}`)
  }

  const data = await response.json()
  return data.id
}

/**
 * Map our language codes to AssemblyAI language codes
 */
function mapLanguageToAssemblyAI(language: Language): string {
  const mapping: Record<Language, string> = {
    ko: "ko",
    ro: "ro",
  }
  return mapping[language] || "en"
}

/**
 * Poll for transcription result
 */
async function pollTranscriptionResult(
  transcriptId: string,
  maxAttempts = 60,
  intervalMs = 1000
): Promise<AssemblyAITranscript> {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY is not configured")
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(
      `${ASSEMBLYAI_API_URL}/transcript/${transcriptId}`,
      {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get transcription: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status === "completed") {
      return data
    }

    if (data.status === "error") {
      throw new Error(`Transcription failed: ${data.error}`)
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error("Transcription timeout")
}

/**
 * Extract pronunciation errors from transcription
 */
function extractPronunciationErrors(
  transcript: AssemblyAITranscript,
  expectedText: string | undefined,
  language: Language
): PronunciationError[] {
  const errors: PronunciationError[] = []

  // If we have expected text, compare word by word
  if (expectedText && transcript.words) {
    const expectedWords = normalizeText(expectedText, language).split(/\s+/)
    const transcribedWords = transcript.words.map((w) =>
      normalizeText(w.text, language)
    )

    // Find mismatches
    for (let i = 0; i < Math.min(expectedWords.length, transcribedWords.length); i++) {
      const expected = expectedWords[i]
      const transcribed = transcribedWords[i]

      if (expected !== transcribed) {
        // Check word confidence
        const wordData = transcript.words[i]
        const confidence = wordData.confidence

        errors.push({
          phoneme: expected,
          word: transcribed,
          confidence,
        })
      }
    }
  }

  return errors
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string, language: Language): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, "") // Remove punctuation
    .trim()
}

/**
 * Calculate pronunciation score
 */
function calculatePronunciationScore(
  transcript: AssemblyAITranscript,
  errors: PronunciationError[]
): number {
  // Base score on transcript confidence
  const baseScore = transcript.confidence * 100

  // Penalize for pronunciation errors (based on confidence scores)
  const errorPenalty = errors.reduce((sum, error) => {
    const confidencePenalty = error.confidence > 0.7 ? 5 : error.confidence > 0.5 ? 10 : 15
    return sum + confidencePenalty
  }, 0)

  const score = Math.max(0, baseScore - errorPenalty)
  return Math.round(score)
}

/**
 * Assess audio quality from transcription metadata
 */
function assessAudioQuality(
  transcript: AssemblyAITranscript
): "good" | "fair" | "poor" {
  const confidence = transcript.confidence

  if (confidence >= 0.85) return "good"
  if (confidence >= 0.65) return "fair"
  return "poor"
}

// AssemblyAI transcript types
interface AssemblyAITranscript {
  id: string
  status: "queued" | "processing" | "completed" | "error"
  text: string
  confidence: number
  words?: Array<{
    text: string
    start: number
    end: number
    confidence: number
  }>
  error?: string
}
