"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Zap, Volume2, Pencil, Languages, MessageCircle } from "lucide-react"
import type { ForgeType } from "@/lib/types"

interface ForgeModeProps {
  selectedMode: ForgeType | null
  onModeSelect: (mode: ForgeType) => void
}

const forgeModes: { type: ForgeType; icon: React.ReactNode; title: string; description: string; duration: string }[] = [
  {
    type: "quick_fire",
    icon: <Zap className="w-6 h-6" />,
    title: "Quick Fire",
    description: "Rapid-fire prompts. Short responses, no overthinking.",
    duration: "5-10 min",
  },
  {
    type: "shadow_speak",
    icon: <Volume2 className="w-6 h-6" />,
    title: "Shadow Speak",
    description: "Listen, pause, repeat. Practice rhythm and intonation.",
    duration: "10-15 min",
  },
  {
    type: "writing_sprint",
    icon: <Pencil className="w-6 h-6" />,
    title: "Writing Sprint",
    description: "Timed free-writing. Get words on the page, refine later.",
    duration: "5-15 min",
  },
  {
    type: "translation",
    icon: <Languages className="w-6 h-6" />,
    title: "Translation Practice",
    description: "English to target language. Compare with native versions.",
    duration: "10-15 min",
  },
  {
    type: "conversation",
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Conversation Sim",
    description: "Branching dialogue scenarios. Practice real exchanges.",
    duration: "10-20 min",
  },
]

export function ForgeModeSelector({ selectedMode, onModeSelect }: ForgeModeProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Choose Your Forge Mode</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forgeModes.map((mode) => (
          <button
            key={mode.type}
            onClick={() => onModeSelect(mode.type)}
            className={cn(
              "group p-5 rounded-xl border text-left transition-all",
              selectedMode === mode.type
                ? "bg-forge/10 border-forge ring-2 ring-forge/30"
                : "bg-card border-border hover:border-forge/50",
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-lg transition-colors",
                  selectedMode === mode.type
                    ? "bg-forge text-forge-foreground"
                    : "bg-secondary text-muted-foreground group-hover:bg-forge/20 group-hover:text-forge",
                )}
              >
                {mode.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{mode.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                <span className="inline-block mt-2 text-xs text-forge">{mode.duration}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
