"use client"

import { useEffect, useMemo, useState } from "react"
import { Volume2, ArrowRight, Flame, Brain, Gamepad2, Sparkles, Phone, Megaphone } from "lucide-react"
import { useApp, type ActivityEntry } from "@/components/app-provider"
import { Panel, Tag, Pill } from "@/components/ui-bits"
import { timeAgo } from "@/lib/utils"

// Average game accuracy per day for the last 7 days, derived from real activity — no more fake numbers.
function weeklyAccuracyTrend(log: ActivityEntry[]) {
  const days: { d: string; v: number; hasData: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const entries = log.filter(
      (e) => e.type === "game" && e.value !== undefined && new Date(e.timestamp).toISOString().slice(0, 10) === key,
    )
    const avg = entries.length ? Math.round(entries.reduce((s, e) => s + (e.value || 0), 0) / entries.length) : 0
    days.push({ d: d.toLocaleDateString(undefined, { weekday: "narrow" }), v: avg, hasData: entries.length > 0 })
  }
  return days
}

const GAMES = [
  { key: "memory", icon: "🧠", nameKey: "g_memory_name", descKey: "g_memory_desc" },
  { key: "focus", icon: "🔎", nameKey: "g_focus_name", descKey: "g_focus_desc" },
  { key: "pattern", icon: "🧩", nameKey: "g_pattern_name", descKey: "g_pattern_desc" },
] as const

export function Dashboard() {
  const {
    t, navigate, speakKey, speak, score, gamesCompleted, mood, cycleMood, reminders, userName,
    streak, activityLog, shoutouts, caregiverContact, toast,
  } = useApp()

  const upcoming = reminders.filter((r) => !r.done).slice(0, 3)
  const latestShoutout = shoutouts[0]
  const week = useMemo(() => weeklyAccuracyTrend(activityLog), [activityLog])
  const weekHasData = week.some((w) => w.hasData)

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

      <OrientationCard onRead={speak} />

      {latestShoutout && (
        <Panel className="border-2 border-accent/30 bg-accent/5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <Megaphone className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-accent">A note from your family</p>
              <p className="mt-1 text-lg font-semibold">{latestShoutout.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">{timeAgo(latestShoutout.timestamp)}</p>
            </div>
            <button
              onClick={() => speak(latestShoutout.text)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-sm font-bold text-accent shadow-sm"
              aria-label="Read note aloud"
            >
              <Volume2 className="size-4" aria-hidden />
            </button>
          </div>
        </Panel>
      )}

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
          {caregiverContact.phone && (
            <a
              href={`tel:${caregiverContact.phone}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/35 bg-primary-foreground/15 px-4 py-3 font-bold text-primary-foreground"
            >
              <Phone className="size-4" aria-hidden /> Call {caregiverContact.name || "for help"}
            </a>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("stat_score")} value={`${score}`} unit="/100" trend="Overall cognitive score" icon={<Brain className="size-4" />} />
        <StatCard label={t("stat_streak")} value={`${streak} 🔥`} trend={streak > 0 ? "Days active in a row" : "Start today!"} icon={<Flame className="size-4" />} />
        <StatCard label={t("stat_games")} value={`${gamesCompleted}`} trend="Sessions completed" icon={<Gamepad2 className="size-4" />} />
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
            {week.map((w, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div
                  className={`w-full max-w-[30px] rounded-t-md ${
                    w.hasData ? "bg-gradient-to-t from-primary/70 to-primary" : "bg-muted"
                  }`}
                  style={{ height: `${Math.max(w.v, 4)}%` }}
                  aria-hidden
                />
                <small className="text-muted-foreground">{w.d}</small>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {weekHasData ? t("aiInsightTrend") : "Play a few games this week to build your trend."}
          </p>
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
          {activityLog.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">
              Nothing yet — play a game or complete a reminder to see it here.
            </p>
          ) : (
            <ul className="space-y-3">
              {activityLog.slice(0, 4).map((a) => (
                <ActivityItem
                  key={a.id}
                  title={a.type === "game" ? a.label : a.type === "reminder" ? a.label : "Mood check-in"}
                  sub={`${a.type === "game" && a.value !== undefined ? `${a.value}% accuracy · ` : ""}${timeAgo(a.timestamp)}`}
                />
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  )
}

function OrientationCard({ onRead }: { onRead: (text: string) => void }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  if (!now) return null

  const dayName = now.toLocaleDateString(undefined, { weekday: "long" })
  const dateStr = now.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
  const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  const hour = now.getHours()
  const timeOfDay = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 21 ? "Evening" : "Night"
  const icon = hour < 12 ? "🌅" : hour < 17 ? "☀️" : hour < 21 ? "🌆" : "🌙"

  return (
    <Panel className="flex flex-wrap items-center justify-between gap-4 bg-muted/30">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Today is</p>
        <h2 className="text-2xl font-extrabold">{dayName}, {dateStr}</h2>
        <p className="mt-1 text-muted-foreground">
          <span aria-hidden>{icon}</span> Good {timeOfDay.toLowerCase()} — it is {timeStr} right now
        </p>
      </div>
      <Pill onClick={() => onRead(`Today is ${dayName}, ${dateStr}. Good ${timeOfDay.toLowerCase()}. It is ${timeStr}.`)}>
        <Volume2 className="size-4" aria-hidden /> Read
      </Pill>
    </Panel>
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
