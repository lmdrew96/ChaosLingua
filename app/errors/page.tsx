"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { ErrorCard } from "@/components/errors/error-card"
import { ErrorReview } from "@/components/errors/error-review"
import { ErrorStats } from "@/components/errors/error-stats"
import { WeeklyReport } from "@/components/errors/weekly-report"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile } from "@/lib/hooks/use-user-data"
import { useErrors } from "@/lib/hooks/use-errors"
import { Flower2, Play, ArrowLeft, Filter, SortAsc } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, ErrorItem, ErrorType } from "@/lib/types"
import { cn } from "@/lib/utils"

type ViewMode = "browse" | "review"

const errorTypeFilters: { value: ErrorType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
  { value: "comprehension", label: "Comprehension" },
  { value: "production", label: "Production" },
  { value: "beautiful_failure", label: "Beautiful Failures" },
]

function ErrorGardenContent() {
  const router = useRouter()
  const { profile } = useUserProfile()
  const currentLanguage: Language = profile?.primaryLanguage || "ro"
  const [typeFilter, setTypeFilter] = useState<ErrorType | "all">("all")

  const { errors, isLoading } = useErrors({
    language: currentLanguage,
    type: typeFilter === "all" ? undefined : typeFilter,
  })

  const [viewMode, setViewMode] = useState<ViewMode>("browse")
  const [reviewQueue, setReviewQueue] = useState<ErrorItem[]>([])
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  const handleLanguageChange = async (language: Language) => {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
  }

  // Sort by priority (occurrences) and recency
  const sortedErrors = [...errors].sort((a, b) => {
    const aHighPriority = a.occurrences >= 3
    const bHighPriority = b.occurrences >= 3
    if (aHighPriority && !bHighPriority) return -1
    if (!aHighPriority && bHighPriority) return 1
    if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences
    return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  })

  const startReviewSession = () => {
    const queue = [...sortedErrors].slice(0, 10)
    setReviewQueue(queue)
    setCurrentReviewIndex(0)
    setViewMode("review")
  }

  const handleReviewError = (error: ErrorItem) => {
    setReviewQueue([error])
    setCurrentReviewIndex(0)
    setViewMode("review")
  }

  const handleCorrect = () => {
    moveToNextError()
  }

  const handleIncorrect = () => {
    moveToNextError()
  }

  const moveToNextError = () => {
    if (currentReviewIndex < reviewQueue.length - 1) {
      setCurrentReviewIndex((prev) => prev + 1)
    } else {
      setViewMode("browse")
      setReviewQueue([])
      setCurrentReviewIndex(0)
    }
  }

  const handleSkip = () => {
    moveToNextError()
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />

      <div className="flex">
        <AppNav />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                    <Flower2 className="w-8 h-8 text-error-garden" />
                    The Error Garden
                  </h1>
                  <p className="text-muted-foreground">Your mistakes become your curriculum</p>
                </div>
              </div>

              {viewMode === "browse" && (
                <Button
                  className="bg-error-garden text-error-garden-foreground hover:bg-error-garden/90"
                  onClick={startReviewSession}
                  disabled={sortedErrors.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Review
                </Button>
              )}

              {viewMode === "review" && (
                <Button variant="outline" className="bg-transparent" onClick={() => setViewMode("browse")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Garden
                </Button>
              )}
            </div>

            {/* Browse Mode */}
            {viewMode === "browse" && (
              <div className="space-y-8">
                {/* Stats */}
                {isLoading ? <Skeleton className="h-24 w-full" /> : <ErrorStats errors={sortedErrors} />}

                {/* Weekly Report */}
                <WeeklyReport errors={sortedErrors} previousWeekErrors={5} />

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filter:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {errorTypeFilters.map((filter) => (
                      <Button
                        key={filter.value}
                        variant="outline"
                        size="sm"
                        onClick={() => setTypeFilter(filter.value)}
                        className={cn(
                          "bg-transparent",
                          typeFilter === filter.value && "bg-error-garden/20 border-error-garden text-error-garden",
                        )}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
                    <SortAsc className="w-4 h-4" />
                    <span>Sorted by priority</span>
                  </div>
                </div>

                {/* Error Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : sortedErrors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedErrors.map((error) => (
                      <ErrorCard key={error.id} error={error} onReview={handleReviewError} showDetails />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Flower2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Your garden is empty!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Make some mistakes in Chaos sessions or Forge mode and they&apos;ll appear here for review.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Review Mode */}
            {viewMode === "review" && reviewQueue.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {currentReviewIndex + 1} of {reviewQueue.length}
                  </span>
                  <div className="flex gap-1">
                    {reviewQueue.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-8 h-1 rounded-full transition-colors",
                          idx < currentReviewIndex
                            ? "bg-chaos"
                            : idx === currentReviewIndex
                              ? "bg-error-garden"
                              : "bg-secondary",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <ErrorReview
                  error={reviewQueue[currentReviewIndex]}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  onSkip={handleSkip}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ErrorGardenPage() {
  return (
    <AuthGuard>
      <ErrorGardenContent />
    </AuthGuard>
  )
}
