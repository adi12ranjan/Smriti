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

const STORAGE_KEY = "smriti-profile"
const AUTH_KEY = "smriti-users"
const SESSION_KEY = "smriti-session"

type AuthUser = { username: string; passwordHash: string; displayName: string }

// Simple hash for password storage (not cryptographic — client-side only demo)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}

type AppContextType = {
  lang: LangCode
  setLang: (code: LangCode) => void
  t: (key: TKey) => string
  languages: typeof LANGUAGES
  page: PageId
  navigate: (page: PageId) => void
  speak: (text: string) => void
  speakKey: (key: TKey) => void
  textScale: number
  setTextScale: (v: number) => void
  userName: string
  userAge: string
  onboardingDone: boolean
  saveProfile: (name: string, age: string, language: LangCode, mood: Mood) => void
  reminders: Reminder[]
  toggleReminder: (id: string) => void
  deleteReminder: (id: string) => void
  addReminder: (label: string, time: string, icon: string) => void
  mood: Mood
  cycleMood: () => void
  moods: Mood[]
  setMood: (m: Mood) => void
  toast: (msg: string) => void
  toastMsg: string | null
  score: number
  addPoints: (n: number) => void
  gamesCompleted: number
  completeGame: () => void
  // auth
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  signup: (username: string, password: string, displayName: string) => boolean
  logout: () => void
  authError: string | null
  setAuthError: (e: string | null) => void
  // voice selection
  selectedVoiceName: string | null
  setSelectedVoiceName: (name: string | null) => void
  availableVoices: SpeechSynthesisVoice[]
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
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null)
  const firedReminders = useRef<Record<string, string>>({})
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Voice selection state
  const [selectedVoiceName, setSelectedVoiceNameState] = useState<string | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const voicesLoaded = useRef(false)

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    const load = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0 && !voicesLoaded.current) {
        voicesLoaded.current = true
        setAvailableVoices(voices)
        // Auto-select a good Indian English voice if none selected
        setSelectedVoiceNameState(prev => {
          if (prev) return prev
          // Priority: Google हिन्दी, Google India English, Microsoft Heera, any en-IN
          const preferred =
            voices.find(v => v.name.includes("Google हिन्दी")) ??
            voices.find(v => v.name.toLowerCase().includes("google") && v.lang === "hi-IN") ??
            voices.find(v => v.name.toLowerCase().includes("heera")) ??
            voices.find(v => v.name.toLowerCase().includes("ravi")) ??
            voices.find(v => v.lang === "hi-IN") ??
            voices.find(v => v.lang === "en-IN") ??
            voices.find(v => v.lang.startsWith("en-IN")) ??
            voices.find(v => v.lang.startsWith("en")) ??
            null
          return preferred?.name ?? null
        })
      }
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const setSelectedVoiceName = useCallback((name: string | null) => {
    setSelectedVoiceNameState(name)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const p = raw ? JSON.parse(raw) : {}
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, selectedVoiceName: name }))
    } catch {}
  }, [])

  // Check session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const s = JSON.parse(session)
        if (s.loggedIn && s.username) {
          setIsLoggedIn(true)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p = JSON.parse(raw)
        if (p.name) setUserName(p.name)
        if (p.age) setUserAge(p.age)
        if (p.lang) setLangState(p.lang)
        if (p.mood) setMoodState(p.mood)
        if (p.textScale) setTextScaleState(Number(p.textScale))
        if (p.name) setOnboardingDone(true)
        if (p.selectedVoiceName !== undefined) setSelectedVoiceNameState(p.selectedVoiceName)
      }
    } catch {}
  }, [])

  const login = useCallback((username: string, password: string): boolean => {
    try {
      const usersRaw = localStorage.getItem(AUTH_KEY)
      const users: AuthUser[] = usersRaw ? JSON.parse(usersRaw) : []
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())
      if (!user) { setAuthError("User not found. Please sign up first."); return false }
      if (user.passwordHash !== simpleHash(password)) { setAuthError("Incorrect password."); return false }
      setIsLoggedIn(true)
      setAuthError(null)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, username: user.username }))
      return true
    } catch { setAuthError("Something went wrong. Try again."); return false }
  }, [])

  const signup = useCallback((username: string, password: string, displayName: string): boolean => {
    if (!username.trim() || !password.trim() || !displayName.trim()) {
      setAuthError("All fields are required."); return false
    }
    if (password.length < 4) { setAuthError("Password must be at least 4 characters."); return false }
    try {
      const usersRaw = localStorage.getItem(AUTH_KEY)
      const users: AuthUser[] = usersRaw ? JSON.parse(usersRaw) : []
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        setAuthError("Username already taken. Try another."); return false
      }
      users.push({ username, passwordHash: simpleHash(password), displayName })
      localStorage.setItem(AUTH_KEY, JSON.stringify(users))
      setIsLoggedIn(true)
      setAuthError(null)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, username }))
      return true
    } catch { setAuthError("Something went wrong. Try again."); return false }
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setOnboardingDone(false)
    setUserName("")
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(STORAGE_KEY)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const setTextScale = useCallback((v: number) => {
    const next = Math.max(1, Math.min(1.8, v))
    setTextScaleState(next)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const p = raw ? JSON.parse(raw) : {}
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, textScale: next }))
    } catch {}
  }, [])

  const saveProfile = useCallback((name: string, age: string, language: LangCode, selectedMood: Mood) => {
    setUserName(name.trim())
    setUserAge(age)
    setLangState(language)
    setMoodState(selectedMood)
    setOnboardingDone(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: name.trim(), age, lang: language, mood: selectedMood, textScale }))
  }, [textScale])

  const t = useCallback((key: TKey) => translations[lang][key], [lang])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  // Speak function — uses user-selected voice with Indian accent priority
  const speak = useCallback(
    (text: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        const langInfo = LANGUAGES.find((l) => l.code === lang)
        const speechLang = langInfo?.speechLang ?? "hi-IN"
        u.lang = speechLang

        // Slower, clearer rate for elderly users
        u.rate = 0.82
        u.pitch = 1.0
        u.volume = 1.0

        const voices = window.speechSynthesis.getVoices()

        if (selectedVoiceName) {
          // Use user-selected voice
          const picked = voices.find(v => v.name === selectedVoiceName)
          if (picked) { u.voice = picked }
        } else {
          // Auto-pick best Indian voice
          const wanted = speechLang.toLowerCase()
          u.voice =
            voices.find(v => v.lang.toLowerCase() === wanted) ??
            voices.find(v => v.lang.toLowerCase().startsWith(wanted.split("-")[0])) ??
            voices.find(v => v.lang.toLowerCase().startsWith("hi-in")) ??
            voices.find(v => v.lang.toLowerCase().startsWith("en-in")) ??
            voices[0]
        }

        window.speechSynthesis.speak(u)
      } else {
        toast(text)
      }
    },
    [lang, toast, selectedVoiceName],
  )

  const speakKey = useCallback((key: TKey) => speak(translations[lang][key]), [lang, speak])

  // Reminder checker — fires once per minute when time matches
  useEffect(() => {
    if (!onboardingDone) return
    const check = () => {
      const now = new Date()
      const hh = now.getHours()
      const mm = now.getMinutes()
      const currentKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hh}:${mm}`
      for (const reminder of reminders) {
        if (reminder.done) continue
        const match = reminder.time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
        if (!match) continue
        let hour = Number(match[1])
        const minute = Number(match[2])
        const ampm = match[3]?.toUpperCase()
        if (ampm === "PM" && hour < 12) hour += 12
        if (ampm === "AM" && hour === 12) hour = 0
        if (hour === hh && minute === mm && firedReminders.current[reminder.id] !== currentKey) {
          firedReminders.current[reminder.id] = currentKey
          setActiveReminder(reminder)
        }
      }
    }
    check()
    const id = window.setInterval(check, 1000)
    return () => window.clearInterval(id)
  }, [onboardingDone, reminders])

  // Speak active reminder aloud when it appears
  useEffect(() => {
    if (!activeReminder) return
    const msg = `Reminder: ${activeReminder.label}. It is time now.`
    // Small delay so the popup renders first and user gesture is satisfied
    const id = window.setTimeout(() => speak(msg), 400)
    return () => window.clearTimeout(id)
  }, [activeReminder, speak])

  const setLang = useCallback(
    (code: LangCode) => {
      setLangState(code)
      const name = translations[code].langName
      toast(`${translations[code].languageChanged} ${name}`)
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(translations[code].v_welcome)
        u.lang = LANGUAGES.find((l) => l.code === code)?.speechLang ?? "hi-IN"
        u.rate = 0.82
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
      lang, setLang, t, languages: LANGUAGES, page, navigate,
      speak, speakKey, textScale, setTextScale,
      userName, userAge, onboardingDone, saveProfile,
      reminders, toggleReminder, deleteReminder, addReminder,
      mood, cycleMood, moods: MOODS, setMood,
      toast, toastMsg,
      score, addPoints, gamesCompleted, completeGame,
      isLoggedIn, login, signup, logout, authError, setAuthError,
      selectedVoiceName, setSelectedVoiceName, availableVoices,
    }),
    [
      lang, setLang, t, page, navigate, speak, speakKey, textScale, setTextScale,
      userName, userAge, onboardingDone, saveProfile,
      reminders, toggleReminder, deleteReminder, addReminder,
      mood, cycleMood, setMood, toast, toastMsg,
      score, addPoints, gamesCompleted, completeGame,
      isLoggedIn, login, signup, logout, authError, setAuthError,
      selectedVoiceName, setSelectedVoiceName, availableVoices,
    ],
  )

  return (
    <AppContext.Provider value={value}>
      <div style={{ fontSize: `${textScale}em` }}>{children}</div>

      {/* Reminder Pop-up Notification */}
      {activeReminder && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Reminder notification"
        >
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl border border-primary/20 bg-card p-7 text-center shadow-2xl">
            <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-4xl">
              {activeReminder.icon}
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">!</span>
            </div>
            <p className="mt-5 text-sm font-bold uppercase tracking-widest text-primary">⏰ Reminder</p>
            <h2 className="mt-2 text-2xl font-extrabold">{activeReminder.label}</h2>
            <p className="mt-2 text-muted-foreground">It is time now. Please don't forget!</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1 font-semibold">{activeReminder.time}</span>
            </div>
            <button
              onClick={() => {
                speak(`${activeReminder.label}. It is time now.`)
              }}
              className="mt-5 w-full rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 font-bold text-primary hover:bg-primary/20"
            >
              🔊 Read Again
            </button>
            <button
              onClick={() => { toggleReminder(activeReminder.id); setActiveReminder(null) }}
              className="mt-2 w-full rounded-2xl bg-primary px-5 py-4 font-extrabold text-primary-foreground"
            >
              ✓ Mark as Done
            </button>
            <button
              onClick={() => setActiveReminder(null)}
              className="mt-2 w-full rounded-2xl border border-border px-5 py-3 font-bold hover:bg-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  )
}
