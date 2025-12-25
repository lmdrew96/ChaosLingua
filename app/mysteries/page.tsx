"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { MysteryShelf } from "@/components/fog/mystery-shelf"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile } from "@/lib/hooks/use-user-data"
import { useMysteries } from "@/lib/hooks/use-mysteries"
import { Sparkles, ArrowLeft, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language } from "@/lib/types"
import { cn } from "@/lib/utils"

function MysteriesContent() {
  const router = useRouter()
  const { profile } = useUserProfile()
  const currentLanguage: Language = profile?.primaryLanguage || "ro"
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("all")

  const { mysteries, isLoading, resolveMystery, mutate } = useMysteries({
    language: currentLanguage,
    resolved: filter === "all" ? undefined : filter === "resolved",
  })

  const handleLanguageChange = async (language: Language) => {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
  }

  const handleResolve = async (id: string, meaning: string) => {
    await resolveMystery(id, meaning)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/mysteries/${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />

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
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <MysteryShelf mysteries={mysteries} onResolve={handleResolve} onDelete={handleDelete} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function MysteriesPage() {
  return (
    <AuthGuard>
      <MysteriesContent />
    </AuthGuard>
  )
}
