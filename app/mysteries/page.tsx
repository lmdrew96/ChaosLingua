"use client"

import { useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { MysteryShelf } from "@/components/fog/mystery-shelf"
import { Button } from "@/components/ui/button"
import { mockMysteries, mockUser } from "@/lib/mock-data"
import { Sparkles, ArrowLeft, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, MysteryItem } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function MysteriesPage() {
  const router = useRouter()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(mockUser.primaryLanguage)
  const [mysteries, setMysteries] = useState<MysteryItem[]>(mockMysteries)
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("all")

  const filteredMysteries = mysteries.filter((m) => {
    if (m.language !== currentLanguage) return false
    if (filter === "unresolved") return !m.resolved
    if (filter === "resolved") return m.resolved
    return true
  })

  const handleResolve = (id: string, meaning: string) => {
    setMysteries((prev) => prev.map((m) => (m.id === id ? { ...m, resolved: true, resolvedMeaning: meaning } : m)))
  }

  const handleDelete = (id: string) => {
    setMysteries((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />

      <div className="flex">
        <AppNav />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-reflect" />
                    Mystery Shelf
                  </h1>
                  <p className="text-muted-foreground">Collected unknowns waiting for clarity</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2">
                {(["all", "unresolved", "resolved"] as const).map((f) => (
                  <Button
                    key={f}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "capitalize bg-transparent",
                      filter === f && "bg-reflect/20 border-reflect text-reflect",
                    )}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mystery Shelf */}
            <MysteryShelf mysteries={filteredMysteries} onResolve={handleResolve} onDelete={handleDelete} />
          </div>
        </main>
      </div>
    </div>
  )
}
