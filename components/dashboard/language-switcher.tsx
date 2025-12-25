"use client"

import { cn } from "@/lib/utils"
import type { Language } from "@/lib/types"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

const languageConfig: Record<Language, { flag: string; name: string; native: string }> = {
  ro: { flag: "🇷🇴", name: "Romanian", native: "Română" },
  ko: { flag: "🇰🇷", name: "Korean", native: "한국어" },
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary/50">
      {(Object.keys(languageConfig) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            currentLanguage === lang
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary",
          )}
        >
          <span className="text-lg">{languageConfig[lang].flag}</span>
          <span className="hidden sm:inline">{languageConfig[lang].name}</span>
        </button>
      ))}
    </div>
  )
}
