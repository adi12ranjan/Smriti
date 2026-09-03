"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Volume2, CheckCircle2, RotateCcw, Trophy } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel } from "@/components/ui-bits"
import type { TKey } from "@/lib/i18n"
import { SPEECH } from "@/lib/speech-messages"

export type GameType = "memory" | "focus" | "pattern"

const ITEMS = ["🍎", "🍌", "🌸", "🏠", "🕊️", "☕", "🌳", "📻", "🔑", "🧸", "☂️", "🕯️"]
const TOTAL_ROUNDS = 5

type Phase = "memorize" | "choose" | "feedback" | "complete"

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

type Round = {
  prompt: string[] // shown to memorize (memory) or as target/sequence
  answer: string
  choices: string[]
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

// `level` (1–3) sets a difficulty floor; the actual distractor count is
// randomized within a range each round so choices don't feel identical
// round-to-round, while still trending harder as level goes up.
function buildRound(type: GameType, level = 1): Round {
  const extra = level - 1
  const pool = ITEMS
  if (type === "memory") {
    const answer = sample(pool, 1)[0]
    const count = Math.min(pool.length - 1, randomInt(3 + extra, 4 + extra))
    const distractors = sample(pool.filter((x) => x !== answer), count)
    return { prompt: [answer], answer, choices: shuffle([answer, ...distractors]) }
  }
  if (type === "focus") {
    // target shown; find the matching one among choices
    const answer = sample(pool, 1)[0]
    const count = Math.min(pool.length - 1, randomInt(4 + extra, 6 + extra))
    const distractors = sample(pool.filter((x) => x !== answer), count)
    return { prompt: [answer], answer, choices: shuffle([answer, ...distractors]) }
  }
  // pattern: A B A B ? or A A B A A B ? — pick a repeating pattern, answer is next
  const [a, b] = sample(pool, 2)
  const patterns: { seq: string[]; next: string }[] = [
    { seq: [a, b, a, b], next: a },
    { seq: [a, a, b, a, a], next: b },
    { seq: [a, b, b, a, b], next: b },
  ]
  const p = patterns[Math.floor(Math.random() * patterns.length)]
  const count = Math.min(pool.length - 1, randomInt(3 + extra, 4 + extra))
  const distractors = sample(pool.filter((x) => x !== p.next), count)
  return { prompt: p.seq, answer: p.next, choices: shuffle([p.next, ...distractors]) }
}

const META: Record<GameType, { titleKey: TKey; instrKey: TKey; icon: string }> = {
  memory: { titleKey: "g_memory_name", instrKey: "memoryInstruction", icon: "🧠" },
  focus: { titleKey: "g_focus_name", instrKey: "focusInstruction", icon: "🔎" },
  pattern: { titleKey: "g_pattern_name", instrKey: "patternInstruction", icon: "🧩" },
}

export function GamePlay({ type, onExit }: { type: GameType; onExit: () => void }) {
  const { t, speak, addPoints, completeGame, toast, gameLevel } = useApp()
  const meta = META[type]
  const level = gameLevel[type] ?? 1

  const [round, setRound] = useState(1)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [phase, setPhase] = useState<Phase>(type === "memory" ? "memorize" : "choose")
  const [current, setCurrent] = useState<Round>(() => buildRound(type, level))
  const [picked, setPicked] = useState<string | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  // "Ready? Let's get started!" (plus a type-specific intro line and a short
  // countdown) announced once when a session begins, and again on restart.
  const announceStart = useCallback(() => {
    const intro = type === "memory" ? SPEECH.memoryGameIntro : type === "focus" ? SPEECH.focusStart : SPEECH.gameStart
    speak(intro)
    addTimer(() => speak(SPEECH.countdown), 1500)
  }, [type, speak, addTimer])

  useEffect(() => {
    announceStart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Speak the completion line (plus a high-score shout-out, tracked locally
  // per game type) the moment a session wraps up.
  useEffect(() => {
    if (phase !== "complete") return
    const accuracyPct = Math.round((correct / TOTAL_ROUNDS) * 100)
    let isHighScore = false
    try {
      const key = `smriti-highscore-${type}`
      const prevBest = Number(localStorage.getItem(key) || 0)
      if (accuracyPct > prevBest) {
        isHighScore = true
        localStorage.setItem(key, String(accuracyPct))
      }
    } catch {}
    const completeMsg =
      type === "memory" ? SPEECH.memoryComplete : type === "focus" ? SPEECH.focusComplete : t("sessionComplete")
    speak(isHighScore && accuracyPct > 0 ? `${completeMsg} ${SPEECH.highScore}` : completeMsg)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const handleExit = useCallback(() => {
    speak(SPEECH.gameExit)
    onExit()
  }, [speak, onExit])

  // Memory phase: show the object briefly, then reveal choices.
  useEffect(() => {
    if (type === "memory" && phase === "memorize") {
      const id = setTimeout(() => setPhase("choose"), 2200)
      return () => clearTimeout(id)
    }
  }, [type, phase])

  const startNextRound = useCallback(() => {
    setPicked(null)
    setCurrent(buildRound(type, level))
    setPhase(type === "memory" ? "memorize" : "choose")
  }, [type, level])

  const handleAnswer = useCallback(
    (choice: string) => {
      if (phase !== "choose") return
      setPicked(choice)
      setPhase("feedback")
      const isRight = choice === current.answer
      let finalCorrect = correct
      if (isRight) {
        finalCorrect = correct + 1
        setCorrect(finalCorrect)
        setStreak((s) => s + 1)
        addPoints(1)
        toast(`${t("correct")} 👏`)
        speak(t("v_correct"))
      } else {
        setStreak(0)
        toast(`${t("tryAgain")} 🙂`)
      }
      addTimer(() => {
        if (round >= TOTAL_ROUNDS) {
          setPhase("complete")
          completeGame(type, Math.round((finalCorrect / TOTAL_ROUNDS) * 100))
        } else {
          setRound((r) => r + 1)
          startNextRound()
        }
      }, 1050)
    },
    [phase, current.answer, round, correct, addPoints, toast, t, speak, addTimer, completeGame, startNextRound, type],
  )

  const accuracy = useMemo(
    () => Math.round((correct / TOTAL_ROUNDS) * 100),
    [correct],
  )

  const restart = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setRound(1)
    setCorrect(0)
    setStreak(0)
    setPicked(null)
    setCurrent(buildRound(type, level))
    setPhase(type === "memory" ? "memorize" : "choose")
  }, [type, level])

  if (phase === "complete") {
    return (
      <Panel className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-accent/12 text-accent">
          <Trophy className="size-8" aria-hidden />
        </div>
        <h2 className="text-2xl font-extrabold">{t("sessionComplete")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("score")}: {correct}/{TOTAL_ROUNDS}
        </p>
        <div className="my-6">
          <div className="text-5xl font-extrabold text-primary">{accuracy}%</div>
          <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t("accuracy")}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground"
          >
            <RotateCcw className="size-4" aria-hidden /> {t("playAgain")}
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-bold"
          >
            <ArrowLeft className="size-4" aria-hidden /> {t("backToGames")}
          </button>
        </div>
      </Panel>
    )
  }

  const showTarget = type !== "memory" || phase === "memorize"

  return (
    <Panel className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> {t("backToGames")}
        </button>
        <button
          onClick={() => speak(t(meta.instrKey))}
          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold"
        >
          <Volume2 className="size-4" aria-hidden /> {t("readInstructions")}
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-extrabold">
          <span aria-hidden>{meta.icon} </span>
          {t(meta.titleKey)}
        </h2>
        <p className="mt-1 text-muted-foreground">{t(meta.instrKey)}</p>
      </div>

      {/* Stage */}
      <div className="my-6 grid min-h-56 place-items-center rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-card p-6">
        {type === "pattern" ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {current.prompt.map((p, i) => (
              <span key={i} className="text-5xl sm:text-6xl" aria-hidden>
                {p}
              </span>
            ))}
            <span className="grid size-16 place-items-center rounded-2xl border-2 border-dashed border-primary/40 text-3xl font-bold text-primary sm:size-20">
              ?
            </span>
          </div>
        ) : showTarget ? (
          <div className="text-center">
            {type === "focus" && (
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Target
              </p>
            )}
            <span className="text-7xl sm:text-8xl" aria-hidden>
              {current.prompt[0]}
            </span>
            {type === "memory" && phase === "memorize" && (
              <p className="mt-3 animate-pulse text-sm font-bold text-primary">{t("memorize")}</p>
            )}
          </div>
        ) : (
          <span className="text-6xl text-primary/40" aria-hidden>
            ❓
          </span>
        )}
      </div>

      {/* Choices */}
      <div
        className={`grid gap-3 transition-opacity ${
          phase === "memorize" ? "pointer-events-none opacity-40" : "opacity-100"
        } ${current.choices.length > 4 ? "grid-cols-3" : "grid-cols-2"}`}
      >
        {current.choices.map((c, i) => {
          const isAnswer = c === current.answer
          const isPicked = picked === c
          let state = "border-border bg-card hover:border-primary hover:bg-primary/5"
          if (phase === "feedback") {
            if (isAnswer) state = "border-accent bg-accent/12 text-accent"
            else if (isPicked) state = "border-destructive bg-destructive/10 text-destructive"
            else state = "border-border bg-card opacity-60"
          }
          return (
            <button
              key={`${c}-${i}`}
              onClick={() => handleAnswer(c)}
              disabled={phase !== "choose"}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-lg font-extrabold transition-colors ${state}`}
            >
              <span className="text-2xl" aria-hidden>
                {c}
              </span>
              {phase === "feedback" && isAnswer && <CheckCircle2 className="size-5" aria-hidden />}
            </button>
          )
        })}
      </div>

      {/* Score bar */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm font-bold">
        <span>
          {t("round")} {round}/{TOTAL_ROUNDS}
        </span>
        <span className="text-primary">
          {t("score")} {correct}
        </span>
        <span className="text-accent">
          {t("streakLabel")} {streak} {streak > 0 ? "🔥" : ""}
        </span>
        <span className="text-muted-foreground" title="Difficulty adapts to your recent accuracy">
          Level {level}/3
        </span>
      </div>
    </Panel>
  )
}
