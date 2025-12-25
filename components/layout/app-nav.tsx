"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Shuffle, Flower2, Cloud, Flame, Sparkles, BarChart3, Settings, User } from "lucide-react"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chaos", icon: Shuffle, label: "Chaos Engine" },
  { href: "/errors", icon: Flower2, label: "Error Garden" },
  { href: "/fog", icon: Cloud, label: "Fog Machine" },
  { href: "/forge", icon: Flame, label: "The Forge" },
  { href: "/mysteries", icon: Sparkles, label: "Mysteries" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/account", icon: User, label: "Account" },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md md:static md:border-t-0 md:border-r md:h-[calc(100vh-4rem)] md:w-64 md:bg-transparent">
      <div className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-4 gap-1 md:gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all",
                "min-w-[64px] md:min-w-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
