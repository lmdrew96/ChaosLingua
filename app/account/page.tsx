"use client"

import { useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile, useUserStats } from "@/lib/hooks/use-user-data"
import type { Language } from "@/lib/types"
import { User, Mail, Calendar, Trophy, Target, Sparkles, LogOut, Trash2 } from "lucide-react"

function AccountContent() {
  const { user, signOut } = useAuth()
  const { profile, isLoading: profileLoading, mutate: mutateProfile } = useUserProfile()
  const { stats, isLoading: statsLoading } = useUserStats()

  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Initialize name from user
  useState(() => {
    if (user?.display_name) setName(user.display_name)
  })

  const currentLanguage: Language = profile?.primaryLanguage || "ro"

  const handleLanguageChange = async (language: Language) => {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
    mutateProfile()
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      })
      mutateProfile()
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const languageNames: Record<Language, string> = {
    ro: "Romanian",
    ko: "Korean",
  }

  const achievements = [
    {
      id: "1",
      title: "Chaos Initiate",
      description: "Complete your first chaos session",
      earned: stats.chaosSessions > 0,
    },
    { id: "2", title: "Error Collector", description: "Harvest 100 errors", earned: stats.errorsHarvested >= 100 },
    { id: "3", title: "Fog Walker", description: "Spend 10 hours in the fog", earned: stats.timeInFog >= 10 },
    { id: "4", title: "Word Smith", description: "Forge 500 words", earned: stats.wordsForged >= 500 },
    { id: "5", title: "Mystery Solver", description: "Resolve 50 mysteries", earned: stats.mysteriesResolved >= 50 },
  ]

  const displayName = user?.display_name || profile?.name || "Explorer"
  const email = user?.email || "explorer@chaoslingua.app"

  if (profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <Skeleton className="h-10 w-48 mb-8" />
              <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-64" />
                <div className="md:col-span-2 space-y-6">
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />

      <div className="flex">
        <AppNav />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Account</h1>
              <p className="text-muted-foreground text-lg">Your chaos profile.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-24 h-24 mb-4 border-2 border-chaos">
                        <AvatarImage src="/abstract-avatar.png" />
                        <AvatarFallback className="bg-chaos/20 text-chaos text-2xl">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="text-xl font-bold text-foreground mb-1">{displayName}</h2>
                      <p className="text-sm text-muted-foreground mb-4">{email}</p>

                      <div className="flex gap-2 mb-4">
                        {(profile?.languages || ["ro", "ko"]).map((lang) => (
                          <Badge key={lang} variant="secondary" className="bg-muted">
                            {languageNames[lang]} (Lvl {profile?.levels?.[lang] || 1})
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Joined{" "}
                          {(() => {
                            if (!profile?.createdAt) return "Recently"
                            const parsed = new Date(profile.createdAt)
                            if (isNaN(parsed.getTime())) return "Recently"
                            return parsed.toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          })()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="mt-4 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sessions</span>
                      <span className="font-medium text-foreground">{stats.chaosSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Errors Harvested</span>
                      <span className="font-medium text-error">{stats.errorsHarvested}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Words Forged</span>
                      <span className="font-medium text-forge">{stats.wordsForged}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Streak</span>
                      <span className="font-medium text-chaos">{stats.currentStreak} days</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2 space-y-6">
                {/* Edit Profile */}
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Details
                    </CardTitle>
                    <CardDescription>Update your account information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={name || displayName}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="pl-10 bg-background/50 opacity-50"
                        />
                      </div>
                    </div>
                    <Button className="bg-chaos hover:bg-chaos/90" onClick={handleUpdateProfile} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Update Profile"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Languages */}
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Learning Languages
                    </CardTitle>
                    <CardDescription>Languages you&apos;re exploring through chaos.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(profile?.languages || ["ro", "ko"]).map((lang) => (
                        <div
                          key={lang}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-chaos/20 flex items-center justify-center text-lg">
                              {lang === "ro" ? "🇷🇴" : "🇰🇷"}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{languageNames[lang]}</div>
                              <div className="text-sm text-muted-foreground">Level {profile?.levels?.[lang] || 1}</div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={lang === profile?.primaryLanguage ? "border-chaos text-chaos" : ""}
                          >
                            {lang === profile?.primaryLanguage ? "Primary" : "Secondary"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4 w-full bg-transparent">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Add New Language
                    </Button>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Achievements
                    </CardTitle>
                    <CardDescription>Badges earned on your chaos journey.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-3 rounded-lg border transition-all ${
                            achievement.earned
                              ? "border-chaos/50 bg-chaos/5"
                              : "border-border/30 bg-muted/20 opacity-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                achievement.earned ? "bg-chaos/20 text-chaos" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground text-sm">{achievement.title}</div>
                              <div className="text-xs text-muted-foreground">{achievement.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/30 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions. Think twice.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  )
}
