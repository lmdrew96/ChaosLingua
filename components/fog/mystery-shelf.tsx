"use client"

import { cn } from "@/lib/utils"
import { Sparkles, Check, HelpCircle, Lightbulb, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MysteryItem } from "@/lib/types"

interface MysteryShelfProps {
  mysteries: MysteryItem[]
  onResolve: (id: string, meaning: string) => void
  onDelete: (id: string) => void
}

export function MysteryShelf({ mysteries, onResolve, onDelete }: MysteryShelfProps) {
  const unresolvedCount = mysteries.filter((m) => !m.resolved).length
  const resolvedCount = mysteries.filter((m) => m.resolved).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-reflect mb-2">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Unresolved</span>
          </div>
          <span className="text-3xl font-bold text-foreground">{unresolvedCount}</span>
          <p className="text-xs text-muted-foreground mt-1">Waiting for clarity</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Resolved</span>
          </div>
          <span className="text-3xl font-bold text-foreground">{resolvedCount}</span>
          <p className="text-xs text-muted-foreground mt-1">Mysteries solved</p>
        </div>
      </div>

      {/* Mystery list */}
      <div className="space-y-3">
        {mysteries.length > 0 ? (
          mysteries.map((mystery) => (
            <div
              key={mystery.id}
              className={cn(
                "p-4 rounded-xl border transition-all",
                mystery.resolved
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-card border-border hover:border-reflect/50",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    {mystery.resolved ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-reflect" />
                    )}
                    <span className="text-lg font-semibold text-foreground">{mystery.phrase}</span>
                    <span className="text-sm">{mystery.language === "ro" ? "🇷🇴" : "🇰🇷"}</span>
                  </div>

                  {mystery.context && (
                    <p className="text-sm text-muted-foreground italic ml-8">&ldquo;{mystery.context}&rdquo;</p>
                  )}

                  {mystery.resolved && mystery.resolvedMeaning && (
                    <div className="ml-8 p-3 rounded-lg bg-green-500/10 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-green-400 mt-0.5" />
                      <p className="text-sm text-foreground">{mystery.resolvedMeaning}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 ml-8 text-xs text-muted-foreground">
                    <span>Encountered {mystery.encounters}x</span>
                    <span>Added {new Date(mystery.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!mystery.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-reflect/30 text-reflect hover:bg-reflect/10"
                      onClick={() => {
                        const meaning = prompt("What does this mean?")
                        if (meaning) onResolve(mystery.id, meaning)
                      }}
                    >
                      I figured it out!
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(mystery.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your shelf is empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Collect confusing phrases during Fog sessions. Some will resolve through exposure, others invite deeper
              exploration.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
