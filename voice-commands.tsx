"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { useApp, type PageId } from "@/components/app-provider"

// Minimal shape of the Web Speech API — not in standard TS lib.dom yet.
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

const NAV_COMMANDS: { keywords: string[]; page: PageId; label: string }[] = [
  { keywords: ["game", "games", "play"], page: "games", label: "games" },
  { keywords: ["memory", "coach"], page: "memory", label: "memory coach" },
  { keywords: ["reminder"], page: "reminders", label: "reminders" },
  { keywords: ["caregiver", "family"], page: "caregiver", label: "caregiver view" },
  { keywords: ["language", "voice setting"], page: "language", label: "language settings" },
  { keywords: ["profile", "setting"], page: "profile", label: "profile" },
  { keywords: ["home", "dashboard", "my day"], page: "dashboard", label: "my day" },
]

export function VoiceCommandButton() {
  const { navigate, speakKey, speak, toast } = useApp()
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recogRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  const handleCommand = useCallback((text: string) => {
    const lower = text.toLowerCase()

    if (lower.includes("read") || lower.includes("repeat") || lower.includes("help")) {
      speakKey("v_welcome")
      toast(`Heard: "${text}"`)
      return
    }

    const match = NAV_COMMANDS.find((c) => c.keywords.some((k) => lower.includes(k)))
    if (match) {
      navigate(match.page)
      toast(`Opening ${match.label}`)
      speak(`Opening ${match.label}`)
      return
    }

    toast(`Didn't catch that: "${text}". Try "open games" or "open reminders".`)
  }, [navigate, speak, speakKey, toast])

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      toast("Voice commands aren't supported in this browser. Try Chrome or Edge.")
      return
    }
    const recog: SpeechRecognitionLike = new SR()
    recog.lang = "en-IN"
    recog.interimResults = false
    recog.maxAlternatives = 1
    recog.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? ""
      if (transcript) handleCommand(transcript)
    }
    recog.onerror = () => setListening(false)
    recog.onend = () => setListening(false)
    recogRef.current = recog
    setListening(true)
    recog.start()
  }, [handleCommand, toast])

  const stop = useCallback(() => {
    recogRef.current?.stop()
    setListening(false)
  }, [])

  if (!supported) return null

  return (
    <button
      onClick={listening ? stop : start}
      aria-label={listening ? "Stop voice command" : "Start voice command"}
      title="Say a command, like 'open games' or 'open reminders'"
      className={`fixed bottom-24 right-6 z-40 grid size-14 place-items-center rounded-full shadow-lg transition-colors ${
        listening ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
      }`}
    >
      {listening ? <MicOff className="size-6" aria-hidden /> : <Mic className="size-6" aria-hidden />}
    </button>
  )
}
