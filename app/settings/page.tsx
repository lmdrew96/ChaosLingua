"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { AppNav } from "@/components/layout/app-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserProfile } from "@/lib/hooks/use-user-data"
import type { Language, ChaosSetting } from "@/lib/types"
import { Sparkles, CloudFog, Flame, Bell, Moon, Volume2, Zap } from "lucide-react"

function SettingsContent() {
  const { profile, isLoading, mutate } = useUserProfile()
  const currentLanguage: Language = profile?.primaryLanguage || "ro"

  const [chaosSetting, setChaosSetting] = useState<ChaosSetting>("guided-random")
  const [fogLevel, setFogLevel] = useState(70)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [autoPlay, setAutoPlay] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state with profile when loaded
  useEffect(() => {
    if (profile) {
      setChaosSetting(profile.chaosSetting)
      setFogLevel(profile.fogLevel)
    }
  }, [profile])

  const handleLanguageChange = async (language: Language) => {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryLanguage: language }),
    })
    mutate()
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chaosSetting,
          fogLevel,
        }),
      })
      mutate()
    } finally {
      setIsSaving(false)
    }
  }

  const chaosSettings: { value: ChaosSetting; label: string; description: string }[] = [
    { value: "full-random", label: "Full Chaos", description: "Complete randomness. No guardrails. Pure exploration." },
    { value: "guided-random", label: "Guided Chaos", description: "Randomness with gentle nudges toward your level." },
    { value: "curated", label: "Curated Chaos", description: "Hand-picked content that still surprises." },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
        <div className="flex">
          <AppNav />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <Skeleton className="h-10 w-48 mb-8" />
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-64 w-full" />
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground text-lg">Tune your chaos experience.</p>
            </div>

            <Tabs defaultValue="learning" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="learning">Learning</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="learning" className="space-y-6">
                {/* Chaos Engine Settings */}
                <Card className="border-chaos/30 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-chaos">
                      <Sparkles className="w-5 h-5" />
                      Chaos Engine
                    </CardTitle>
                    <CardDescription>Control how random your exploration sessions feel.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      {chaosSettings.map((setting) => (
                        <button
                          key={setting.value}
                          onClick={() => setChaosSetting(setting.value)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            chaosSetting === setting.value
                              ? "border-chaos bg-chaos/10"
                              : "border-border/50 hover:border-border"
                          }`}
                        >
                          <div className="font-medium text-foreground">{setting.label}</div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Fog Machine Settings */}
                <Card className="border-fog/30 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-fog">
                      <CloudFog className="w-5 h-5" />
                      Fog Machine
                    </CardTitle>
                    <CardDescription>Adjust how much ambiguity you want to embrace.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Default Fog Density</Label>
                        <span className="text-sm text-muted-foreground">{fogLevel}%</span>
                      </div>
                      <Slider
                        value={[fogLevel]}
                        onValueChange={(value) => setFogLevel(value[0])}
                        max={100}
                        step={10}
                        className="[&_[role=slider]]:bg-fog"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher fog = more unknown words. Embrace the confusion.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Forge Settings */}
                <Card className="border-forge/30 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-forge">
                      <Flame className="w-5 h-5" />
                      The Forge
                    </CardTitle>
                    <CardDescription>Configure your production practice sessions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-advance prompts</Label>
                        <p className="text-xs text-muted-foreground">Move to next prompt automatically after timer</p>
                      </div>
                      <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how ChaosLingua looks and sounds.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label>Dark Mode</Label>
                          <p className="text-xs text-muted-foreground">Embrace the darkness</p>
                        </div>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label>Sound Effects</Label>
                          <p className="text-xs text-muted-foreground">Audio feedback for actions</p>
                        </div>
                      </div>
                      <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle>Data & Privacy</CardTitle>
                    <CardDescription>Manage your learning data.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Zap className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
                    >
                      Clear All Progress
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </CardTitle>
                    <CardDescription>Control how and when we nudge you.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Daily chaos reminders</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Streak Reminders</Label>
                        <p className="text-xs text-muted-foreground">Don&apos;t let the fire die</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Insights</Label>
                        <p className="text-xs text-muted-foreground">Summary of your chaos journey</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-end">
              <Button className="bg-chaos hover:bg-chaos/90" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  )
}
