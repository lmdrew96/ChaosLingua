import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <span className={cn("font-bold tracking-tight", sizes[size])}>
          <span className="text-primary">Chaos</span>
          <span className="text-foreground">Lingua</span>
        </span>
        <div className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
      </div>
    </div>
  )
}
