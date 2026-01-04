"use client"

/**
 * Unified Forge Mode Selector
 * 
 * Handles mode selection and grading integration
 * Simply use this instead of individual mode components
 */

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { QuickFireWithGrading } from "./quick-fire-with-grading"
import { ShadowSpeakWithGrading } from "./shadow-speak-with-grading"
import { WritingSprintWithGrading } from "./writing-sprint-with-grading"
import { TranslationWithGrading } from "./translation-with-grading"
import { ConversationWithGrading } from "./conversation-with-grading"
import type { Language, ForgeType } from "@/lib/types"

interface ForgeWithGradingProps {
  mode: ForgeType
  language: Language
  userId: string
  onComplete: () => void
  onExit: () => void
  // Optional: disable grading
  gradingEnabled?: boolean
}

export function ForgeWithGrading({
  mode,
  language,
  userId,
  onComplete,
  onExit,
  gradingEnabled = true,
}: ForgeWithGradingProps) {
  // Generate session ID
  const sessionId = `forge-${mode}-${Date.now()}`

  // Show error if userId is missing
  if (!userId) {
    return (
      <Card className="p-8 border-destructive bg-destructive/5">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-destructive mb-2">
              Authentication Required
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You must be signed in to use Forge modes.
            </p>
            <Button onClick={() => window.location.href = "/sign-in"}>
              Sign In
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // If grading is disabled, you could show the original mode
  // For now, all modes require authentication and grading

  // Render the appropriate mode with grading
  switch (mode) {
    case "quick_fire":
      return (
        <QuickFireWithGrading
          language={language}
          sessionId={sessionId}
          userId={userId}
          onComplete={onComplete}
          onExit={onExit}
        />
      )

    case "shadow_speak":
      return (
        <ShadowSpeakWithGrading
          language={language}
          sessionId={sessionId}
          userId={userId}
          onComplete={onComplete}
          onExit={onExit}
        />
      )

    case "writing_sprint":
      return (
        <WritingSprintWithGrading
          language={language}
          duration={300} // 5 minutes default
          sessionId={sessionId}
          userId={userId}
          onComplete={onComplete}
          onExit={onExit}
        />
      )

    case "translation":
      return (
        <TranslationWithGrading
          language={language}
          sessionId={sessionId}
          userId={userId}
          onComplete={onComplete}
          onExit={onExit}
        />
      )

    case "conversation":
      return (
        <ConversationWithGrading
          language={language}
          sessionId={sessionId}
          userId={userId}
          onComplete={onComplete}
          onExit={onExit}
        />
      )

    default:
      const _exhaustive: never = mode
      return _exhaustive
  }
}

/**
 * Create a session ID for tracking
 */
export function generateSessionId(mode: ForgeType): string {
  return `forge-${mode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
