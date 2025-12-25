"use client"

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Cloud, Eye, EyeOff, Sparkles } from "lucide-react"

interface FogSettingsProps {
  fogLevel: number
  onFogLevelChange: (level: number) => void
  delayedLookup: boolean
  onDelayedLookupChange: (enabled: boolean) => void
}

export function FogSettings({ fogLevel, onFogLevelChange, delayedLookup, onDelayedLookupChange }: FogSettingsProps) {
  const getFogDescription = (level: number) => {
    if (level <= 30) return "Light fog - mostly comfortable content"
    if (level <= 50) return "Moderate fog - some challenge, 70-80% comprehension"
    if (level <= 70) return "Dense fog - pushing your limits, 50-70% comprehension"
    return "Deep fog - embrace the confusion, < 50% comprehension"
  }

  return (
    <div className="space-y-6 p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <Cloud className="w-6 h-6 text-fog" />
        <div>
          <h3 className="font-semibold text-foreground">Fog Settings</h3>
          <p className="text-sm text-muted-foreground">Calibrate your immersion experience</p>
        </div>
      </div>

      {/* Fog Level Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Fog Density</label>
          <span className="text-sm font-mono text-fog">{fogLevel}%</span>
        </div>

        <Slider
          value={[fogLevel]}
          onValueChange={([value]) => onFogLevelChange(value)}
          min={0}
          max={100}
          step={10}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Clear</span>
          <span>Dense</span>
        </div>

        <p className="text-sm text-muted-foreground p-3 rounded-lg bg-fog/10 border border-fog/20">
          <Sparkles className="w-4 h-4 inline mr-2 text-fog" />
          {getFogDescription(fogLevel)}
        </p>
      </div>

      {/* Delayed Lookup Toggle */}
      <div className="pt-4 border-t border-border/50">
        <button
          onClick={() => onDelayedLookupChange(!delayedLookup)}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
            delayedLookup ? "bg-fog/10 border-fog/30" : "bg-secondary/30 border-border",
          )}
        >
          <div className="flex items-center gap-3">
            {delayedLookup ? (
              <EyeOff className="w-5 h-5 text-fog" />
            ) : (
              <Eye className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="text-left">
              <p className="font-medium text-foreground">Delayed Lookup</p>
              <p className="text-sm text-muted-foreground">
                {delayedLookup ? "Definitions unlock after 3 encounters" : "Immediate access to definitions"}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "w-10 h-6 rounded-full transition-colors relative",
              delayedLookup ? "bg-fog" : "bg-secondary",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                delayedLookup ? "translate-x-5" : "translate-x-1",
              )}
            />
          </div>
        </button>
      </div>
    </div>
  )
}
