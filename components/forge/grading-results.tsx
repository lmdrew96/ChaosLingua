"use client"

/**
 * Grading Results Component
 * 
 * Displays grading scores, corrections, and feedback
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Lightbulb } from "lucide-react"

interface GradingResultsProps {
  scores: {
    overall: number
    grammar: number
    vocabulary: number
    pronunciation: number
    fluency: number
    naturalness: number
  }
  corrections?: Array<{
    original?: string
    corrected?: string
    explanation?: string
    isRecurring?: boolean
    [key: string]: any
  }>
  feedback?: {
    summary?: string
    encouragement?: string
    suggestions?: string[]
  }
  transcript?: string
  audioQuality?: "good" | "fair" | "poor"
}

export function GradingResults({
  scores,
  corrections,
  feedback,
  transcript,
  audioQuality,
}: GradingResultsProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Score</span>
            <span className="text-3xl font-bold">{scores.overall}%</span>
          </CardTitle>
          {feedback?.summary && (
            <CardDescription>{feedback.summary}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ScoreBar label="Grammar" score={scores.grammar} />
            <ScoreBar label="Vocabulary" score={scores.vocabulary} />
            {scores.pronunciation > 0 && (
              <ScoreBar label="Pronunciation" score={scores.pronunciation} />
            )}
            <ScoreBar label="Fluency" score={scores.fluency} />
            <ScoreBar label="Naturalness" score={scores.naturalness} />
          </div>
        </CardContent>
      </Card>

      {/* Transcript (if audio input) */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Transcript
              {audioQuality && (
                <AudioQualityBadge quality={audioQuality} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg italic">&ldquo;{transcript}&rdquo;</p>
          </CardContent>
        </Card>
      )}

      {/* Corrections */}
      {corrections && corrections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Corrections</CardTitle>
            <CardDescription>
              {corrections.length} {corrections.length === 1 ? "issue" : "issues"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {corrections.map((correction, index) => (
                <CorrectionCard key={index} correction={correction} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback & Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Tips for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedback?.encouragement && (
              <p className="text-lg font-medium">{feedback.encouragement}</p>
            )}
            {feedback?.suggestions && feedback.suggestions.length > 0 && (
              <ul className="space-y-2">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{score}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function CorrectionCard({
  correction,
}: {
  correction?: Record<string, any>
}) {
  if (!correction) return null

  const correctionType = correction.type || "grammar"
  const incorrect = correction.incorrect || correction.original || ""
  const correct = correction.correct || correction.corrected || ""
  const explanation = correction.explanation || ""
  const isRecurring = correction.isRecurring || false

  return (
    <div className="border border-red-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{correctionType}</Badge>
            {isRecurring && (
              <Badge variant="destructive">Recurring</Badge>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="line-through text-muted-foreground">
                {incorrect}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium">{correct}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  )
}

function AudioQualityBadge({ quality }: { quality: "good" | "fair" | "poor" }) {
  const config = {
    good: { label: "Good Quality", variant: "default" as const, icon: CheckCircle2 },
    fair: { label: "Fair Quality", variant: "secondary" as const, icon: AlertCircle },
    poor: { label: "Poor Quality", variant: "destructive" as const, icon: XCircle },
  }

  const { label, variant, icon: Icon } = config[quality]

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
