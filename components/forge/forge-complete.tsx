"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Flame, Award, Flower2, TrendingUp, Home, RotateCcw } from "lucide-react"
import type { ForgeType } from "@/lib/types"

interface ForgeCompleteProps {
  mode: ForgeType
  stats: {
    wordsProduced: number
    errorsIdentified: number
    selfCorrections: number
    duration: number
  }
  onNewSession: () => void
  onGoHome: () => void
}

const modeLabels: Record<ForgeType, string> = {
  quick_fire: "Quick Fire",
  shadow_speak: "Shadow Speak",
  writing_sprint: "Writing Sprint",
  translation: "Translation Practice",
  conversation: "Conversation Sim",
}

export function ForgeComplete({ mode, stats, onNewSession, onGoHome }: ForgeCompleteProps) {
  const achievements: { icon: React.ReactNode; label: string; value: string | number }[] = [
    {
      icon: <Flame className="w-5 h-5 text-forge" />,
      label: "Words Forged",
      value: stats.wordsProduced,
    },
    {
      icon: <Flower2 className="w-5 h-5 text-error-garden" />,
      label: "Errors Found",
      value: stats.errorsIdentified,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-chaos" />,
      label: "Self-Corrections",
      value: stats.selfCorrections,
    },
  ]

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-4 rounded-full bg-forge/20">
          <Award className="w-12 h-12 text-forge" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Forge Session Complete!</h2>
        <p className="text-muted-foreground">
          {modeLabels[mode]} - {stats.duration} minutes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {achievements.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="flex justify-center mb-2">{item.icon}</div>
            <span className="text-2xl font-bold text-foreground">{item.value}</span>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="p-4 rounded-xl bg-forge/10 border border-forge/20">
        <p className="text-sm text-foreground text-center">
          {stats.wordsProduced >= 50 ? (
            <>Great output! Every word you produce strengthens your ability to think in the language.</>
          ) : stats.wordsProduced >= 20 ? (
            <>Solid practice! The more you produce, the more natural it becomes.</>
          ) : (
            <>Every word counts! Production practice builds fluency over time.</>
          )}
        </p>
      </div>

      {/* Insight */}
      {stats.errorsIdentified > 0 && (
        <div className="p-4 rounded-xl bg-error-garden/10 border border-error-garden/20 flex items-start gap-3">
          <Flower2 className="w-5 h-5 text-error-garden mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {stats.errorsIdentified} error{stats.errorsIdentified !== 1 ? "s" : ""} added to your garden
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Self-identified errors are especially valuable for growth
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90" onClick={onNewSession}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Philosophy */}
      <p className="text-sm text-muted-foreground text-center italic">
        &ldquo;Turn passive knowledge into active skills. The forge transforms understanding into ability.&rdquo;
      </p>
    </div>
  )
}
