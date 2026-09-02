"use client"

import { Volume2, Type, WifiOff, Languages, Minus, Plus, Contrast, Award } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel, Tag, Pill } from "@/components/ui-bits"

type Badge = { icon: string; label: string; description: string; earned: boolean }

function computeBadges(gamesCompleted: number, streak: number, score: number): Badge[] {
  return [
    { icon: "🌱", label: "First Steps", description: "Complete your first game", earned: gamesCompleted >= 1 },
    { icon: "🎮", label: "Getting Started", description: "Complete 5 games", earned: gamesCompleted >= 5 },
    { icon: "🏅", label: "Dedicated Player", description: "Complete 20 games", earned: gamesCompleted >= 20 },
    { icon: "🔥", label: "3-Day Streak", description: "Stay active 3 days in a row", earned: streak >= 3 },
    { icon: "⭐", label: "Week Warrior", description: "Stay active 7 days in a row", earned: streak >= 7 },
    { icon: "🧠", label: "High Scorer", description: "Reach a score of 90+", earned: score >= 90 },
  ]
}

export function Profile() {
  const {
    t, speakKey, textScale, setTextScale, navigate, lang, languages,
    highContrast, setHighContrast, gamesCompleted, streak, score,
  } = useApp()
  const currentLang = languages.find((l) => l.code === lang)
  const badges = computeBadges(gamesCompleted, streak, score)
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t("profileTitle")} <span aria-hidden>⚙️</span>
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">{t("profileSubtitle")}</p>
      </header>

      <Panel className="max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <Award className="size-5 text-primary" aria-hidden />
          <h3 className="text-lg font-bold">Achievements</h3>
          <Tag tone="primary">{earnedCount}/{badges.length}</Tag>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.label}
              title={b.description}
              className={`rounded-2xl border-2 p-3 text-center transition-opacity ${
                b.earned ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30 opacity-50"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <b className="mt-1 block text-sm">{b.label}</b>
              <small className="text-xs text-muted-foreground">{b.description}</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="max-w-2xl">
        <div className="flex items-center justify-between border-b border-border py-4">
          <span className="flex items-center gap-3 font-bold">
            <Volume2 className="size-5 text-primary" aria-hidden /> {t("voiceAssist")}
          </span>
          <Pill onClick={() => speakKey("v_welcome")}>{t("testVoice")}</Pill>
        </div>

        <div className="border-b border-border py-4">
          <div className="flex items-center gap-3 font-bold"><Type className="size-5 text-primary" aria-hidden /> {t("largeText")}</div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => setTextScale(textScale - 0.1)} className="grid size-10 place-items-center rounded-xl border border-border" aria-label="Decrease text size"><Minus className="size-4" /></button>
            <input aria-label="Text magnification" type="range" min="1" max="1.8" step="0.1" value={textScale} onChange={e => setTextScale(Number(e.target.value))} className="w-full accent-primary" />
            <button onClick={() => setTextScale(textScale + 0.1)} className="grid size-10 place-items-center rounded-xl border border-border" aria-label="Increase text size"><Plus className="size-4" /></button>
          </div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground"><span>Normal</span><b className="text-primary">{Math.round(textScale * 100)}%</b><span>Very large</span></div>
          <p className="mt-2 text-xs text-muted-foreground">Move the slider to make words easier to read. The size is saved for your next visit.</p>
        </div>

        <div className="border-b border-border py-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3 font-bold">
              <Contrast className="size-5 text-primary" aria-hidden /> High contrast
            </span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              role="switch"
              aria-checked={highContrast}
              className={`relative h-8 w-14 rounded-full transition-colors ${highContrast ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-1 size-6 rounded-full bg-card shadow transition-transform ${
                  highContrast ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Stronger colors and text for easier reading in bright light or with low vision.</p>
        </div>

        <div className="flex items-center justify-between border-b border-border py-4">
          <span className="flex items-center gap-3 font-bold">
            <WifiOff className="size-5 text-primary" aria-hidden /> {t("offlineMode")}
          </span>
          <Tag tone="green">{t("ready")}</Tag>
        </div>

        <div className="flex items-center justify-between py-4">
          <span className="flex items-center gap-3 font-bold">
            <Languages className="size-5 text-primary" aria-hidden /> {t("language")}
          </span>
          <Pill onClick={() => navigate("language")}>
            {currentLang?.native} · {t("change")}
          </Pill>
        </div>
      </Panel>
    </div>
  )
}
