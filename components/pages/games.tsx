 "use client"

import { useEffect, useMemo, useState } from "react"
import { Clock3, RotateCcw, Trophy, Upload, Users } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { Panel } from "@/components/ui-bits"
import { GamePlay, type GameType } from "@/components/game-play"
import type { TKey } from "@/lib/i18n"

const GAMES: { key: GameType; icon: string; nameKey: TKey; descKey: TKey }[] = [
  { key: "memory", icon: "🧠", nameKey: "g_memory_name", descKey: "g_memory_desc" },
  { key: "focus", icon: "🔎", nameKey: "g_focus_name", descKey: "g_focus_desc" },
  { key: "pattern", icon: "🧩", nameKey: "g_pattern_name", descKey: "g_pattern_desc" },
]

type Family = { name: string; photo: string }

export function Games() {
  const { t, userName } = useApp()
  const [active, setActive] = useState<GameType | "sprint" | "family" | null>(null)
  if (active === "sprint") return <MindSprint onExit={() => setActive(null)} />
  if (active === "family") return <FamilyGame onExit={() => setActive(null)} />
  if (active) {
    return <GamePlay type={active} onExit={() => setActive(null)} />
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("gamesTitle")} <span aria-hidden>🎮</span></h1>
        <p className="mt-1 text-muted-foreground">{userName ? `Hi ${userName}! ` : ""}{t("gamesSubtitle")}</p>
      </header>
      <Panel>
        <div className="grid gap-3 sm:grid-cols-3">
          {GAMES.map((g) => (
            <div key={g.key} className="rounded-2xl border border-border bg-muted/40 p-5">
              <div className="text-4xl">{g.icon}</div>
              <b className="mt-3 block text-lg">{t(g.nameKey)}</b>
              <p className="mt-1 text-sm text-muted-foreground">{t(g.descKey)}</p>
              <button onClick={() => setActive(g.key)} className="mt-4 w-full rounded-xl bg-primary py-3 font-extrabold text-primary-foreground">{t("start")}</button>
            </div>
          ))}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
            <div className="text-4xl">⚡</div><b className="mt-3 block text-lg">Mind Sprint</b>
            <p className="mt-1 text-sm text-muted-foreground">Remember more pictures as the level goes up. Each set stays on screen for 5 seconds.</p>
            <button onClick={() => setActive("sprint")} className="mt-4 w-full rounded-xl bg-primary py-3 font-extrabold text-primary-foreground">Start challenge</button>
          </div>
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
            <div className="text-4xl">👨‍👩‍👧‍👦</div><b className="mt-3 block text-lg">Family Name Challenge</b>
            <p className="mt-1 text-sm text-muted-foreground">Upload family photos and name them. You'll see a photo and pick the right name from 4 similar-looking options.</p>
            <button onClick={() => setActive("family")} className="mt-4 w-full rounded-xl bg-primary py-3 font-extrabold text-primary-foreground">Set up game</button>
          </div>
        </div>
      </Panel>
    </div>
  )
}

const SPRINT_IMAGES = [
  { src: "/mind-sprint/apple.svg", label: "Apple" },
  { src: "/mind-sprint/flower.svg", label: "Flower" },
  { src: "/mind-sprint/key.svg", label: "Key" },
  { src: "/mind-sprint/star.svg", label: "Star" },
  { src: "/mind-sprint/house.svg", label: "House" },
  { src: "/mind-sprint/butterfly.svg", label: "Butterfly" },
  { src: "/mind-sprint/cup.svg", label: "Cup" },
  { src: "/mind-sprint/tree.svg", label: "Tree" },
]

type SprintImage = typeof SPRINT_IMAGES[number]

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function MindSprint({ onExit }: { onExit: () => void }) {
  const { addPoints, completeGame, toast } = useApp()
  const [sequence, setSequence] = useState<SprintImage[]>([])
  const [choices, setChoices] = useState<SprintImage[]>([])
  const [phase, setPhase] = useState<"show"|"answer"|"done">("show")
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)

  const levelSize = Math.min(8, round + 1)
  const targetIndex = levelSize - 1

  function startLevel(level = 1) {
    setRound(level)
    setSequence(shuffle(SPRINT_IMAGES).slice(0, Math.min(8, level + 1)))
    setChoices([])
    setPhase("show")
  }

  useEffect(() => { startLevel(1) }, [])

  useEffect(() => {
    if (phase !== "show" || sequence.length === 0) return
    const id = window.setTimeout(() => {
      const answer = sequence[targetIndex]
      setChoices(shuffle([answer, ...shuffle(SPRINT_IMAGES.filter(x => x.src !== answer.src)).slice(0, 3)]))
      setPhase("answer")
    }, 5000)
    return () => window.clearTimeout(id)
  }, [phase, sequence, targetIndex])

  function answer(choice: SprintImage) {
    if (phase !== "answer") return
    const right = choice.src === sequence[targetIndex]?.src
    if (right) {
      setScore(s => s + 1)
      addPoints(2)
      toast("Correct! Very good.")
    } else toast(`Good try. The answer was ${sequence[targetIndex]?.label}.`)
    if (round >= 7) {
      setPhase("done")
      completeGame()
    } else {
      startLevel(round + 1)
    }
  }

  if (phase === "done") {
    return (
      <Panel className="mx-auto max-w-2xl text-center">
        <Trophy className="mx-auto size-14 text-primary"/>
        <h2 className="mt-3 text-3xl font-extrabold">Mind Sprint complete!</h2>
        <p className="mt-2 text-muted-foreground">You got <b>{score}</b> levels right.</p>
        <div className="my-6 text-5xl font-extrabold text-primary">{score}/7</div>
        <div className="flex justify-center gap-3">
          <button onClick={()=>{setScore(0);startLevel(1)}} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground"><RotateCcw className="size-4"/>Play again</button>
          <button onClick={onExit} className="rounded-xl border border-border px-5 py-3 font-bold">Back</button>
        </div>
      </Panel>
    )
  }

  return (
    <Panel className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="font-semibold text-muted-foreground">← Back to games</button>
        <span className="font-extrabold text-primary">Level {round}/7</span>
      </div>
      <div className="mt-5 text-center">
        <h2 className="text-2xl font-extrabold">⚡ Mind Sprint</h2>
        <p className="text-muted-foreground">Level {round}: remember these {levelSize} pictures.</p>
      </div>
      <div className="my-6 min-h-64 rounded-3xl border-2 border-dashed border-primary/30 bg-muted/30 p-5">
        {phase === "show" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {sequence.map((item, i) => (
              <div key={item.src} className="rounded-2xl border border-border bg-card p-3 text-center">
                <img src={item.src} alt={item.label} className="mx-auto h-28 w-full object-contain" />
                <span className="mt-1 block text-sm font-bold">{i + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center text-center">
            <div><b className="text-lg">Which picture was number {targetIndex + 1}?</b><p className="mt-2 text-5xl">❓</p></div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {choices.map((item) => (
          <button key={item.src} onClick={() => answer(item)} className="rounded-2xl border-2 border-border bg-card p-3 hover:border-primary">
            <img src={item.src} alt={item.label} className="mx-auto h-24 w-full object-contain" />
          </button>
        ))}
      </div>
      {phase === "show" && <p className="mt-3 text-center text-sm font-semibold text-muted-foreground">Pictures stay on screen for 5 seconds.</p>}
    </Panel>
  )
}

// Generate similar-sounding / similar-looking name distractors
function generateSimilarNames(correctName: string, allNames: string[]): string[] {
  // Priority 1: use other real family names from the game
  const otherRealNames = allNames.filter(n => n !== correctName)
  
  // Priority 2: generate phonetically similar names
  const nameParts = correctName.trim().split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]

  // Common Indian name prefixes/suffixes for realistic distractors
  const indianPrefixes = ["Raj", "Ram", "Rani", "Ravi", "Sita", "Gita", "Anita", "Sunita",
    "Amit", "Anil", "Priya", "Pooja", "Vijay", "Ajay", "Sanjay", "Manoj",
    "Deepa", "Reena", "Seema", "Meena", "Neha", "Sneha", "Rekha", "Usha",
    "Mohan", "Sohan", "Rohan", "Kishan", "Krishan", "Suresh", "Mahesh", "Rakesh",
    "Geeta", "Savita", "Kavita", "Sunita", "Babita", "Lalita", "Mamta", "Shanta"]
  
  const generated: string[] = []

  // Mutate the first name slightly
  const vowelSwap = (s: string) => s.replace(/[aeiou]/i, m => ({a:"e",e:"a",i:"ee",o:"u",u:"o"}[m.toLowerCase()]||m))
  const addSuffix = (s: string) => s + (s.endsWith("a") ? "s" : "a")
  const swapChar = (s: string) => {
    if (s.length < 3) return s + "i"
    const i = Math.floor(s.length / 2)
    return s.slice(0, i) + (s[i] === "a" ? "e" : "a") + s.slice(i + 1)
  }

  generated.push(vowelSwap(firstName) + (lastName && lastName !== firstName ? " " + lastName : ""))
  generated.push(addSuffix(firstName) + (lastName && lastName !== firstName ? " " + lastName : ""))
  generated.push(swapChar(firstName) + (lastName && lastName !== firstName ? " " + lastName : ""))
  generated.push(indianPrefixes[Math.floor(Math.random() * indianPrefixes.length)] + (lastName && lastName !== firstName ? " " + lastName : ""))
  generated.push(firstName + " " + indianPrefixes[Math.floor(Math.random() * indianPrefixes.length)])

  // Combine real other names + generated, remove duplicates and correct answer
  const pool = [...otherRealNames, ...generated]
    .filter(n => n.toLowerCase() !== correctName.toLowerCase())
    .filter(n => n.trim().length > 0)
  
  // Deduplicate
  const seen = new Set<string>()
  const unique: string[] = []
  for (const n of pool) {
    const key = n.toLowerCase().trim()
    if (!seen.has(key)) { seen.add(key); unique.push(n) }
  }

  // Shuffle and take 3
  return shuffle(unique).slice(0, 3)
}

function FamilyGame({ onExit }: { onExit: () => void }) {
  const { addPoints, completeGame, toast, speak } = useApp()
  const [family, setFamily] = useState<Family[]>(() => {
    try { return JSON.parse(localStorage.getItem("smriti-family") || "[]") } catch { return [] }
  })
  const [names, setNames] = useState<string[]>(Array(5).fill(""))
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [time, setTime] = useState(10)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [rounds, setRounds] = useState<Family[]>([])
  // choices are now name strings (not Family objects)
  const [nameChoices, setNameChoices] = useState<string[]>([])
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    if (!active || answered) return
    const id = setInterval(() => setTime(t => {
      if (t <= 1) { handleNext(); return 10 }
      return t - 1
    }), 1000)
    return () => clearInterval(id)
  }, [active, index, answered])

  function makeNameChoices(target: Family, all: Family[]) {
    const allNames = all.map(f => f.name)
    const similar = generateSimilarNames(target.name, allNames)
    // Make sure we have exactly 3 distractors
    while (similar.length < 3) {
      similar.push(`Person ${similar.length + 1}`)
    }
    return shuffle([target.name, ...similar.slice(0, 3)])
  }

  function handleNext() {
    setAnswered(false)
    setLastCorrect(null)
    if (index + 1 >= rounds.length) {
      setFinished(true); setActive(false); completeGame()
    } else {
      const nextIndex = index + 1
      setIndex(nextIndex)
      setNameChoices(makeNameChoices(rounds[nextIndex], rounds))
      setTime(10)
    }
  }

  function choose(name: string) {
    if (!active || answered) return
    const correct = name === rounds[index].name
    setAnswered(true)
    setLastCorrect(correct)
    if (correct) {
      setScore(s => s + 1)
      addPoints(2)
      speak("Bilkul sahi! Bahut badhiya.") // "Absolutely correct! Very good." in Hindi
      toast("✓ Correct! Well done.")
    } else {
      speak(`Koi baat nahi. Yeh ${rounds[index].name} hai.`) // "No problem. This is [name]."
      toast(`Good try! This is ${rounds[index].name}.`)
    }
    // Auto-advance after 1.5 seconds
    setTimeout(() => handleNext(), 1500)
  }

  async function file(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const copy = [...family]
      copy[i] = { name: names[i] || `Person ${i + 1}`, photo: String(reader.result) }
      setFamily(copy)
      setNames(a => { const n=[...a]; n[i]=copy[i].name; return n })
    }
    reader.readAsDataURL(f)
  }

  function start() {
    const ready = family.filter(x => x?.photo && x?.name)
    if (ready.length < 4) {
      toast("Please add at least 4 family members with names and photos.")
      return
    }
    localStorage.setItem("smriti-family", JSON.stringify(ready))
    const shuffled = shuffle(ready)
    setRounds(shuffled)
    setIndex(0)
    setNameChoices(makeNameChoices(shuffled[0], shuffled))
    setScore(0)
    setTime(10)
    setFinished(false)
    setAnswered(false)
    setLastCorrect(null)
    setActive(true)
  }

  if (active) return (
    <Panel className="mx-auto max-w-2xl text-center">
      <div className="flex items-center justify-between">
        <button onClick={()=>setActive(false)} className="font-semibold text-muted-foreground">← Exit</button>
        <span className={`font-extrabold ${time <= 3 ? "text-red-500 animate-pulse" : "text-primary"}`}>⏱️ {time}s</span>
      </div>
      <h2 className="mt-4 text-2xl font-extrabold">Who is this? 🤔</h2>
      <p className="text-muted-foreground">Round {index+1}/{rounds.length} · Pick the correct name</p>
      <div className="my-5 overflow-hidden rounded-3xl border bg-muted/20 p-4">
        <img src={rounds[index].photo} alt="Family member" className="mx-auto h-64 w-full object-contain rounded-2xl"/>
      </div>
      {/* Show 4 NAME choices as text buttons — similar names for extra challenge */}
      <div className="grid grid-cols-2 gap-3">
        {nameChoices.map(name => (
          <button
            key={name}
            onClick={() => choose(name)}
            disabled={answered}
            className={`rounded-2xl border-2 px-4 py-5 font-extrabold text-lg transition-all ${
              answered
                ? name === rounds[index].name
                  ? "border-green-500 bg-green-50 text-green-700"
                  : lastCorrect === false && name !== rounds[index].name
                  ? "border-red-300 bg-red-50 text-red-500 opacity-60"
                  : "border-border bg-card opacity-40"
                : "border-border bg-card hover:border-primary hover:bg-primary/5"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      {answered && (
        <p className={`mt-4 rounded-xl py-2 px-4 font-bold ${lastCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {lastCorrect ? "✓ Correct!" : `✗ It was: ${rounds[index].name}`}
        </p>
      )}
    </Panel>
  )

  if (finished) return (
    <Panel className="mx-auto max-w-2xl text-center">
      <Trophy className="mx-auto size-14 text-primary"/>
      <h2 className="mt-3 text-3xl font-extrabold">Great memory! 🎉</h2>
      <p className="mt-2 text-muted-foreground">You remembered {score} of {rounds.length} family members correctly.</p>
      <div className="my-4 text-5xl font-extrabold text-primary">{score}/{rounds.length}</div>
      <div className="flex justify-center gap-3">
        <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground"><RotateCcw className="size-4"/>Play again</button>
        <button onClick={onExit} className="rounded-xl border border-border px-5 py-3 font-bold">Back to games</button>
      </div>
    </Panel>
  )

  return (
    <Panel className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-extrabold">👨‍👩‍👧‍👦 Family Name Challenge</h2><p className="text-muted-foreground">Add 4–5 family photos with names. Photos stay in this browser.</p></div>
        <button onClick={onExit} className="rounded-xl border border-border px-4 py-2 font-bold">Back</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Array.from({length:5},(_,i)=>(
          <div key={i} className="rounded-2xl border border-border p-4">
            <div className="mb-3 flex items-center gap-3"><Users className="size-5 text-primary"/><b>Person {i+1}</b></div>
            <input
              value={names[i]}
              onChange={e=>{const n=[...names];n[i]=e.target.value;setNames(n);setFamily(f=>{const c=[...f];if(c[i])c[i]={...c[i],name:e.target.value};return c})}}
              placeholder="Full name (e.g. Ramesh Kumar)"
              className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2"
            />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 p-3 font-bold text-primary">
              <Upload className="size-4"/> {family[i]?.photo ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={e=>file(e,i)}/>
            </label>
            {family[i]?.photo&&<img src={family[i].photo} alt={family[i].name} className="mt-3 h-28 w-full rounded-xl object-cover"/>}
          </div>
        ))}
      </div>
      <button onClick={start} className="mt-5 w-full rounded-2xl bg-primary py-4 font-extrabold text-primary-foreground">Start Family Name Challenge</button>
      <p className="mt-2 text-center text-xs text-muted-foreground">Each question shows a photo with 4 name choices — 1 correct + 3 similar-sounding distractors.</p>
    </Panel>
  )
}
