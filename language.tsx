"use client"

import { Volume2, Check } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel, Tag } from "@/components/ui-bits"
import type { TKey } from "@/lib/i18n"

export function Language() {
  const { t, languages, lang, setLang, speakKey } = useApp()

  const voiceItems: { labelKey: TKey; voiceKey: TKey }[] = [
    { labelKey: "readInstructions", voiceKey: "v_instructions" },
    { labelKey: "dailyGreeting", voiceKey: "v_welcome" },
    { labelKey: "reminderAnnounce", voiceKey: "v_reminder" },
    { labelKey: "gameFeedback", voiceKey: "v_correct" },
  ]

  const steps: { tKey: TKey; dKey: TKey }[] = [
    { tKey: "step1t", dKey: "step1d" },
    { tKey: "step2t", dKey: "step2d" },
    { tKey: "step3t", dKey: "step3d" },
    { tKey: "step4t", dKey: "step4d" },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("languageTitle")} <span aria-hidden>🌐</span>
          </h1>
          <p className="mt-1 text-muted-foreground">{t("languageSubtitle")}</p>
        </div>
        <Tag tone="primary">MULTILINGUAL MODE</Tag>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-lg font-bold">{t("choosePreferred")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("choosePreferredText")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {languages.map((l) => {
              const active = lang === l.code
              return (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                    active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-lg font-bold">
                    {l.glyph}
                  </span>
                  <span className="min-w-0">
                    <b className="block">{l.native}</b>
                    <small className="text-muted-foreground">{l.name}</small>
                  </span>
                  {active && <Check className="ml-auto size-5 shrink-0 text-primary" aria-hidden />}
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">{t("voiceAssistance")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("voiceAssistanceText")}</p>
          <ul className="mt-3">
            {voiceItems.map((v) => (
              <li
                key={v.labelKey}
                className="flex items-center justify-between border-b border-border py-3 last:border-0"
              >
                <span className="text-sm font-medium">{t(v.labelKey)}</span>
                <button
                  onClick={() => speakKey(v.voiceKey)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/12 px-3 py-1.5 text-sm font-bold text-primary"
                >
                  <Volume2 className="size-4" aria-hidden /> {t("play_btn")}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-muted/60 p-4">
            <b>{t("accessibilityPrinciple")}</b>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("accessibilityPrincipleText")}</p>
          </div>
        </Panel>
      </div>

      <Panel>
        <h3 className="mb-4 text-lg font-bold">{t("howItWorks")}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.tKey} className="rounded-2xl border border-border bg-muted/40 p-4">
              <b className="text-primary">{t(s.tKey)}</b>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(s.dKey)}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
