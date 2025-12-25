"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  Shuffle,
  Flower2,
  Cloud,
  Flame,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Brain,
  Zap,
  Target,
} from "lucide-react"
import type { Language, ChaosSetting } from "@/lib/types"

type OnboardingStep = "philosophy" | "languages" | "chaos" | "level" | "ready"

function OnboardingContent() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("philosophy")
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(["ro"])
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>("ro")
  const [chaosSetting, setChaosSetting] = useState<ChaosSetting>("guided-random")
  const [fogLevel, setFogLevel] = useState(70)
  const [selfAssessedLevel, setSelfAssessedLevel] = useState<number>(3)
  const [isSaving, setIsSaving] = useState(false)

  const steps: OnboardingStep[] = ["philosophy", "languages", "chaos", "level", "ready"]
  const currentStepIndex = steps.indexOf(step)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex])
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryLanguage,
          languages: selectedLanguages,
          chaosSetting,
          fogLevel,
          levels: {
            ro: selectedLanguages.includes("ro") ? selfAssessedLevel : 1,
            ko: selectedLanguages.includes("ko") ? selfAssessedLevel : 1,
          },
        }),
      })
      router.push("/")
    } catch (error) {
      console.error("Failed to save preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleLanguage = (lang: Language) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages((prev) => prev.filter((l) => l !== lang))
        if (primaryLanguage === lang) {
          setPrimaryLanguage(selectedLanguages.find((l) => l !== lang) || "ro")
        }
      }
    } else {
      setSelectedLanguages((prev) => [...prev, lang])
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold text-foreground">ChaosLingua</span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="max-w-2xl mx-auto flex gap-2">
          {steps.map((s, idx) => (
            <div
              key={s}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                idx <= currentStepIndex ? "bg-chaos" : "bg-secondary",
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Philosophy Step */}
          {step === "philosophy" && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  This app works differently.
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                  ChaosLingua is built on three pillars that might seem paradoxical—but they work.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="p-6 rounded-xl bg-chaos/10 border border-chaos/30 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-chaos/20 flex items-center justify-center">
                    <Shuffle className="w-6 h-6 text-chaos" />
                  </div>
                  <h3 className="font-semibold text-foreground">Structured Chaos</h3>
                  <p className="text-sm text-muted-foreground">
                    We provide containers. You provide the curiosity. Randomness within boundaries creates discovery.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-error-garden/10 border border-error-garden/30 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-error-garden/20 flex items-center justify-center">
                    <Flower2 className="w-6 h-6 text-error-garden" />
                  </div>
                  <h3 className="font-semibold text-foreground">Mastery Through Mistakes</h3>
                  <p className="text-sm text-muted-foreground">
                    Your errors become your curriculum. Wrong guesses are data, not failures.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-fog/10 border border-fog/30 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-fog/20 flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-fog" />
                  </div>
                  <h3 className="font-semibold text-foreground">Knowing Through Not-Knowing</h3>
                  <p className="text-sm text-muted-foreground">
                    Embrace productive confusion. Let patterns emerge through exposure, not memorization.
                  </p>
                </div>
              </div>

              <Button size="lg" onClick={handleNext} className="bg-chaos text-chaos-foreground hover:bg-chaos/90">
                I'm ready for this
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Languages Step */}
          {step === "languages" && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  What languages are you learning?
                </h1>
                <p className="text-lg text-muted-foreground">
                  Select all that apply. You can always change this later.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {[
                  { id: "ro" as Language, name: "Romanian", flag: "🇷🇴" },
                  { id: "ko" as Language, name: "Korean", flag: "🇰🇷" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => toggleLanguage(lang.id)}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all",
                      selectedLanguages.includes(lang.id)
                        ? "border-chaos bg-chaos/10"
                        : "border-border bg-card hover:border-chaos/50",
                    )}
                  >
                    <div className="text-6xl mb-4">{lang.flag}</div>
                    <div className="font-semibold text-foreground">{lang.name}</div>
                    {selectedLanguages.includes(lang.id) && (
                      <div className="mt-2">
                        <Check className="w-5 h-5 text-chaos mx-auto" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedLanguages.length > 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Which is your primary focus?</p>
                  <div className="flex gap-2 justify-center">
                    {selectedLanguages.map((lang) => (
                      <Button
                        key={lang}
                        variant={primaryLanguage === lang ? "default" : "outline"}
                        onClick={() => setPrimaryLanguage(lang)}
                        className={cn(
                          primaryLanguage === lang
                            ? "bg-chaos text-chaos-foreground"
                            : "bg-transparent",
                        )}
                      >
                        {lang === "ro" ? "🇷🇴 Romanian" : "🇰🇷 Korean"}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleBack} className="bg-transparent">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-chaos text-chaos-foreground hover:bg-chaos/90"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Chaos Calibration Step */}
          {step === "chaos" && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Calibrate your chaos
                </h1>
                <p className="text-lg text-muted-foreground">
                  How much randomness do you want in your learning?
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "full-random" as ChaosSetting,
                    icon: <Zap className="w-6 h-6" />,
                    title: "Full Random",
                    description: "Maximum surprise. Any content, any difficulty. Embrace the unknown.",
                  },
                  {
                    id: "guided-random" as ChaosSetting,
                    icon: <Sparkles className="w-6 h-6" />,
                    title: "Guided Random",
                    description: "Random within your preferences. Surprise me, but keep it relevant.",
                  },
                  {
                    id: "curated" as ChaosSetting,
                    icon: <Target className="w-6 h-6" />,
                    title: "Curated",
                    description: "More structure, less chaos. Content matched to your level and interests.",
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setChaosSetting(option.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left",
                      chaosSetting === option.id
                        ? "border-chaos bg-chaos/10"
                        : "border-border bg-card hover:border-chaos/50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        chaosSetting === option.id ? "bg-chaos/20 text-chaos" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{option.title}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                    {chaosSetting === option.id && <Check className="w-5 h-5 text-chaos flex-shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleBack} className="bg-transparent">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-chaos text-chaos-foreground hover:bg-chaos/90"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Level Assessment Step */}
          {step === "level" && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Where are you in your journey?
                </h1>
                <p className="text-lg text-muted-foreground">
                  This helps us calibrate content difficulty. Be honest—there's no wrong answer.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-fog" />
                    <span className="font-medium text-foreground">Self-Assessment</span>
                  </div>
                  <span className="text-sm font-mono text-chaos">Level {selfAssessedLevel}</span>
                </div>

                <Slider
                  value={[selfAssessedLevel]}
                  onValueChange={([value]) => setSelfAssessedLevel(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Complete Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50 text-left">
                  <p className="text-sm text-foreground">
                    {selfAssessedLevel <= 3 && (
                      <>
                        <span className="font-medium">Beginner:</span> You know basic greetings and can recognize some
                        words. Reading is slow but possible.
                      </>
                    )}
                    {selfAssessedLevel > 3 && selfAssessedLevel <= 6 && (
                      <>
                        <span className="font-medium">Intermediate:</span> You can follow simple conversations and read
                        basic texts. You understand the gist of most content.
                      </>
                    )}
                    {selfAssessedLevel > 6 && (
                      <>
                        <span className="font-medium">Advanced:</span> You can engage with native content comfortably.
                        You're refining nuances and expanding vocabulary.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-fog/10 border border-fog/30">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">💡 Fog Level:</span> We'll start you at {fogLevel}%
                  comprehension target—just above your comfort zone. This is where real learning happens.
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleBack} className="bg-transparent">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-chaos text-chaos-foreground hover:bg-chaos/90"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Ready Step */}
          {step === "ready" && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-chaos/20 flex items-center justify-center mx-auto">
                  <Flame className="w-10 h-10 text-chaos" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">You're ready!</h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                  Your chaos is calibrated. Your error garden awaits. The fog beckons.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border text-left space-y-4">
                <h3 className="font-semibold text-foreground">Your settings:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Languages</p>
                    <p className="font-medium text-foreground">
                      {selectedLanguages.map((l) => (l === "ro" ? "🇷🇴 Romanian" : "🇰🇷 Korean")).join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Primary</p>
                    <p className="font-medium text-foreground">
                      {primaryLanguage === "ro" ? "🇷🇴 Romanian" : "🇰🇷 Korean"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chaos Level</p>
                    <p className="font-medium text-foreground capitalize">{chaosSetting.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Starting Level</p>
                    <p className="font-medium text-foreground">Level {selfAssessedLevel}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleBack} className="bg-transparent">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="bg-chaos text-chaos-foreground hover:bg-chaos/90 px-8"
                >
                  {isSaving ? "Saving..." : "Enter the Chaos"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  )
}
