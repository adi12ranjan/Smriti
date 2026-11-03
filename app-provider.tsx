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
import { reminderVoiceLine } from "@/lib/voice-lines"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

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

export type MoodEntry = { date: string; mood: Mood }

export type ActivityEntry = {
  id: string
  type: "game" | "reminder" | "mood"
  label: string
  timestamp: number
  value?: number
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
  { id: "r1", icon: "💊", label: "Blood pressure medicine", time: "6:00 PM", done: false },
  { id: "r2", icon: "💧", label: "Drink water", time: "6:30 PM", done: false },
  { id: "r3", icon: "🚶", label: "Evening walk", time: "7:00 PM", done: false },
  { id: "r4", icon: "👨‍⚕️", label: "Doctor appointment", time: "Sun, 10:30 AM", done: false },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

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
  completeGame: (label: string, accuracyPct?: number) => void
  // auth
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, displayName: string) => Promise<boolean>
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)

  // Voice
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

  // Debounce timer for Firestore saves
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataLoaded = useRef(false)

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    const load = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0 && !voicesLoaded.current) {
        voicesLoaded.current = true
        setAvailableVoices(voices)
        setSelectedVoiceNameState(prev => {
          if (prev) return prev
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
    dataLoaded.current = false
  }, [])

  // Load user data from Firestore
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "users", uid))
      if (snap.exists()) {
        const d = snap.data() as Partial<PersistedData>
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
    dataLoaded.current = true
  }, [resetLocalState])

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user)
        setIsLoggedIn(true)
        loadUserData(user.uid)
      } else {
        setFirebaseUser(null)
        setIsLoggedIn(false)
        resetLocalState()
      }
    })
    return unsub
  }, [loadUserData, resetLocalState])

  // Save user data to Firestore (debounced 1.5 s)
  useEffect(() => {
    if (!firebaseUser || !dataLoaded.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
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
        await setDoc(doc(db, "users", firebaseUser.uid), blob, { merge: true })
      } catch (e) {
        console.error("Firestore save error:", e)
      }
    }, 1500)
  }, [
    firebaseUser, userName, userAge, lang, mood, textScale, selectedVoiceName, highContrast,
    reminders, moodHistory, activityLog, caregiverContact, shoutouts, gameLevel, score, gamesCompleted,
  ])

  const setSelectedVoiceName = useCallback((name: string | null) => {
    setSelectedVoiceNameState(name)
  }, [])

  // ── Firebase Auth helpers ─────────────────────────────────────────────────

  // Convert Firebase auth error codes to friendly messages
  function friendlyError(code: string): string {
    switch (code) {
      case "auth/email-already-in-use": return "Email already in use. Try logging in."
      case "auth/invalid-email":        return "Invalid email address."
      case "auth/weak-password":        return "Password must be at least 6 characters."
      case "auth/user-not-found":       return "No account found. Please sign up first."
      case "auth/wrong-password":       return "Incorrect password."
      case "auth/invalid-credential":   return "Incorrect email or password."
      case "auth/too-many-requests":    return "Too many attempts. Please try again later."
      default:                          return "Something went wrong. Please try again."
    }
  }

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setAuthError(null)
      return true
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ""
      setAuthError(friendlyError(code))
      return false
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, displayName: string): Promise<boolean> => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setAuthError("All fields are required."); return false
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: displayName.trim() })
      setAuthError(null)
      return true
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ""
      setAuthError(friendlyError(code))
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    resetLocalState()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [resetLocalState])

  // ── Everything else unchanged from original ───────────────────────────────

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

  const speak = useCallback(
    (text: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        const langInfo = LANGUAGES.find((l) => l.code === lang)
        const speechLang = langInfo?.speechLang ?? "hi-IN"
        u.lang = speechLang
        u.rate = 0.82
        u.pitch = 1.0
        u.volume = 1.0
        const voices = window.speechSynthesis.getVoices()
        if (selectedVoiceName) {
          const picked = voices.find(v => v.name === selectedVoiceName)
          if (picked) { u.voice = picked }
        } else {
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

  useEffect(() => {
    if (!activeReminder) return
    const msg = reminderVoiceLine(activeReminder.icon, activeReminder.label)
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
      if (target && !target.done) { logActivity("reminder", target.label) }
      return prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    })
  }, [logActivity])

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addReminder = useCallback((label: string, time: string, icon: string) => {
    setReminders((prev) => [
      ...prev,
      { id: `r${Date.now()}`, icon: icon || "⏰", label, time, done: false },
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
      return prev
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
            <p className="mt-2 text-muted-foreground">It is time now. Please don&apos;t forget!</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1 font-semibold">{activeReminder.time}</span>
            </div>
            <button
              onClick={() => { speak(reminderVoiceLine(activeReminder.icon, activeReminder.label)) }}
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
