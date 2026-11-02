"use client"

import { Volume2, Check } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel, Tag } from "@/components/ui-bits"
import type { TKey } from "@/lib/i18n"
import {
  speakText,
  stopSpeaking,
  ONLINE_VOICE,
  voicesForLang,
  pickVoice,
  voiceLabel,
  hasNativeVoice,
  ttsSupported,
  MIN_RATE,
  MAX_RATE,
} from "@/lib/tts"
import { voiceLine } from "@/lib/voice-i18n"

export function Language() {
  const {
    t, languages, lang, setLang, speakKey,
    availableVoices, selectedVoiceName, setSelectedVoiceName, voiceRate, setVoiceRate, toast,
  } = useApp()

  const langVoices = voicesForLang(availableVoices, lang)
  const activeVoice = pickVoice(availableVoices, lang, selectedVoiceName)
  const nativeVoice = hasNativeVoice(availableVoices, lang)
  const canOnline = lang !== "en"
  // Non-English with no local voice for the language (or online chosen) -> online voice.
  const pickedLocal = !!selectedVoiceName && langVoices.some((v) => v.name === selectedVoiceName)
  const selectValue =
    canOnline && (selectedVoiceName === ONLINE_VOICE || (!nativeVoice && !pickedLocal))
      ? ONLINE_VOICE
      : activeVoice?.name ?? ""
  const previewVoice = (voiceName: string | null, rate: number) =>
    speakText(voiceLine(lang, "welcome"), {
      lang,
      voiceName,
      rate,
      onError: () => toast("Voice could not play. Check your internet connection and device sound."),
    })

  const voiceItems: { labelKey: TKey; voiceKey: TKey }[] = [
    { labelKey: "readInstructions", voiceKey: "v_instructions" },
    { labelKey: "dailyGreeting", voiceKey: "v_welcome" },
    { labelKey: "reminderAnnounce", voiceKey: "v_reminder" },
    { labelKey: "gameFeedback", voiceKey: "v_correct" },
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

      {ttsSupported() && (
        <Panel>
          <h3 className="text-lg font-bold">Voice &amp; speed</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the voice that sounds clearest to you. Voices marked ★ are the most natural.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Voice
              <select
                className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 text-base"
                value={selectValue}
                disabled={langVoices.length === 0 && !canOnline}
                onChange={(e) => {
                  setSelectedVoiceName(e.target.value)
                  previewVoice(e.target.value, voiceRate)
                }}
              >
                {langVoices.length === 0 && !canOnline && <option value="">No voice installed</option>}
                {canOnline && <option value={ONLINE_VOICE}>Online voice (works on every device) ★</option>}
                {langVoices.map((v) => (
                  <option key={v.voiceURI || v.name} value={v.name}>
                    {voiceLabel(v)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Speaking speed: {voiceRate.toFixed(2)}×
              <input
                type="range"
                min={MIN_RATE}
                max={MAX_RATE}
                step={0.05}
                value={voiceRate}
                onChange={(e) => setVoiceRate(Number(e.target.value))}
                onPointerUp={() => previewVoice(selectedVoiceName, voiceRate)}
                onKeyUp={() => previewVoice(selectedVoiceName, voiceRate)}
                className="mt-3 w-full accent-primary"
                aria-label="Speaking speed"
              />
              <span className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>Slower</span>
                <span>Faster</span>
              </span>
            </label>
          </div>
          {canOnline && !nativeVoice && (
            <p className="mt-3 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
              This device has no installed voice for this language, so Smriti uses the online voice
              (needs internet). If it can&apos;t connect, the closest installed voice is used instead.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => previewVoice(selectedVoiceName, voiceRate)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/12 px-4 py-2 text-sm font-bold text-primary"
            >
              <Volume2 className="size-4" aria-hidden /> Test voice
            </button>
            <button
              onClick={stopSpeaking}
              className="rounded-lg border border-border px-4 py-2 text-sm font-bold"
            >
              Stop
            </button>
          </div>
        </Panel>
      )}
    </div>
  )
}
