"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["ro"])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const languages = [
    { id: "ro", name: "Romanian", flag: "🇷🇴" },
    { id: "ko", name: "Korean", flag: "🇰🇷" },
  ]

  const toggleLanguage = (langId: string) => {
    setSelectedLanguages((prev) => (prev.includes(langId) ? prev.filter((l) => l !== langId) : [...prev, langId]))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedLanguages.length === 0) {
      setError("Please select at least one language to learn")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await signUp(email, password, name)
      setSuccess(true)
      setTimeout(() => router.push("/onboarding"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 border-chaos/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-chaos/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-chaos" />
            </div>
            <CardTitle className="text-2xl text-foreground">Welcome to the chaos!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your account has been created. Redirecting you to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-bold text-foreground">ChaosLingua</span>
          </Link>
          <p className="text-muted-foreground">Join the chaos. Learn differently.</p>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Create Account</CardTitle>
            <CardDescription>Start your unconventional language journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Explorer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="explorer@chaoslingua.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background/50"
                    minLength={8}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Languages to Learn</Label>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => toggleLanguage(lang.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        selectedLanguages.includes(lang.id)
                          ? "border-chaos bg-chaos/10"
                          : "border-border/50 bg-background/30 hover:border-border"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          selectedLanguages.includes(lang.id)
                            ? "bg-chaos border-chaos"
                            : "border-muted-foreground/50 bg-background/50"
                        }`}
                      >
                        {selectedLanguages.includes(lang.id) && (
                          <svg
                            className="w-3 h-3 text-chaos-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-chaos hover:bg-chaos/90 text-chaos-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Start Learning"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-chaos hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
