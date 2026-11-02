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
let currentAudio: HTMLAudioElement | null = null

// Special "voice name" meaning: use the online voice service (/api/tts) instead of
// the voices installed on the device. Works on any device with internet, which is
// how Hindi / Bengali / Assamese / Manipuri are spoken where no local voice exists.
export const ONLINE_VOICE = "__online__"

export function stopSpeaking(): void {
  activeToken++
  if (currentAudio) {
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio.pause()
    currentAudio = null
  }
  if (ttsSupported()) window.speechSynthesis.cancel()
}

export type SpeakOptions = {
  lang: LangCode
  voiceName?: string | null
  rate?: number
  onEnd?: () => void
  // called when no voice at all could speak the text
  onError?: () => void
}

// Online voice sources for one chunk, tried in order:
//  1. straight from the speech service (an <audio> tag isn't blocked by CORS and
//     uses the user's own connection, which works best),
//  2. our own /api/tts server route (in case the direct call is blocked).
// Assamese tries its own voice first, then Bengali; Manipuri (written in Bengali
// script in this app) uses the Bengali voice.
const ONLINE_TL: Record<LangCode, string[]> = {
  en: ["en-IN"],
  hi: ["hi"],
  bn: ["bn"],
  as: ["as", "bn"],
  mni: ["bn"],
}

function onlineSources(lang: LangCode, text: string): string[] {
  const q = encodeURIComponent(text)
  const direct = ONLINE_TL[lang].map(
    (tl) =>
      `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${q}&total=1&idx=0&textlen=${text.length}`,
  )
  return [...direct, `/api/tts?lang=${lang}&q=${q}`]
}

// Play chunks through the online voice service. Calls onFail(remaining) if a chunk
// can't be loaded/played from any source so the caller can fall back to a device voice.
function playOnline(
  chunks: string[],
  lang: LangCode,
  rate: number,
  token: number,
  onEnd: (() => void) | undefined,
  onFail: (remaining: string[]) => void,
) {
  let i = 0
  const next = () => {
    if (token !== activeToken) return
    if (i >= chunks.length) {
      currentAudio = null
      onEnd?.()
      return
    }
    const sources = onlineSources(lang, chunks[i])
    let s = 0
    const tryNext = () => {
      if (token !== activeToken) return
      if (s >= sources.length) {
        onFail(chunks.slice(i))
        return
      }
      const a = new Audio(sources[s++])
      currentAudio = a
      a.playbackRate = Math.max(0.6, Math.min(1.4, rate / DEFAULT_RATE))
      a.onended = () => {
        i++
        next()
      }
      a.onerror = () => tryNext()
      a.play().catch((err: unknown) => {
        // Autoplay blocked: trying other sources won't help.
        if ((err as { name?: string })?.name === "NotAllowedError") {
          if (token === activeToken) onFail(chunks.slice(i))
        } else {
          tryNext()
        }
      })
    }
    tryNext()
  }
  next()
}

// Speak `text` in the given app language. Returns false if nothing can speak.
export function speakText(text: string, opts: SpeakOptions): boolean {
  const synthOk = ttsSupported()
  const chunks = chunkText(cleanText(text))
  if (chunks.length === 0) return true
  if (!synthOk && typeof Audio === "undefined") return false

  const token = ++activeToken
  const synth = synthOk ? window.speechSynthesis : null
  const wasBusy = !!synth && (synth.speaking || synth.pending)
  if (currentAudio) {
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio.pause()
    currentAudio = null
  }
  synth?.cancel()

  const langTag = LANGUAGES.find((l) => l.code === opts.lang)?.speechLang ?? "en-IN"
  const rate = Math.max(MIN_RATE, Math.min(MAX_RATE, opts.rate ?? DEFAULT_RATE))

  const runSynth = (list: string[], voices: SpeechSynthesisVoice[]) => {
    if (!synth || token !== activeToken) return
    const voice = pickVoice(voices, opts.lang, opts.voiceName)
    let i = 0
    const next = () => {
      if (token !== activeToken) return
      if (i >= list.length) {
        opts.onEnd?.()
        return
      }
      const u = new SpeechSynthesisUtterance(list[i++])
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
    const voices = synth ? synth.getVoices() : []
    const chosen = opts.voiceName && opts.voiceName !== ONLINE_VOICE
      ? voices.find((v) => v.name === opts.voiceName)
      : undefined
    const nonEnglish = opts.lang !== "en"
    // Use the online voice for non-English when asked for, or when the device has
    // no voice for the language (or voices haven't loaded / speech is unsupported).
    const useOnline =
      typeof Audio !== "undefined" &&
      nonEnglish &&
      (opts.voiceName === ONLINE_VOICE ||
        !synth ||
        (!chosen && !hasNativeVoice(voices, opts.lang)))

    if (useOnline) {
      playOnline(chunks, opts.lang, rate, token, opts.onEnd, (remaining) => {
        // Online voice unavailable (offline etc.): fall back to the closest device voice.
        if (token !== activeToken) return
        const voices = synth ? synth.getVoices() : []
        if (synth && pickVoice(voices, opts.lang, opts.voiceName)) runSynth(remaining, voices)
        else opts.onError?.()
      })
      return
    }
    if (voices.length > 0) runSynth(chunks, voices)
    else void waitForVoices(1500).then((v) => runSynth(chunks, v)) // Chrome loads voices lazily
  }

  // Chrome can drop a speak() issued in the same tick as cancel() of active speech.
  // Only delay in that case so the first tap still counts as a user gesture (iOS Safari).
  if (wasBusy) window.setTimeout(start, 60)
  else start()
  return true
}
