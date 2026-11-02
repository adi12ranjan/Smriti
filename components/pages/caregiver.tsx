"use client"

import { useMemo, useState } from "react"
import { Send } from "lucide-react"
import { useApp, type ActivityEntry, type MoodEntry } from "@/components/app-provider"
import { Panel, Tag } from "@/components/ui-bits"

function avgAccuracyFor(log: ActivityEntry[], label: string, days = 7): number | null {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const entries = log.filter((e) => e.type === "game" && e.label === label && e.value !== undefined && e.timestamp >= cutoff)
  if (!entries.length) return null
  return Math.round(entries.reduce((s, e) => s + (e.value || 0), 0) / entries.length)
}

function last7Moods(history: MoodEntry[]) {
  const out: { d: string; entry: MoodEntry | null }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ d: d.toLocaleDateString(undefined, { weekday: "narrow" }), entry: history.find((h) => h.date === key) ?? null })
  }
  return out
}

export function Caregiver() {
  const { t, score, reminders, activityLog, moodHistory, streak, shoutouts, addShoutout, toast, caregiverContact, setCaregiverContact } = useApp()
  const missed = reminders.filter((r) => !r.done && r.icon === "💧").length > 0

  const bars = [
    { label: t("memory"), value: avgAccuracyFor(activityLog, "memory") },
    { label: t("attention"), value: avgAccuracyFor(activityLog, "focus") },
    { label: t("patternRec"), value: avgAccuracyFor(activityLog, "pattern") },
  ]

  const last7 = useMemo(() => activityLog.filter((e) => e.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000), [activityLog])
  const engagementPerDay = (last7.length / 7).toFixed(1)
  const reminderCompletion = useMemo(() => {
    const total = reminders.length
    const done = reminders.filter((r) => r.done).length
    return total ? Math.round((done / total) * 100) : 0
  }, [reminders])

  const moodRow = useMemo(() => last7Moods(moodHistory), [moodHistory])

  const [shoutoutText, setShoutoutText] = useState("")
  const [contactName, setContactName] = useState(caregiverContact.name)
  const [contactPhone, setContactPhone] = useState(caregiverContact.phone)

  function submitShoutout(e: React.FormEvent) {
    e.preventDefault()
    if (!shoutoutText.trim()) return
    addShoutout(shoutoutText)
    setShoutoutText("")
    toast("Note sent — it'll show on their dashboard ✓")
  }

  function saveContact(e: React.FormEvent) {
    e.preventDefault()
    setCaregiverContact({ name: contactName.trim(), phone: contactPhone.trim() })
    toast("Caregiver contact saved ✓")
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("caregiverTitle")} <span aria-hidden>👨‍👩‍👧</span>
          </h1>
          <p className="mt-1 text-muted-foreground">{t("caregiverSubtitle")}</p>
        </div>
        <Tag tone="green">{t("synced")}</Tag>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={t("score7")} value={`${score}`} trend={`🔥 ${streak}-day streak`} />
        <Stat label={t("memAccuracy")} value={bars[0].value !== null ? `${bars[0].value}%` : "—"} trend={bars[0].value !== null ? "Last 7 days" : "No data yet"} />
        <Stat label={t("engagement")} value={engagementPerDay} trend={t("perWeek")} />
        <Stat label={t("alerts")} value={missed ? "1" : "0"} trend={missed ? t("needsReview") : t("healthy")} warn={missed} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-lg font-bold">{t("weeklyInsight")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("weeklyInsightText")}</p>
          <div className="mt-5 space-y-4">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="mb-1.5 flex justify-between text-sm font-semibold">
                  <span>{b.label}</span>
                  <span className="text-muted-foreground">{b.value !== null ? `${b.value}%` : "No data yet"}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.7_0.15_230)]"
                    style={{ width: `${b.value ?? 0}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-1.5 flex justify-between text-sm font-semibold">
              <span>Reminder completion</span>
              <span className="text-muted-foreground">{reminderCompletion}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent" style={{ width: `${reminderCompletion}%` }} aria-hidden />
            </div>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">{t("careAlerts")}</h3>
          <ul className="mt-3">
            {missed && (
              <li className="flex items-center justify-between border-b border-border py-3.5">
                <span className="text-sm">⚠️ {t("missedHydration")}</span>
                <Tag tone="amber">{t("review")}</Tag>
              </li>
            )}
            <li className="flex items-center justify-between py-3.5">
              <span className="text-sm">💚 {t("noUrgent")}</span>
              <Tag tone="green">{t("healthy")}</Tag>
            </li>
          </ul>

          <div className="mt-4 border-t border-border pt-4">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Mood, last 7 days</h4>
            <div className="flex justify-between">
              {moodRow.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-2xl" aria-hidden>{m.entry?.mood.emoji ?? "·"}</span>
                  <small className="text-muted-foreground">{m.d}</small>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-lg font-bold">Send a note</h3>
          <p className="mt-1 text-sm text-muted-foreground">Leave an encouraging message — it appears on their Today screen and can be read aloud.</p>
          <form onSubmit={submitShoutout} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={shoutoutText}
              onChange={(e) => setShoutoutText(e.target.value)}
              placeholder="Proud of you today, Papa!"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground">
              <Send className="size-4" aria-hidden /> Send
            </button>
          </form>
          {shoutouts.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {shoutouts.slice(0, 4).map((s) => (
                <li key={s.id} className="text-sm text-muted-foreground">
                  <span className="text-foreground">{s.text}</span> · {new Date(s.timestamp).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Emergency contact</h3>
          <p className="mt-1 text-sm text-muted-foreground">Shown as a one-tap "Call for help" button on their Home and menu.</p>
          <form onSubmit={saveContact} className="mt-4 grid gap-3">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name (e.g. Priya, daughter)"
              className="rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Phone number"
              type="tel"
              className="rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground">
              Save contact
            </button>
          </form>
        </Panel>
      </div>
    </div>
  )
}

function Stat({ label, value, trend, warn }: { label: string; value: string; trend: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <small className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</small>
      <strong className="mt-2 block text-2xl">{value}</strong>
      <span className={`text-xs font-bold ${warn ? "text-[oklch(0.6_0.15_60)]" : "text-accent"}`}>{trend}</span>
    </div>
  )
}
