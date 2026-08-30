"use client"

import { Volume2, Type, WifiOff, Languages, Minus, Plus } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel, Tag, Pill } from "@/components/ui-bits"

export function Profile() {
  const { t, speakKey, textScale, setTextScale, toast, navigate, lang, languages } = useApp()
  const currentLang = languages.find((l) => l.code === lang)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t("profileTitle")} <span aria-hidden>⚙️</span>
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">{t("profileSubtitle")}</p>
      </header>

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
