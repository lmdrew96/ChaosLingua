"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Sparkles, 
  AlertCircle, 
  Lightbulb, 
  CheckCircle2, 
  ChevronRight,
  Flower2,
  Brain
} from "lucide-react"

interface ErrorEntry {
  id: string
  errorText: string
  correctionText: string
  category: "grammar" | "vocabulary" | "spelling" | "word_order" | "other"
  isBeautifulFailure: boolean
  explanation?: string
}

interface ForgeSelfReviewProps {
  userOutput: string
  language: "ro" | "ko"
  onComplete: (errors: ErrorEntry[]) => void
  onSkip: () => void
  aiSuggestions?: {
    potentialErrors: string[]
    overallFeedback: string
  }
}

const categoryLabels = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  spelling: "Spelling",
  word_order: "Word Order",
  other: "Other",
}

const categoryIcons = {
  grammar: "📚",
  vocabulary: "📝",
  spelling: "✏️",
  word_order: "🔄",
  other: "❓",
}

export function ForgeSelfReview({
  userOutput,
  language,
  onComplete,
  onSkip,
  aiSuggestions,
}: ForgeSelfReviewProps) {
  const [step, setStep] = useState<"reflect" | "identify" | "categorize" | "review">("reflect")
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [currentError, setCurrentError] = useState({
    errorText: "",
    correctionText: "",
    category: "grammar" as ErrorEntry["category"],
    isBeautifulFailure: false,
    explanation: "",
  })

  const addError = () => {
    if (!currentError.errorText.trim()) return
    
    setErrors([
      ...errors,
      {
        id: Date.now().toString(),
        ...currentError,
      },
    ])
    setCurrentError({
      errorText: "",
      correctionText: "",
      category: "grammar",
      isBeautifulFailure: false,
      explanation: "",
    })
  }

  const removeError = (id: string) => {
    setErrors(errors.filter((e) => e.id !== id))
  }

  const toggleBeautifulFailure = (id: string) => {
    setErrors(
      errors.map((e) =>
        e.id === id ? { ...e, isBeautifulFailure: !e.isBeautifulFailure } : e
      )
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        {["Reflect", "Identify", "Review"].map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full ${
                (step === "reflect" && idx === 0) ||
                (step === "identify" && idx === 1) ||
                ((step === "categorize" || step === "review") && idx === 2)
                  ? "bg-forge text-forge-foreground"
                  : "bg-muted"
              }`}
            >
              {s}
            </span>
            {idx < 2 && <ChevronRight className="w-4 h-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Reflect */}
      {step === "reflect" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Brain className="w-12 h-12 mx-auto text-forge" />
            <h2 className="text-xl font-bold">Before You See Corrections...</h2>
            <p className="text-muted-foreground">
              Take a moment to review what you wrote. What do you think might be wrong?
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Your Output
            </p>
            <p className="text-foreground whitespace-pre-wrap">{userOutput}</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Self-Review Power</p>
                <p className="text-xs text-muted-foreground">
                  Trying to spot your own errors before seeing corrections strengthens your 
                  error-detection skills and leads to deeper learning.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onSkip} className="flex-1 bg-transparent">
              Skip Review
            </Button>
            <Button
              className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90"
              onClick={() => setStep("identify")}
            >
              I&apos;m Ready to Identify Errors
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Identify Errors */}
      {step === "identify" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <AlertCircle className="w-12 h-12 mx-auto text-error-garden" />
            <h2 className="text-xl font-bold">Identify Your Errors</h2>
            <p className="text-muted-foreground">
              What mistakes did you notice? Don&apos;t worry about being perfect!
            </p>
          </div>

          {/* AI Hints (if available) */}
          {aiSuggestions && aiSuggestions.potentialErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">AI Hints</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {aiSuggestions.potentialErrors.slice(0, 3).map((hint, idx) => (
                      <li key={idx}>• {hint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Current Output Reference */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm">
            <p className="whitespace-pre-wrap">{userOutput}</p>
          </div>

          {/* Error Entry Form */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What you wrote (the error)</label>
              <Textarea
                placeholder="Type or paste the part you think is wrong..."
                value={currentError.errorText}
                onChange={(e) =>
                  setCurrentError({ ...currentError, errorText: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your correction (if you know it)</label>
              <Textarea
                placeholder="What do you think it should be? Leave blank if unsure."
                value={currentError.correctionText}
                onChange={(e) =>
                  setCurrentError({ ...currentError, correctionText: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setCurrentError({
                        ...currentError,
                        category: key as ErrorEntry["category"],
                      })
                    }
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                      currentError.category === key
                        ? "bg-forge text-forge-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <span>{categoryIcons[key as keyof typeof categoryIcons]}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Beautiful Failure Toggle */}
            <button
              onClick={() =>
                setCurrentError({
                  ...currentError,
                  isBeautifulFailure: !currentError.isBeautifulFailure,
                })
              }
              className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                currentError.isBeautifulFailure
                  ? "bg-purple-500/10 border-purple-500/20"
                  : "bg-transparent border-border hover:bg-muted/50"
              }`}
            >
              <Sparkles
                className={`w-5 h-5 ${
                  currentError.isBeautifulFailure ? "text-purple-500" : "text-muted-foreground"
                }`}
              />
              <div className="text-left flex-1">
                <p className="text-sm font-medium">Beautiful Failure</p>
                <p className="text-xs text-muted-foreground">
                  A creative or logical attempt that shows understanding, even if incorrect
                </p>
              </div>
            </button>

            <Button
              onClick={addError}
              disabled={!currentError.errorText.trim()}
              className="w-full bg-error-garden text-error-garden-foreground hover:bg-error-garden/90"
            >
              <Flower2 className="w-4 h-4 mr-2" />
              Add to Error Garden
            </Button>
          </div>

          {/* Errors List */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Errors Found ({errors.length})
              </p>
              {errors.map((error) => (
                <div
                  key={error.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    error.isBeautifulFailure
                      ? "bg-purple-500/10 border-purple-500/20"
                      : "bg-muted border-border"
                  }`}
                >
                  <span>{categoryIcons[error.category]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="line-through text-muted-foreground">
                        {error.errorText}
                      </span>
                      {error.correctionText && (
                        <>
                          {" → "}
                          <span className="text-green-500">{error.correctionText}</span>
                        </>
                      )}
                    </p>
                    {error.isBeautifulFailure && (
                      <span className="text-xs text-purple-500 flex items-center gap-1 mt-1">
                        <Sparkles className="w-3 h-3" /> Beautiful Failure
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeError(error.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("reflect")} className="bg-transparent">
              Back
            </Button>
            <Button
              className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90"
              onClick={() => setStep("review")}
            >
              {errors.length === 0 ? "No Errors Found" : `Review ${errors.length} Error${errors.length !== 1 ? "s" : ""}`}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
            <h2 className="text-xl font-bold">Review Complete!</h2>
            <p className="text-muted-foreground">
              {errors.length === 0
                ? "You didn't find any errors. Let's see how you did!"
                : `You identified ${errors.length} error${errors.length !== 1 ? "s" : ""}.`}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <span className="text-2xl font-bold text-foreground">{errors.length}</span>
              <p className="text-xs text-muted-foreground mt-1">Errors Found</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <span className="text-2xl font-bold text-purple-500">
                {errors.filter((e) => e.isBeautifulFailure).length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Beautiful Failures</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <span className="text-2xl font-bold text-green-500">
                {errors.filter((e) => e.correctionText).length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Self-Corrected</p>
            </div>
          </div>

          {/* Error List */}
          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-error-garden/10 border border-error-garden/20 space-y-3">
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-error-garden" />
                <p className="font-medium">Your Error Garden Additions</p>
              </div>
              {errors.map((error) => (
                <div
                  key={error.id}
                  className="p-2 rounded-lg bg-background/50 text-sm flex items-center gap-3"
                >
                  <span>{categoryIcons[error.category]}</span>
                  <div className="flex-1">
                    <span className="line-through text-muted-foreground">{error.errorText}</span>
                    {error.correctionText && (
                      <>
                        {" → "}
                        <span className="text-green-500">{error.correctionText}</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => toggleBeautifulFailure(error.id)}
                    className={`p-1 rounded ${
                      error.isBeautifulFailure ? "text-purple-500" : "text-muted-foreground"
                    }`}
                    title={error.isBeautifulFailure ? "Beautiful failure" : "Mark as beautiful failure"}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Encouragement */}
          <div className="p-4 rounded-xl bg-forge/10 border border-forge/20">
            <p className="text-sm text-center text-foreground">
              {errors.length === 0
                ? "Confidence is key! Let's see if you were right."
                : errors.filter((e) => e.isBeautifulFailure).length > 0
                ? "Beautiful failures show creative thinking. They're the best kind of errors!"
                : "Finding your own errors is powerful. Each one you catch is growth."}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("identify")} className="bg-transparent">
              Add More
            </Button>
            <Button
              className="flex-1 bg-forge text-forge-foreground hover:bg-forge/90"
              onClick={() => onComplete(errors)}
            >
              Complete Review
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
