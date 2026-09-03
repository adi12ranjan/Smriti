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
import { SPEECH, reminderSpeech, guessReminderKind, type ReminderKind } from "@/lib/speech-messages"

export type Reminder = {
  id: string
  icon: string
  label: string
  time: string
  done: boolean
  kind?: ReminderKind
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

export type MoodEntry = { date: string; mood: Mood }

export type ActivityEntry = {
  id: string
  type: "game" | "reminder" | "mood"
  label: string
  timestamp: number
  value?: number // e.g. accuracy % for games
}

export type CaregiverContact = { name: string; phone: string }

export type Shoutout = { id: string; text: string; timestamp: number }

const MOODS: Mood[] = [
  { emoji: "😀", label: "Great" },
  { emoji: "😊", label: "Good" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Low" },
]

const INITIAL_REMINDERS: Reminder[] = [
  { id: "r1", icon: "💊", label: "Blood pressure medicine", time: "6:00 PM", done: false, kind: "medicine" },
  { id: "r2", icon: "💧", label: "Drink water", time: "6:30 PM", done: false, kind: "water" },
  { id: "r3", icon: "🚶", label: "Evening walk", time: "7:00 PM", done: false, kind: "walk" },
  { id: "r4", icon: "👨‍⚕️", label: "Doctor appointment", time: "Sun, 10:30 AM", done: false, kind: "doctor" },
]

// All per-user app data lives under one namespaced key so different accounts
// on the same browser never collide, and logging out never destroys it.
function dataKey(username: string) {
  return `smriti-data:${username.toLowerCase()}`
}

const AUTH_KEY = "smriti-users"
const SESSION_KEY = "smriti-session"

type AuthUser = { username: string; passwordHash: string; displayName: string }

type PersistedData = {
  name: string
  age: string
  lang: LangCode
  mood: Mood
  textScale: number
  selectedVoiceName: string | null
  highContrast: boolean
  reminders: Reminder[]
  moodHistory: MoodEntry[]
  activityLog: ActivityEntry[]
  caregiverContact: CaregiverContact
  shoutouts: Shoutout[]
  gameLevel: Record<string, number>
  score: number
  gamesCompleted: number
}

// Simple hash for password storage (not cryptographic — client-side only demo)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// How many consecutive days (ending today or yesterday) have any logged activity.
function computeStreak(log: ActivityEntry[]): number {
  if (log.length === 0) return 0
  const days = new Set(log.map((e) => new Date(e.timestamp).toISOString().slice(0, 10)))
  let streak = 0
  const d = new Date()
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
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
  addReminder: (label: string, time: string, icon: string, kind?: ReminderKind) => void
  mood: Mood
  cycleMood: () => void
  moods: Mood[]
  setMood: (m: Mood) => void
  toast: (msg: string) => void
  toastMsg: string | null
  score: number
  addPoints: (n: number) => void
  gamesCompleted: number
  completeGame: (label: string, accuracyPct?: number) => void
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
  // accessibility
  highContrast: boolean
  setHighContrast: (v: boolean) => void
  // history / insight
  moodHistory: MoodEntry[]
  activityLog: ActivityEntry[]
  streak: number
  gameLevel: Record<string, number>
  // caregiver
  caregiverContact: CaregiverContact
  setCaregiverContact: (c: CaregiverContact) => void
  shoutouts: Shoutout[]
  addShoutout: (text: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

const DEFAULT_CAREGIVER_CONTACT: CaregiverContact = { name: "", phone: "" }

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en")
  const [page, setPage] = useState<PageId>("dashboard")
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS)
  const [mood, setMoodState] = useState<Mood>(MOODS[1])
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [score, setScore] = useState(78)
  const [gamesCompleted, setGamesCompleted] = useState(0)
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
  const [username, setUsername] = useState<string | null>(null)

  // Voice selection state
  const [selectedVoiceName, setSelectedVoiceNameState] = useState<string | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const voicesLoaded = useRef(false)

  // Accessibility
  const [highContrast, setHighContrastState] = useState(false)

  // History / insight
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([])
  const [gameLevel, setGameLevel] = useState<Record<string, number>>({})

  // Caregiver
  const [caregiverContact, setCaregiverContactState] = useState<CaregiverContact>(DEFAULT_CAREGIVER_CONTACT)
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([])

  const loadedUserRef = useRef<string | null>(null)

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

  // Reset all per-user state back to defaults (used when switching accounts / brand-new signup)
  const resetLocalState = useCallback(() => {
    setUserName("")
    setUserAge("")
    setLangState("en")
    setMoodState(MOODS[1])
    setTextScaleState(1)
    setSelectedVoiceNameState(null)
    setHighContrastState(false)
    setReminders(INITIAL_REMINDERS)
    setMoodHistory([])
    setActivityLog([])
    setGameLevel({})
    setCaregiverContactState(DEFAULT_CAREGIVER_CONTACT)
    setShoutouts([])
    setScore(78)
    setGamesCompleted(0)
    setOnboardingDone(false)
  }, [])

  // Load one user's saved data blob into in-memory state
  const loadUserData = useCallback((uname: string) => {
    try {
      const raw = localStorage.getItem(dataKey(uname))
      if (raw) {
        const d: Partial<PersistedData> = JSON.parse(raw)
        setUserName(d.name ?? "")
        setUserAge(d.age ?? "")
        if (d.lang) setLangState(d.lang)
        if (d.mood) setMoodState(d.mood)
        if (d.textScale) setTextScaleState(Number(d.textScale))
        setSelectedVoiceNameState(d.selectedVoiceName ?? null)
        setHighContrastState(!!d.highContrast)
        setReminders(Array.isArray(d.reminders) ? d.reminders : INITIAL_REMINDERS)
        setMoodHistory(Array.isArray(d.moodHistory) ? d.moodHistory : [])
        setActivityLog(Array.isArray(d.activityLog) ? d.activityLog : [])
        setGameLevel(d.gameLevel ?? {})
        setCaregiverContactState(d.caregiverContact ?? DEFAULT_CAREGIVER_CONTACT)
        setShoutouts(Array.isArray(d.shoutouts) ? d.shoutouts : [])
        setScore(typeof d.score === "number" ? d.score : 78)
        setGamesCompleted(typeof d.gamesCompleted === "number" ? d.gamesCompleted : 0)
        setOnboardingDone(!!d.name)
      } else {
        resetLocalState()
      }
    } catch {
      resetLocalState()
    }
    loadedUserRef.current = uname
  }, [resetLocalState])

  // Check session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const s = JSON.parse(session)
        if (s.loggedIn && s.username) {
          setIsLoggedIn(true)
          setUsername(s.username)
          loadUserData(s.username)
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist the current user's data as a single blob whenever anything relevant changes.
  useEffect(() => {
    if (!username) return
    // Avoid writing a half-loaded state over real data on the very first render after switching users.
    if (loadedUserRef.current !== username) return
    const blob: PersistedData = {
      name: userName,
      age: userAge,
      lang,
      mood,
      textScale,
      selectedVoiceName,
      highContrast,
      reminders,
      moodHistory,
      activityLog,
      caregiverContact,
      shoutouts,
      gameLevel,
      score,
      gamesCompleted,
    }
    try {
      localStorage.setItem(dataKey(username), JSON.stringify(blob))
    } catch {}
  }, [
    username, userName, userAge, lang, mood, textScale, selectedVoiceName, highContrast,
    reminders, moodHistory, activityLog, caregiverContact, shoutouts, gameLevel, score, gamesCompleted,
  ])

  const setSelectedVoiceName = useCallback((name: string | null) => {
    setSelectedVoiceNameState(name)
  }, [])

  const login = useCallback((usernameInput: string, password: string): boolean => {
    try {
      const usersRaw = localStorage.getItem(AUTH_KEY)
      const users: AuthUser[] = usersRaw ? JSON.parse(usersRaw) : []
      const user = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase())
      if (!user) { setAuthError("User not found. Please sign up first."); return false }
      if (user.passwordHash !== simpleHash(password)) { setAuthError("Incorrect password."); return false }
      loadUserData(user.username)
      setIsLoggedIn(true)
      setUsername(user.username)
      setAuthError(null)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, username: user.username }))
      return true
    } catch { setAuthError("Something went wrong. Try again."); return false }
  }, [loadUserData])

  const signup = useCallback((usernameInput: string, password: string, displayName: string): boolean => {
    if (!usernameInput.trim() || !password.trim() || !displayName.trim()) {
      setAuthError("All fields are required."); return false
    }
    if (password.length < 4) { setAuthError("Password must be at least 4 characters."); return false }
    try {
      const usersRaw = localStorage.getItem(AUTH_KEY)
      const users: AuthUser[] = usersRaw ? JSON.parse(usersRaw) : []
      if (users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase())) {
        setAuthError("Username already taken. Try another."); return false
      }
      users.push({ username: usernameInput, passwordHash: simpleHash(password), displayName })
      localStorage.setItem(AUTH_KEY, JSON.stringify(users))
      resetLocalState()
      loadedUserRef.current = usernameInput
      setIsLoggedIn(true)
      setUsername(usernameInput)
      setAuthError(null)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, username: usernameInput }))
      return true
    } catch { setAuthError("Something went wrong. Try again."); return false }
  }, [resetLocalState])

  const logout = useCallback(() => {
    // Only the session ends here — the user's saved data stays under their
    // own key so signing back in restores everything exactly as it was.
    setIsLoggedIn(false)
    setUsername(null)
    loadedUserRef.current = null
    resetLocalState()
    localStorage.removeItem(SESSION_KEY)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [resetLocalState])

  const setTextScale = useCallback((v: number) => {
    const next = Math.max(1, Math.min(1.8, v))
    setTextScaleState(next)
  }, [])

  const setHighContrast = useCallback((v: boolean) => setHighContrastState(v), [])

  const saveProfile = useCallback((name: string, age: string, language: LangCode, selectedMood: Mood) => {
    setUserName(name.trim())
    setUserAge(age)
    setLangState(language)
    setMoodState(selectedMood)
    setOnboardingDone(true)
  }, [])

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
    const msg = reminderSpeech(activeReminder.kind, activeReminder.label)
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

  const logActivity = useCallback((type: ActivityEntry["type"], label: string, value?: number) => {
    setActivityLog((prev) => [
      { id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, type, label, timestamp: Date.now(), value },
      ...prev,
    ].slice(0, 200))
  }, [])

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const target = prev.find((r) => r.id === id)
      if (target && !target.done) {
        logActivity("reminder", target.label)
      }
      return prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    })
  }, [logActivity])

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addReminder = useCallback((label: string, time: string, icon: string, kind?: ReminderKind) => {
    setReminders((prev) => [
      ...prev,
      { id: `r${Date.now()}`, icon: icon || "⏰", label, time, done: false, kind: kind ?? guessReminderKind(label) },
    ])
  }, [])

  const applyMood = useCallback((m: Mood) => {
    setMoodState(m)
    const today = todayKey()
    setMoodHistory((prev) => {
      const others = prev.filter((e) => e.date !== today)
      return [...others, { date: today, mood: m }].slice(-90)
    })
  }, [])

  const cycleMood = useCallback(() => {
    setMoodState((prev) => {
      const idx = MOODS.findIndex((m) => m.label === prev.label)
      const next = MOODS[(idx + 1) % MOODS.length]
      applyMood(next)
      return prev // applyMood already updates state; avoid double-set
    })
  }, [applyMood])

  const setMood = useCallback((m: Mood) => applyMood(m), [applyMood])

  const addPoints = useCallback((n: number) => {
    setScore((s) => Math.min(100, s + n))
  }, [])

  const completeGame = useCallback((label: string, accuracyPct?: number) => {
    setGamesCompleted((g) => g + 1)
    logActivity("game", label, accuracyPct)
    if (accuracyPct !== undefined && (label === "memory" || label === "focus" || label === "pattern")) {
      setGameLevel((prev) => {
        const cur = prev[label] ?? 1
        let next = cur
        if (accuracyPct >= 80) next = Math.min(3, cur + 1)
        else if (accuracyPct < 50) next = Math.max(1, cur - 1)
        return { ...prev, [label]: next }
      })
    }
  }, [logActivity])

  const setCaregiverContact = useCallback((c: CaregiverContact) => {
    setCaregiverContactState(c)
  }, [])

  const addShoutout = useCallback((text: string) => {
    if (!text.trim()) return
    setShoutouts((prev) => [{ id: `s${Date.now()}`, text: text.trim(), timestamp: Date.now() }, ...prev].slice(0, 20))
  }, [])

  const streak = useMemo(() => computeStreak(activityLog), [activityLog])

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
      highContrast, setHighContrast,
      moodHistory, activityLog, streak, gameLevel,
      caregiverContact, setCaregiverContact, shoutouts, addShoutout,
    }),
    [
      lang, setLang, t, page, navigate, speak, speakKey, textScale, setTextScale,
      userName, userAge, onboardingDone, saveProfile,
      reminders, toggleReminder, deleteReminder, addReminder,
      mood, cycleMood, setMood, toast, toastMsg,
      score, addPoints, gamesCompleted, completeGame,
      isLoggedIn, login, signup, logout, authError, setAuthError,
      selectedVoiceName, setSelectedVoiceName, availableVoices,
      highContrast, setHighContrast,
      moodHistory, activityLog, streak, gameLevel,
      caregiverContact, setCaregiverContact, shoutouts, addShoutout,
    ],
  )

  return (
    <AppContext.Provider value={value}>
      <div className={highContrast ? "high-contrast" : ""} style={{ fontSize: `${textScale}em` }}>{children}</div>

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
                speak(reminderSpeech(activeReminder.kind, activeReminder.label))
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
