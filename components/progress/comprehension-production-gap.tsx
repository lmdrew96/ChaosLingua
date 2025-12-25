"use client"

import { Brain, MessageSquare, ArrowRight } from "lucide-react"

interface GapData {
  comprehension: number
  production: number
}

interface ComprehensionProductionGapProps {
  data: GapData
}

export function ComprehensionProductionGap({ data }: ComprehensionProductionGapProps) {
  const gap = data.comprehension - data.production
  const gapPercentage = Math.round((gap / data.comprehension) * 100)

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="font-semibold text-foreground mb-4">Comprehension vs Production</h3>

      <div className="space-y-6">
        {/* Visual comparison */}
        <div className="flex items-center gap-4">
          {/* Comprehension */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-fog" />
              <span className="text-sm font-medium text-foreground">Understand</span>
            </div>
            <div className="h-4 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-fog rounded-full transition-all" style={{ width: `${data.comprehension}%` }} />
            </div>
            <p className="text-2xl font-bold text-foreground">{data.comprehension}%</p>
          </div>

          <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />

          {/* Production */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-forge" />
              <span className="text-sm font-medium text-foreground">Produce</span>
            </div>
            <div className="h-4 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-forge rounded-full transition-all" style={{ width: `${data.production}%` }} />
            </div>
            <p className="text-2xl font-bold text-foreground">{data.production}%</p>
          </div>
        </div>

        {/* Gap analysis */}
        <div className="p-4 rounded-lg bg-secondary/30">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-primary">{gapPercentage}% gap</span> between what you understand and
            what you can produce.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {gap > 30
              ? "This is normal! More Forge practice will help close this gap over time."
              : gap > 15
                ? "You're making good progress bridging comprehension to production."
                : "Excellent! Your production skills are keeping pace with comprehension."}
          </p>
        </div>
      </div>
    </div>
  )
}
