"use client"

/**
 * Example: Forge Mode Page with Grading
 * 
 * Shows how to implement a Forge mode page with full grading integration
 * This is a template you can use for your actual page components
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ForgeWithGrading } from "@/components/forge/forge-with-grading"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Zap } from "lucide-react"
import type { Language, ForgeType } from "@/lib/types"

interface ForgeModePageProps {
  mode: ForgeType
  language: Language
  userId: string // Passed from parent page component with Stack auth
}

/**
 * Example page component for a Forge mode
 * 
 * Usage in a page.tsx:
 * import { useUser } from "@stackapp/user"
 * 
 * export default function WritingSprintPage() {
 *   const { user } = useUser()
 *   if (!user?.id) return <div>Loading...</div>
 *   return <ForgeModePageExample mode="writing_sprint" language="romanian" userId={user.id} />
 * }
 */
export function ForgeModePageExample({
  mode,
  language,
  userId,
}: ForgeModePageProps) {
  const router = useRouter()
  const [hasStarted, setHasStarted] = useState(false)

  // Show intro screen before starting
  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-forge" />
            <h1 className="text-4xl font-bold">
              {getModeTitle(mode)}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {getModeDescription(mode)}
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Complete the {getModeTitle(mode).toLowerCase()} exercise</li>
              <li>✓ Get AI feedback on your response</li>
              <li>✓ Learn from detailed corrections</li>
              <li>✓ Track your progress and proficiency</li>
            </ul>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">AI Grading Enabled</h4>
                <p className="text-sm text-muted-foreground">
                  Your responses will be evaluated by Claude AI with personalized feedback
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Start Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Button
            className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90"
            onClick={() => setHasStarted(true)}
          >
            Start {getModeTitle(mode)}
          </Button>
        </div>
      </div>
    )
  }

  // Show the actual Forge mode with grading
  return (
    <ForgeWithGrading
      mode={mode}
      language={language}
      userId={userId}
      onComplete={() => {
        // Handle completion
        router.push(`/forge?mode=${mode}&completed=true`)
      }}
      onExit={() => {
        // Handle exit
        setHasStarted(false)
      }}
    />
  )
}

/**
 * Helper functions
 */

function getModeTitle(mode: ForgeType): string {
  const titles: Record<ForgeType, string> = {
    quick_fire: "Quick Fire",
    shadow_speak: "Shadow Speak",
    writing_sprint: "Writing Sprint",
    translation: "Translation",
    conversation: "Conversation",
  }
  return titles[mode]
}

function getModeDescription(mode: ForgeType): string {
  const descriptions: Record<ForgeType, string> = {
    quick_fire:
      "Answer quick prompts rapidly to build fluency and spontaneous speech",
    shadow_speak:
      "Listen and repeat to improve pronunciation and listening comprehension",
    writing_sprint:
      "Write freely for 10 minutes to build writing confidence and vocabulary",
    translation:
      "Translate sentences to practice accuracy and language switching",
    conversation:
      "Engage in realistic dialogue scenarios with contextual responses",
  }
  return descriptions[mode]
}

/**
 * Usage in Next.js app router
 * 
 * app/forge/[mode]/page.tsx:
 * 
 * import { ForgeModePageExample } from "@/components/forge/example-page"
 * import type { Language, ForgeType } from "@/lib/types"
 * 
 * interface PageProps {
 *   params: {
 *     mode: ForgeType
 *   }
 *   searchParams: {
 *     language?: Language
 *   }
 * }
 * 
 * export default function Page({ params, searchParams }: PageProps) {
 *   const language = (searchParams.language as Language) || "romanian"
 *   
 *   return (
 *     <ForgeModePageExample
 *       mode={params.mode as ForgeType}
 *       language={language}
 *     />
 *   )
 * }
 */
