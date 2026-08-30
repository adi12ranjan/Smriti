"use client"

import { useApp } from "@/components/app-provider"
import { Panel, Tag } from "@/components/ui-bits"

export function Caregiver() {
  const { t, score, reminders } = useApp()
  const missed = reminders.filter((r) => !r.done && r.icon === "💧").length > 0

  const bars = [
    { label: t("memory"), value: 86 },
    { label: t("attention"), value: 74 },
    { label: t("patternRec"), value: 81 },
  ]

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
        <Stat label={t("score7")} value={`${score}`} trend="↑ 8%" />
        <Stat label={t("memAccuracy")} value="86%" trend="↑ 5%" />
        <Stat label={t("engagement")} value="4.2" trend={t("perWeek")} />
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
                  <span className="text-muted-foreground">{b.value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.7_0.15_230)]"
                    style={{ width: `${b.value}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            ))}
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
