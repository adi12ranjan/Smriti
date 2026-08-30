"use client"

import { Volume2, ArrowRight, Flame, Brain, Gamepad2, Sparkles } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel, Tag, Pill } from "@/components/ui-bits"

const WEEK = [
  { d: "M", v: 45 },
  { d: "T", v: 55 },
  { d: "W", v: 48 },
  { d: "T", v: 70 },
  { d: "F", v: 64 },
  { d: "S", v: 82 },
  { d: "S", v: 76 },
]

const GAMES = [
  { key: "memory", icon: "🧠", nameKey: "g_memory_name", descKey: "g_memory_desc" },
  { key: "focus", icon: "🔎", nameKey: "g_focus_name", descKey: "g_focus_desc" },
  { key: "pattern", icon: "🧩", nameKey: "g_pattern_name", descKey: "g_pattern_desc" },
] as const

export function Dashboard() {
  const { t, navigate, speakKey, score, gamesCompleted, mood, cycleMood, reminders, userName } = useApp()

  const upcoming = reminders.filter((r) => !r.done).slice(0, 3)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-pretty text-3xl font-extrabold tracking-tight">
            {userName ? `Hello, ${userName}` : t("greeting")} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Today · {mood.emoji} Feeling {mood.label.toLowerCase()}</p>
        </div>
        <div className="flex gap-2.5">
          <Pill onClick={() => speakKey("v_welcome")}>
            <Volume2 className="size-4" aria-hidden /> {t("voice")}
          </Pill>
          <Pill onClick={() => navigate("language")}>🌐 {t("language")}</Pill>
        </div>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-primary to-[oklch(0.62_0.16_260)] p-6 text-primary-foreground shadow-md">
        <div className="max-w-xl">
          <h2 className="text-balance text-2xl font-extrabold">{t("heroTitle")}</h2>
          <p className="mt-2 text-primary-foreground/85">{t("heroText")}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate("games")}
            className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-3 font-extrabold text-primary transition-transform hover:scale-[1.02]"
          >
            {t("heroStart")} <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            onClick={() => speakKey("v_welcome")}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/35 bg-primary-foreground/15 px-4 py-3 font-bold text-primary-foreground"
          >
            <Volume2 className="size-4" aria-hidden /> {t("listen")}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("stat_score")} value={`${score}`} unit="/100" trend="↑ 8% this week" icon={<Brain className="size-4" />} />
        <StatCard label={t("stat_streak")} value="12 🔥" trend={t("streakBest")} icon={<Flame className="size-4" />} />
        <StatCard label={t("stat_games")} value={`${gamesCompleted}/4`} trend={t("oneMore")} icon={<Gamepad2 className="size-4" />} />
        <button onClick={cycleMood} className="text-left">
          <StatCard label={t("stat_mood")} value={`${mood.emoji} ${mood.label}`} trend={t("tapMood")} icon={<Sparkles className="size-4" />} />
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{t("recommended")}</h3>
            <Tag tone="primary">{t("aiAdapted")}</Tag>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {GAMES.map((g) => (
              <div key={g.key} className="rounded-2xl border border-border bg-muted/40 p-4">
                <div className="text-3xl" aria-hidden>{g.icon}</div>
                <b className="mt-2 block">{t(g.nameKey)}</b>
                <p className="mt-1 text-sm text-muted-foreground">{t(g.descKey)}</p>
                <button
                  onClick={() => navigate("games")}
                  className="mt-3 w-full rounded-lg bg-primary/12 py-2.5 text-sm font-extrabold text-primary transition-colors hover:bg-primary/20"
                >
                  {t("play")}
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="mb-4 text-lg font-bold">{t("weeklyTrend")}</h3>
          <div className="flex h-40 items-end gap-2.5 pt-2">
            {WEEK.map((w, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div
                  className="w-full max-w-[30px] rounded-t-md bg-gradient-to-t from-primary/70 to-primary"
                  style={{ height: `${w.v}%` }}
                  aria-hidden
                />
                <small className="text-muted-foreground">{w.d}</small>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("aiInsightTrend")}</p>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-3 text-lg font-bold">{t("todayReminders")}</h3>
          <ul>
            {upcoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <span className="text-sm">
                  <span aria-hidden>{r.icon}</span> {r.label} · {r.time}
                </span>
                <Tag>{t("upcoming")}</Tag>
              </li>
            ))}
            {upcoming.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">{t("noReminders")}</li>
            )}
          </ul>
        </Panel>
        <Panel>
          <h3 className="mb-3 text-lg font-bold">{t("recentActivity")}</h3>
          <ul className="space-y-3">
            <ActivityItem title={t("g_memory_name")} sub="92% accuracy · 15 min ago" />
            <ActivityItem title={t("stat_mood")} sub={`${mood.emoji} ${mood.label} · Today`} />
            <ActivityItem title="Hydration reminder" sub={`${t("completed")} · Today`} />
          </ul>
        </Panel>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  trend,
  icon,
}: {
  label: string
  value: string
  unit?: string
  trend: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <small className="text-xs font-bold uppercase tracking-wide">{label}</small>
        <span className="text-primary">{icon}</span>
      </div>
      <strong className="mt-2 block text-2xl">
        {value}
        {unit && <span className="text-base text-muted-foreground">{unit}</span>}
      </strong>
      <span className="text-xs font-bold text-accent">{trend}</span>
    </div>
  )
}

function ActivityItem({ title, sub }: { title: string; sub: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" aria-hidden />
      <div className="leading-tight">
        <b>{title}</b>
        <br />
        <small className="text-muted-foreground">{sub}</small>
      </div>
    </li>
  )
}
