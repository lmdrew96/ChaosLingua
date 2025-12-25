"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Settings, Shuffle, Compass, BookMarked } from "lucide-react"
import type { ChaosSetting } from "@/lib/types"

interface ChaosSettingsProps {
  chaosSetting: ChaosSetting
  onChaosSettingChange: (setting: ChaosSetting) => void
  duration: number
  onDurationChange: (duration: number) => void
  topics: string[]
  selectedTopics: string[]
  onTopicsChange: (topics: string[]) => void
}

const chaosOptions: { value: ChaosSetting; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "full-random",
    label: "Full Random",
    icon: <Shuffle className="w-5 h-5" />,
    description: "Complete chaos. Any content, any time.",
  },
  {
    value: "guided-random",
    label: "Guided Random",
    icon: <Compass className="w-5 h-5" />,
    description: "Random within your level and preferences.",
  },
  {
    value: "curated",
    label: "Curated",
    icon: <BookMarked className="w-5 h-5" />,
    description: "Hand-picked content for focused learning.",
  },
]

const availableTopics = [
  "daily-life",
  "culture",
  "news",
  "music",
  "entertainment",
  "food",
  "travel",
  "technology",
  "sports",
  "history",
]

export function ChaosSettings({
  chaosSetting,
  onChaosSettingChange,
  duration,
  onDurationChange,
  selectedTopics,
  onTopicsChange,
}: ChaosSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onTopicsChange(selectedTopics.filter((t) => t !== topic))
    } else {
      onTopicsChange([...selectedTopics, topic])
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-left">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-chaos" />
          <span className="font-semibold text-foreground">Chaos Settings</span>
        </div>
        <span className="text-sm text-muted-foreground">{isExpanded ? "Collapse" : "Expand"}</span>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Chaos Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Chaos Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {chaosOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChaosSettingChange(option.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-lg border transition-all",
                    chaosSetting === option.value
                      ? "border-chaos bg-chaos/10 text-foreground"
                      : "border-border hover:border-chaos/50 text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(chaosSetting === option.value ? "text-chaos" : "text-muted-foreground")}>
                      {option.icon}
                    </span>
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <span className="text-xs">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Session Duration</label>
              <span className="text-sm text-chaos font-mono">{duration} min</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([value]) => onDurationChange(value)}
              min={5}
              max={30}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Topic Filter (only for guided/curated) */}
          {chaosSetting !== "full-random" && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Topics (optional)</label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      "capitalize",
                      selectedTopics.includes(topic) && "bg-chaos/20 border-chaos text-chaos",
                    )}
                  >
                    {topic.replace("-", " ")}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedTopics.length === 0
                  ? "No filter - all topics included"
                  : `Filtering to: ${selectedTopics.join(", ")}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
