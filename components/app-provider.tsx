"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { LANGUAGES, translations, type LangCode, type TKey } from "@/lib/i18n"

export type Reminder = {
  id: string
  icon: string
  label: string
  time: string
  done: boolean
}

export type PageId =
  | "dashboard"
  | "games"
  | "memory"
  | "reminders"
  | "language"
  | "caregiver"
  | "profile"

export type Mood = { emoji: string; label: string }

const MOODS: Mood[] = [
  { emoji: "😀", label: "Great" },
  { emoji: "😊", label: "Good" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Low" },
]

const INITIAL_REMINDERS: Reminder[] = [
  { id: "r1", icon: "💊", label: "Blood pressure medicine", time: "6:00 PM", done: false },
  { id: "r2", icon: "💧", label: "Drink water", time: "6:30 PM", done: false },
  { id: "r3", icon: "🚶", label: "Evening walk", time: "7:00 PM", done: false },
  { id: "r4", icon: "👨‍⚕️", label: "Doctor appointment", time: "Sun, 10:30 AM", done: false },
]

type AppContextType = {
  lang: LangCode
  setLang: (code: LangCode) => void
  t: (key: TKey) => string
  languages: typeof LANGUAGES
  page: PageId
  navigate: (page: PageId) => void
  // voice
  speak: (text: string) => void
  speakKey: (key: TKey) => void
  textScale: number
  setTextScale: (v: number) => void
  userName: string
  userAge: string
  onboardingDone: boolean
  saveProfile: (name: string, age: string, language: LangCode, mood: Mood) => void
  // reminders
  reminders: Reminder[]
  toggleReminder: (id: string) => void
  deleteReminder: (id: string) => void
  addReminder: (label: string, time: string, icon: string) => void
  // mood
  mood: Mood
  cycleMood: () => void
  moods: Mood[]
  setMood: (m: Mood) => void
  // toast
  toast: (msg: string) => void
  toastMsg: string | null
  // score
  score: number
  addPoints: (n: number) => void
  gamesCompleted: number
  completeGame: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en")
  const [page, setPage] = useState<PageId>("dashboard")
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS)
  const [mood, setMoodState] = useState<Mood>(MOODS[1])
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [score, setScore] = useState(78)
  const [gamesCompleted, setGamesCompleted] = useState(3)
  const [textScale, setTextScaleState] = useState(1)
  const [userName, setUserName] = useState("")
  const [userAge, setUserAge] = useState("")
  const [onboardingDone, setOnboardingDone] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mind-sathi-profile")
      if (raw) {
        const p = JSON.parse(raw)
        if (p.name) setUserName(p.name)
        if (p.age) setUserAge(p.age)
        if (p.lang) setLangState(p.lang)
        if (p.mood) setMoodState(p.mood)
        if (p.textScale) setTextScaleState(Number(p.textScale))
        if (p.name) setOnboardingDone(true)
      }
    } catch {}
  }, [])

  const setTextScale = useCallback((v: number) => {
    const next = Math.max(1, Math.min(1.8, v))
    setTextScaleState(next)
    try {
      const raw = localStorage.getItem("mind-sathi-profile")
      const p = raw ? JSON.parse(raw) : {}
      localStorage.setItem("mind-sathi-profile", JSON.stringify({ ...p, textScale: next }))
    } catch {}
  }, [])

  const saveProfile = useCallback((name: string, age: string, language: LangCode, selectedMood: Mood) => {
    setUserName(name.trim())
    setUserAge(age)
    setLangState(language)
    setMoodState(selectedMood)
    setOnboardingDone(true)
    localStorage.setItem("mind-sathi-profile", JSON.stringify({ name: name.trim(), age, lang: language, mood: selectedMood, textScale }))
  }, [textScale])

  const t = useCallback((key: TKey) => translations[lang][key], [lang])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        const langInfo = LANGUAGES.find((l) => l.code === lang)
        u.lang = langInfo?.speechLang ?? "en-IN"
        u.rate = 0.9
        window.speechSynthesis.speak(u)
      } else {
        toast(text)
      }
    },
    [lang, toast],
  )

  const speakKey = useCallback((key: TKey) => speak(translations[lang][key]), [lang, speak])

  const setLang = useCallback(
    (code: LangCode) => {
      setLangState(code)
      const name = translations[code].langName
      toast(`${translations[code].languageChanged} ${name}`)
      // Speak welcome in the newly selected language
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(translations[code].v_welcome)
        u.lang = LANGUAGES.find((l) => l.code === code)?.speechLang ?? "en-IN"
        u.rate = 0.9
        window.speechSynthesis.speak(u)
      }
    },
    [toast],
  )

  const navigate = useCallback((p: PageId) => {
    setPage(p)
    if (typeof window !== "undefined") window.scrollTo(0, 0)
  }, [])

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))
  }, [])

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addReminder = useCallback((label: string, time: string, icon: string) => {
    setReminders((prev) => [
      ...prev,
      { id: `r${Date.now()}`, icon: icon || "⏰", label, time, done: false },
    ])
  }, [])

  const cycleMood = useCallback(() => {
    setMoodState((prev) => {
      const idx = MOODS.findIndex((m) => m.label === prev.label)
      return MOODS[(idx + 1) % MOODS.length]
    })
  }, [])

  const setMood = useCallback((m: Mood) => setMoodState(m), [])

  const addPoints = useCallback((n: number) => {
    setScore((s) => Math.min(100, s + n))
  }, [])

  const completeGame = useCallback(() => setGamesCompleted((g) => Math.min(4, g + 1)), [])

  const value = useMemo<AppContextType>(
    () => ({
      lang,
      setLang,
      t,
      languages: LANGUAGES,
      page,
      navigate,
      speak,
      speakKey,
      textScale,
      setTextScale,
      userName,
      userAge,
      onboardingDone,
      saveProfile,
      reminders,
      toggleReminder,
      deleteReminder,
      addReminder,
      mood,
      cycleMood,
      moods: MOODS,
      setMood,
      toast,
      toastMsg,
      score,
      addPoints,
      gamesCompleted,
      completeGame,
    }),
    [
      lang, setLang, t, page, navigate, speak, speakKey, textScale, setTextScale, userName, userAge,
      onboardingDone, saveProfile, reminders, toggleReminder, deleteReminder, addReminder, mood, cycleMood, setMood, toast, toastMsg,
      score, addPoints, gamesCompleted, completeGame,
    ],
  )

  return (
    <AppContext.Provider value={value}>
      <div style={{ fontSize: `${textScale}em` }}>{children}</div>
    </AppContext.Provider>
  )
}
