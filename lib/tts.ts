// Smriti text-to-speech engine.
//
// Wraps the browser's Web Speech API with the things it does NOT do for you:
//  - picks the best-sounding installed voice for the *current* language
//    (neural / "Natural" / Google / enhanced voices beat robotic defaults),
//  - falls back sensibly (Assamese / Manipuri -> Bengali voice, etc.),
//  - never uses a voice from the wrong language,
//  - splits long text into sentences (Chrome silently cuts speech off after ~15 s),
//  - waits for the voice list to load (Chrome loads it asynchronously),
//  - strips emoji / symbols so they aren't read out loud.

import { LANGUAGES, type LangCode } from "@/lib/i18n"

// Ordered fallback chain of language tags per app language (lower-case, "-" separated).
// Assamese and Manipuri have very few TTS voices, so they fall back to Bengali,
// which shares the same script.
const CHAINS: Record<LangCode, string[]> = {
  en: ["en-in", "en-gb", "en-us", "en"],
  hi: ["hi-in", "hi"],
  bn: ["bn-in", "bn-bd", "bn"],
  as: ["as-in", "as", "bn-in", "bn-bd", "bn"],
  mni: ["mni-in", "mni", "bn-in", "bn-bd", "bn"],
}

// A calm, slightly slow pace is easier to follow; users can change it.
export const DEFAULT_RATE = 0.88
export const MIN_RATE = 0.6
export const MAX_RATE = 1.2

export function ttsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  )
}

const norm = (l: string) => l.toLowerCase().replace(/_/g, "-")

function matchesTag(v: SpeechSynthesisVoice, tag: string): boolean {
  const l = norm(v.lang)
  return l === tag || (!tag.includes("-") && l.startsWith(tag + "-"))
}

// Heuristic "how good does this voice sound" score.
export function voiceQuality(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase()
  let s = 0
  if (/natural|neural/.test(n)) s += 60 // Microsoft Edge neural voices
  if (/online/.test(n)) s += 20
  if (/google/.test(n)) s += 35 // Chrome's network voices
  if (/enhanced|premium|siri/.test(n)) s += 30 // Apple
  if (!v.localService) s += 10
  if (/espeak|compact|novelty|robot|zarvox|trinoids|whisper|bells|bad news|boing|bubbles|cellos|organ|jester/.test(n)) s -= 60
  return s
}

export function isHighQuality(v: SpeechSynthesisVoice): boolean {
  return voiceQuality(v) >= 30
}

// Every installed voice usable for `lang`, best first.
export function voicesForLang(voices: SpeechSynthesisVoice[], lang: LangCode): SpeechSynthesisVoice[] {
  const chain = CHAINS[lang]
  const ranked: { v: SpeechSynthesisVoice; idx: number }[] = []
  const seen = new Set<string>()
  for (const v of voices) {
    const idx = chain.findIndex((tag) => matchesTag(v, tag))
    if (idx === -1) continue
    const key = v.voiceURI || v.name
    if (seen.has(key)) continue
    seen.add(key)
    ranked.push({ v, idx })
  }
  ranked.sort((a, b) => a.idx - b.idx || voiceQuality(b.v) - voiceQuality(a.v))
  return ranked.map((r) => r.v)
}

// The user's chosen voice is honoured only if it belongs to this language;
// otherwise the best installed voice for the language is used.
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: LangCode,
  preferredName?: string | null,
): SpeechSynthesisVoice | null {
  const usable = voicesForLang(voices, lang)
  if (preferredName) {
    const chosen = usable.find((v) => v.name === preferredName)
    if (chosen) return chosen
  }
  return usable[0] ?? null
}

export function voiceLabel(v: SpeechSynthesisVoice): string {
  const tag = isHighQuality(v) ? " ★" : ""
  return `${v.name} (${v.lang})${tag}`
}

// Does this device have a voice that actually speaks this language (not just a fallback)?
export function hasNativeVoice(voices: SpeechSynthesisVoice[], lang: LangCode): boolean {
  const own = CHAINS[lang].slice(0, lang === "as" || lang === "mni" ? 2 : CHAINS[lang].length)
  return voices.some((v) => own.some((tag) => matchesTag(v, tag)))
}

const EMOJI_RE = new RegExp("[\\p{Extended_Pictographic}\\uFE0F\\u200D]", "gu")

function cleanText(text: string): string {
  return text
    .replace(EMOJI_RE, " ")
    .replace(/[*_#`~^|<>]/g, " ")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim()
}

// Break text into sentence-sized chunks (<= ~170 chars) so engines don't cut off.
function chunkText(text: string): string[] {
  if (!text) return []
  const sentences = text.match(/[^.!?।॥\n]+[.!?।॥]*/g) ?? [text]
  const chunks: string[] = []
  let cur = ""
  const push = (s: string) => {
    const t = s.trim()
    if (t) chunks.push(t)
  }
  for (const raw of sentences) {
    const s = raw.trim()
    if (!s) continue
    if (s.length > 170) {
      push(cur)
      cur = ""
      // very long sentence: split on commas / spaces
      let part = ""
      for (const w of s.split(/(?<=,)\s+|\s+/)) {
        if ((part + " " + w).length > 170) {
          push(part)
          part = w
        } else {
          part = part ? part + " " + w : w
        }
      }
      push(part)
    } else if ((cur + " " + s).length > 170) {
      push(cur)
      cur = s
    } else {
      cur = cur ? cur + " " + s : s
    }
  }
  push(cur)
  return chunks
}

function waitForVoices(timeoutMs: number): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    let done = false
    const finish = () => {
      if (done) return
      done = true
      synth.removeEventListener?.("voiceschanged", finish)
      resolve(synth.getVoices())
    }
    synth.addEventListener?.("voiceschanged", finish)
    window.setTimeout(finish, timeoutMs)
  })
}

let activeToken = 0

export function stopSpeaking(): void {
  activeToken++
  if (ttsSupported()) window.speechSynthesis.cancel()
}

export type SpeakOptions = {
  lang: LangCode
  voiceName?: string | null
  rate?: number
  onEnd?: () => void
}

// Speak `text` in the given app language. Returns false if speech isn't supported.
export function speakText(text: string, opts: SpeakOptions): boolean {
  if (!ttsSupported()) return false
  const synth = window.speechSynthesis
  const chunks = chunkText(cleanText(text))
  if (chunks.length === 0) return true

  const token = ++activeToken
  const wasBusy = synth.speaking || synth.pending
  synth.cancel()

  const langTag = LANGUAGES.find((l) => l.code === opts.lang)?.speechLang ?? "en-IN"
  const rate = Math.max(MIN_RATE, Math.min(MAX_RATE, opts.rate ?? DEFAULT_RATE))

  const run = (voices: SpeechSynthesisVoice[]) => {
    if (token !== activeToken) return
    const voice = pickVoice(voices, opts.lang, opts.voiceName)
    let i = 0
    const next = () => {
      if (token !== activeToken) return
      if (i >= chunks.length) {
        opts.onEnd?.()
        return
      }
      const u = new SpeechSynthesisUtterance(chunks[i++])
      u.lang = voice?.lang ?? langTag
      if (voice) u.voice = voice
      u.rate = rate
      u.pitch = 1
      u.volume = 1
      u.onend = () => next()
      u.onerror = (e) => {
        if (e.error === "canceled" || e.error === "interrupted") return
        next()
      }
      synth.speak(u)
    }
    next()
  }

  const start = () => {
    const voices = synth.getVoices()
    if (voices.length > 0) run(voices)
    else void waitForVoices(1500).then(run) // Chrome loads voices lazily
  }

  // Chrome can drop a speak() issued in the same tick as cancel() of active speech.
  // Only delay in that case so the first tap still counts as a user gesture (iOS Safari).
  if (wasBusy) window.setTimeout(start, 60)
  else start()
  return true
}
