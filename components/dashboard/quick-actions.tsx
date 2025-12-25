"use client"

import { Button } from "@/components/ui/button"
import { Shuffle, Sparkles } from "lucide-react"

interface QuickActionsProps {
  onSurpriseMe: () => void
}

export function QuickActions({ onSurpriseMe }: QuickActionsProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold">Quick Start</span>
      </div>
      <p className="text-sm text-muted-foreground">Not sure where to begin? Let chaos guide you.</p>
      <Button onClick={onSurpriseMe} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        <Shuffle className="w-4 h-4 mr-2" />
        Surprise Me
      </Button>
    </div>
  )
}
