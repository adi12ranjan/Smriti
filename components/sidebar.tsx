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
  LogOut,
  Phone,
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
  const { page, navigate, t, userName, logout, caregiverContact, toast } = useApp()

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[76px] flex-col bg-sidebar px-3 py-6 text-sidebar-foreground md:w-64 md:px-4">
      <div className="mb-8 flex items-center gap-3 px-1 md:px-2">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.15_230)] text-primary-foreground">
          <Brain className="size-5" aria-hidden />
        </div>
        <span className="hidden text-xl font-extrabold tracking-tight md:block">Smriti</span>
      </div>

      {caregiverContact.phone ? (
        <a
          href={`tel:${caregiverContact.phone}`}
          title={`Call ${caregiverContact.name || "for help"}`}
          className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-destructive px-3 py-3 text-sm font-extrabold text-destructive-foreground hover:opacity-90 md:justify-start"
        >
          <Phone className="size-4 shrink-0" aria-hidden />
          <span className="hidden md:block">Call for Help</span>
        </a>
      ) : (
        <button
          onClick={() => { navigate("caregiver"); toast("Add an emergency contact number in Caregiver View") }}
          title="Set up Call for Help"
          className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-sidebar-foreground/30 px-3 py-3 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent/60 md:justify-start"
        >
          <Phone className="size-4 shrink-0" aria-hidden />
          <span className="hidden md:block">Set up Call for Help</span>
        </button>
      )}

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

      <div className="mt-auto hidden flex-col gap-2 md:flex">
        <div className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/70 p-3.5">
          <div className="grid size-10 place-items-center rounded-full bg-[oklch(0.82_0.06_60)] font-extrabold text-[oklch(0.35_0.05_50)]">
            {userName ? userName.slice(0, 2).toUpperCase() : "SM"}
          </div>
          <div className="leading-tight">
            <p className="font-bold">{userName || "Smriti User"}</p>
            <p className="text-xs text-sidebar-foreground/55">{t("patientMode")}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
      {/* Mobile logout */}
      <button
        onClick={logout}
        title="Logout"
        className="mt-auto flex items-center justify-center rounded-xl px-3 py-3 text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors md:hidden"
      >
        <LogOut className="size-5" />
      </button>
    </aside>
  )
}
