"use client"

import { useState, useMemo } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { ContentViewer } from "@/components/chaos/content-viewer"
import { SessionComplete } from "@/components/chaos/session-complete"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile } from "@/lib/hooks/use-user-data"
import { useContent } from "@/lib/hooks/use-content"
import { BookOpen, Play, ArrowLeft, ArrowRight, Check, Brain, Shuffle, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Language, ContentItem, SessionMood } from "@/lib/types"
import { cn } from "@/lib/utils"

type SpiralPhase = "setup" | "focus" | "wild" | "reflect" | "complete"

interface GrammarPoint {
  id: string
  name: string
  description: string
  examples: string[]
}

const grammarPoints: Record<Language, GrammarPoint[]> = {
  ro: [
    {
      id: "definite-article",
      name: "Definite Article Suffix",
      description: "In Romanian, the definite article is attached to the end of nouns.",
      examples: ["carte → cartea (the book)", "om → omul (the man)", "casă → casa (the house)"],
    },
    {
      id: "sa-subjunctive",
      name: "'Să' Subjunctive",
      description: "Use 'să' + subjunctive verb to express wants, needs, or purposes.",
      examples: ["Vreau să merg (I want to go)", "Trebuie să învăț (I need to learn)", "E bine să știi (It's good to know)"],
    },
    {
      id: "past-tense",
      name: "Past Tense (Perfectul Compus)",
      description: "Form the past tense with auxiliary 'a avea' + past participle.",
      examples: ["Am mâncat (I ate)", "A venit (He/she came)", "Au plecat (They left)"],
    },
    {
      id: "pronouns",
      name: "Personal Pronouns",
      description: "Romanian pronouns change based on case (nominative, accusative, dative).",
      examples: ["Eu, tu, el/ea (I, you, he/she)", "Mă, te, îl/o (me, you, him/her)", "Îmi, îți, îi (to me, to you, to him/her)"],
    },
  ],
  ko: [
    {
      id: "particles",
      name: "Subject & Object Particles",
      description: "이/가 marks the subject, 을/를 marks the object.",
      examples: ["고양이가 먹어요 (The cat eats)", "밥을 먹어요 (I eat rice)", "저는 학생이에요 (I am a student)"],
    },
    {
      id: "formality",
      name: "Formality Levels",
      description: "Korean has multiple speech levels. -요 is polite, -(스)ㅂ니다 is formal.",
      examples: ["먹어요 (polite)", "먹습니다 (formal)", "먹어 (casual)"],
    },
    {
      id: "connectors",
      name: "Sentence Connectors",
      description: "Connect sentences with -고 (and), -지만 (but), -서 (so/because).",
      examples: ["먹고 마셔요 (eat and drink)", "비싸지만 맛있어요 (expensive but tasty)", "피곤해서 자요 (tired so sleep)"],
    },
    {
      id: "counters",
      name: "Counters",
      description: "Use specific counters for different types of objects.",
      examples: ["사과 두 개 (two apples)", "사람 세 명 (three people)", "커피 한 잔 (one cup of coffee)"],
    },
  ],
}

function GrammarSpiralContent() {
  const router = useRouter()
  const { profile, isLoading: profileLoading } = useUserProfile()
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)

  const effectiveLanguage = currentLanguage ?? profile?.primaryLanguage ?? "ro"
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarPoint | null>(null)
  const [spiralPhase, setSpiralPhase] = useState<SpiralPhase>("setup")
  const [wildContent, setWildContent] = useState<ContentItem | null>(null)
  const [reflection, setReflection] = useState("")
  const [spotCount, setSpotCount] = useState(0)

  const [sessionStats, setSessionStats] = useState({
    contentViewed: 0,
    errorsHarvested: 0,
    mysteriesAdded: 0,
    duration: 0,
  })

  // Fetch content from API
  const { content, isLoading: contentLoading } = useContent({
    language: effectiveLanguage,
  })

  const points = grammarPoints[effectiveLanguage]

  const startSpiral = () => {
    if (selectedGrammar) {
      setSpiralPhase("focus")
    }
  }

  const handleFocusComplete = () => {
    // Pick random content for wild phase
    const randomContent = content[Math.floor(Math.random() * content.length)]
    setWildContent(randomContent)
    setSpiralPhase("wild")
    setSessionStats((prev) => ({ ...prev, contentViewed: 1 }))
  }

  const handleWildComplete = () => {
    setSpiralPhase("reflect")
  }

  const handleReflectionSubmit = () => {
    setSessionStats((prev) => ({ ...prev, duration: 15 }))
    setSpiralPhase("complete")
  }

  const handleSessionComplete = (sessionReflection: string, mood: SessionMood) => {
    console.log("[Grammar Spiral] Complete:", { sessionReflection, mood, stats: sessionStats })
    router.push("/")
  }

  const handleNewSession = () => {
    setSpiralPhase("setup")
    setSelectedGrammar(null)
    setWildContent(null)
    setReflection("")
    setSpotCount(0)
    setSessionStats({ contentViewed: 0, errorsHarvested: 0, mysteriesAdded: 0, duration: 0 })
  }

  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language)
    setSelectedGrammar(null)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
  }

  const handleAddToMystery = (phrase: string) => {
    setSessionStats((prev) => ({ ...prev, mysteriesAdded: prev.mysteriesAdded + 1 }))
  }

  const handleFlagError = (phrase: string, guess: string) => {
    setSessionStats((prev) => ({ ...prev, errorsHarvested: prev.errorsHarvested + 1 }))
  }

  const isLoading = profileLoading || contentLoading

  if (isLoading && spiralPhase === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage={effectiveLanguage} onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <Skeleton className="h-10 w-64 mb-8" />
              <Skeleton className="h-64 w-full" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={effectiveLanguage} onLanguageChange={handleLanguageChange} />

      <div className="flex">
        <AppNav />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-fog" />
                  Grammar Spiral
                </h1>
                <p className="text-muted-foreground">Focused study → Wild content → Reflection</p>
              </div>
            </div>

            {/* Phase indicator */}
            {spiralPhase !== "setup" && spiralPhase !== "complete" && (
              <div className="flex items-center justify-center gap-4 mb-8">
                {(["focus", "wild", "reflect"] as const).map((phase, idx) => (
                  <div key={phase} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        spiralPhase === phase
                          ? "bg-fog text-fog-foreground"
                          : (["focus", "wild", "reflect"] as const).indexOf(spiralPhase) > idx
                            ? "bg-fog/30 text-fog"
                            : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {phase === "focus" && <Brain className="w-5 h-5" />}
                      {phase === "wild" && <Shuffle className="w-5 h-5" />}
                      {phase === "reflect" && <Pencil className="w-5 h-5" />}
                    </div>
                    <span
                      className={cn(
                        "text-sm capitalize hidden sm:inline",
                        spiralPhase === phase ? "text-foreground font-medium" : "text-muted-foreground",
                      )}
                    >
                      {phase}
                    </span>
                    {idx < 2 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />}
                  </div>
                ))}
              </div>
            )}

            {/* Setup Phase */}
            {spiralPhase === "setup" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h2 className="font-semibold text-foreground mb-4">Choose a Grammar Focus</h2>
                  <div className="grid gap-3">
                    {points.map((point) => (
                      <button
                        key={point.id}
                        onClick={() => setSelectedGrammar(point)}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          selectedGrammar?.id === point.id
                            ? "border-fog bg-fog/10"
                            : "border-border bg-card hover:border-fog/50",
                        )}
                      >
                        <div className="font-medium text-foreground">{point.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{point.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-fog/20 bg-fog/5">
                  <h3 className="font-semibold text-foreground mb-3">How Grammar Spiral Works</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li><span className="font-medium text-foreground">Focus:</span> Study the grammar point with examples</li>
                    <li><span className="font-medium text-foreground">Wild:</span> See it in action in real content</li>
                    <li><span className="font-medium text-foreground">Reflect:</span> Note what you spotted and learned</li>
                  </ol>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="bg-fog text-fog-foreground hover:bg-fog/90 px-8"
                    onClick={startSpiral}
                    disabled={!selectedGrammar}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Spiral
                  </Button>
                </div>
              </div>
            )}

            {/* Focus Phase */}
            {spiralPhase === "focus" && selectedGrammar && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-fog/30 bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-fog" />
                    <h2 className="text-xl font-semibold text-foreground">{selectedGrammar.name}</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">{selectedGrammar.description}</p>

                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Examples:</h3>
                    <div className="space-y-3">
                      {selectedGrammar.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-fog/10 border border-fog/20"
                        >
                          <p className="text-foreground font-medium">{example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground text-center">
                    Take a moment to absorb these patterns. When you're ready, we'll see them in the wild!
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleFocusComplete}
                    className="bg-fog text-fog-foreground hover:bg-fog/90"
                  >
                    I'm Ready for the Wild
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Wild Phase */}
            {spiralPhase === "wild" && wildContent && selectedGrammar && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-fog/10 border border-fog/30">
                  <p className="text-sm text-foreground text-center">
                    <span className="font-medium">Your mission:</span> Spot examples of{" "}
                    <span className="text-fog font-medium">{selectedGrammar.name}</span> in this content!
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Instances spotted:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSpotCount((prev) => Math.max(0, prev - 1))}
                      className="bg-transparent"
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold text-fog w-12 text-center">{spotCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSpotCount((prev) => prev + 1)}
                      className="bg-transparent border-fog text-fog"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <ContentViewer
                  content={wildContent}
                  onClose={handleWildComplete}
                  onAddToMystery={handleAddToMystery}
                  onFlagError={handleFlagError}
                  embedded
                />

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleWildComplete}
                    className="bg-fog text-fog-foreground hover:bg-fog/90"
                  >
                    Continue to Reflection
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Reflect Phase */}
            {spiralPhase === "reflect" && selectedGrammar && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-fog/30 bg-card space-y-4">
                  <div className="flex items-center gap-3">
                    <Pencil className="w-6 h-6 text-fog" />
                    <h2 className="text-xl font-semibold text-foreground">Reflection</h2>
                  </div>

                  <div className="p-4 rounded-lg bg-fog/10">
                    <p className="text-sm text-foreground">
                      You spotted <span className="font-bold text-fog">{spotCount}</span> instances of{" "}
                      <span className="font-medium">{selectedGrammar.name}</span> in the wild content.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      What did you notice? Any patterns or surprises?
                    </label>
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Write your observations..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Quick prompts:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "I noticed that...",
                        "This was easier/harder than expected because...",
                        "I want to practice more...",
                        "I was surprised by...",
                      ].map((prompt) => (
                        <Button
                          key={prompt}
                          variant="outline"
                          size="sm"
                          onClick={() => setReflection((prev) => prev + (prev ? " " : "") + prompt)}
                          className="bg-transparent text-xs"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleReflectionSubmit}
                    className="bg-fog text-fog-foreground hover:bg-fog/90"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Complete Spiral
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Phase */}
            {spiralPhase === "complete" && (
              <SessionComplete
                stats={{ ...sessionStats, duration: 15 }}
                onReflectionSubmit={handleSessionComplete}
                onNewSession={handleNewSession}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function GrammarSpiralPage() {
  return (
    <AuthGuard>
      <GrammarSpiralContent />
    </AuthGuard>
  )
}
