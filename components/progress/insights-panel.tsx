"use client"

import { Lightbulb, Target, TrendingUp, Clock, MessageSquare } from "lucide-react"
import type { Language } from "@/lib/types"

interface InsightsPanelProps {
  language: Language
}

export function InsightsPanel({ language }: InsightsPanelProps) {
  // In a real app, these would be AI-generated based on user data
  const insights = [
    {
      icon: <Target className="w-5 h-5 text-error-garden" />,
      title: "Error Pattern",
      content:
        language === "ro"
          ? "Your errors cluster around verb conjugation. Consider more Forge practice with verbs."
          : "Your errors cluster around particles (이/가, 을/를). Extra attention needed here.",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-chaos" />,
      title: "Engagement Pattern",
      content: "You engage most with music and entertainment content. Keep following your interests!",
    },
    {
      icon: <Clock className="w-5 h-5 text-fog" />,
      title: "Fog Success",
      content: "Fog sessions on cultural topics seem to click for you. Your comprehension is improving.",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-forge" />,
      title: "Production Gap",
      content: "You understand more vocabulary than you can produce. More Forge time will help close this gap.",
    },
  ]

  return (
    <div className="p-6 rounded-xl bg-card border border-border space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
            <div className="mt-0.5">{insight.icon}</div>
            <div>
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{insight.content}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Insights generated from your learning patterns across all session types
      </p>
    </div>
  )
}
