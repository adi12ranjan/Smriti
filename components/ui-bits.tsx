"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}>
      {children}
    </div>
  )
}

export function Tag({
  children,
  tone = "green",
}: {
  children: ReactNode
  tone?: "green" | "amber" | "primary" | "neutral"
}) {
  const tones: Record<string, string> = {
    green: "bg-accent/12 text-accent",
    amber: "bg-[oklch(0.72_0.15_60)]/15 text-[oklch(0.5_0.13_55)]",
    primary: "bg-primary/12 text-primary",
    neutral: "bg-muted text-muted-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

export function Pill({
  children,
  onClick,
  className,
  ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  )
}
