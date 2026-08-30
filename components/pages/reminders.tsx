"use client"

import { useState } from "react"
import { Plus, Check, Volume2, Trash2 } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel, Tag, Pill } from "@/components/ui-bits"

const ICONS = ["💊", "💧", "🚶", "🍽️", "👨‍⚕️", "😴", "⏰"]

export function Reminders() {
  const { t, reminders, toggleReminder, deleteReminder, addReminder, toast, speakKey } = useApp()
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [time, setTime] = useState("")
  const [icon, setIcon] = useState(ICONS[0])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    addReminder(label.trim(), time.trim() || "Anytime", icon)
    toast(`${t("reminderAdded")} ✓`)
    setLabel("")
    setTime("")
    setIcon(ICONS[0])
    setOpen(false)
  }

  const pending = reminders.filter((r) => !r.done)
  const done = reminders.filter((r) => r.done)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("remindersTitle")} <span aria-hidden>⏰</span>
          </h1>
          <p className="mt-1 text-muted-foreground">{t("remindersSubtitle")}</p>
        </div>
        <div className="flex gap-2.5">
          <Pill onClick={() => speakKey("v_reminder")}>
            <Volume2 className="size-4" aria-hidden /> {t("play_btn")}
          </Pill>
          <Pill onClick={() => setOpen((o) => !o)}>
            <Plus className="size-4" aria-hidden /> {t("addReminder")}
          </Pill>
        </div>
      </header>

      {open && (
        <Panel>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("addReminder")}
              aria-label={t("addReminder")}
              className="rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              autoFocus
            />
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="6:00 PM"
              aria-label="Time"
              className="rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary sm:w-32"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground"
            >
              {t("addReminder")}
            </button>
            <div className="flex flex-wrap gap-2 sm:col-span-3">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`grid size-11 place-items-center rounded-xl border-2 text-xl transition-colors ${
                    icon === ic ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                  aria-label={`icon ${ic}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        {pending.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">{t("noReminders")}</p>
        ) : (
          <ul>
            {pending.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border-b border-border py-3.5 last:border-0"
              >
                <span className="font-medium">
                  <span className="mr-1 text-lg" aria-hidden>{r.icon}</span> {r.label} · {r.time}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { toggleReminder(r.id); toast(`${r.label}: ${t("markedDone")} ✓`) }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-bold hover:bg-muted"
                  >
                    <Check className="size-4" aria-hidden /> {t("done")}
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`Delete “${r.label}”?`)) { deleteReminder(r.id); toast("Reminder deleted") } }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${r.label}`}
                  >
                    <Trash2 className="size-4" aria-hidden /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {done.length > 0 && (
        <Panel>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t("completed")}
          </h3>
          <ul>
            {done.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border-b border-border py-3 last:border-0"
              >
                <span className="text-muted-foreground line-through">
                  <span className="mr-1" aria-hidden>{r.icon}</span> {r.label} · {r.time}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggleReminder(r.id)} aria-label="undo"><Tag tone="green">✓</Tag></button>
                  <button onClick={() => { if (window.confirm(`Delete “${r.label}”?`)) { deleteReminder(r.id); toast("Reminder deleted") } }} className="rounded-lg p-2 text-destructive hover:bg-destructive/10" aria-label={`Delete ${r.label}`}><Trash2 className="size-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}
