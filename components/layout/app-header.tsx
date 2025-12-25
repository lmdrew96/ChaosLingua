"use client"

import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { LanguageSwitcher } from "@/components/dashboard/language-switcher"
import { Button } from "@/components/ui/button"
import { Settings, User } from "lucide-react"
import type { Language } from "@/lib/types"

interface AppHeaderProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function AppHeader({ currentLanguage, onLanguageChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />

          <div className="hidden sm:flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Link href="/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Link href="/account">
                <User className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
