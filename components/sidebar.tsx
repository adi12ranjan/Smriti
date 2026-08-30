"use client"

import {
  CalendarHeart,
  Gamepad2,
  Puzzle,
  AlarmClock,
  Languages,
  Users,
  Settings,
  Brain,
} from "lucide-react"
import { useApp, type PageId } from "@/components/app-provider"
import type { TKey } from "@/lib/i18n"

const NAV: { id: PageId; icon: typeof Brain; labelKey: TKey }[] = [
  { id: "dashboard", icon: CalendarHeart, labelKey: "nav_day" },
  { id: "games", icon: Gamepad2, labelKey: "nav_games" },
  { id: "memory", icon: Puzzle, labelKey: "nav_memory" },
  { id: "reminders", icon: AlarmClock, labelKey: "nav_reminders" },
  { id: "language", icon: Languages, labelKey: "nav_language" },
  { id: "caregiver", icon: Users, labelKey: "nav_caregiver" },
  { id: "profile", icon: Settings, labelKey: "nav_profile" },
]

export function Sidebar() {
  const { page, navigate, t, userName } = useApp()

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[76px] flex-col bg-sidebar px-3 py-6 text-sidebar-foreground md:w-64 md:px-4">
      <div className="mb-8 flex items-center gap-3 px-1 md:px-2">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.15_230)] text-primary-foreground">
          <Brain className="size-5" aria-hidden />
        </div>
        <span className="hidden text-xl font-extrabold tracking-tight md:block">MindSathi</span>
      </div>

      <nav className="flex flex-col gap-1.5" aria-label="Primary">
        {NAV.map(({ id, icon: Icon, labelKey }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={active ? "page" : undefined}
              title={t(labelKey)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="hidden md:block">{t(labelKey)}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto hidden items-center gap-3 rounded-2xl bg-sidebar-accent/70 p-3.5 md:flex">
        <div className="grid size-10 place-items-center rounded-full bg-[oklch(0.82_0.06_60)] font-extrabold text-[oklch(0.35_0.05_50)]">
          AK
        </div>
        <div className="leading-tight">
          <p className="font-bold">{userName || "MindSathi User"}</p>
          <p className="text-xs text-sidebar-foreground/55">{t("patientMode")}</p>
        </div>
      </div>
    </aside>
  )
}
