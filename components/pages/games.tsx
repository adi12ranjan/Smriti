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
  const { t, userName, addPoints, completeGame, toast } = useApp()
  const [active, setActive] = useState<GameType | "sprint" | "family" | null>(null)
  if (active === "sprint") return <MindSprint onExit={() => setActive(null)} />
  if (active === "family") return <FamilyGame onExit={() => setActive(null)} />
  if (active) return <GamePlay type={active} onExit={() => setActive(null)} />

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("gamesTitle")} <span aria-hidden>🎮</span></h1>
        <p className="mt-1 text-muted-foreground">{userName ? `Hi ${userName}! ` : ""}{t("gamesSubtitle")}</p>
      </header>
      <Panel>
        <div className="grid gap-3 sm:grid-cols-3">
          {GAMES.map((g) => <div key={g.key} className="rounded-2xl border border-border bg-muted/40 p-5"><div className="text-4xl">{g.icon}</div><b className="mt-3 block text-lg">{t(g.nameKey)}</b><p className="mt-1 text-sm text-muted-foreground">{t(g.descKey)}</p><button onClick={() => setActive(g.key)} className="mt-4 w-full rounded-xl bg-primary py-3 font-extrabold text-primary-foreground">{t("start")}</button></div>)}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5"><div className="text-4xl">⚡</div><b className="mt-3 block text-lg">Mind Sprint</b><p className="mt-1 text-sm text-muted-foreground">45 seconds of fast memory, attention and rule-switching challenges.</p><button onClick={() => setActive("sprint")} className="mt-4 w-full rounded-xl bg-primary py-3 font-extrabold text-primary-foreground">Start challenge</button></div>
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5"><div className="text-4xl">👨‍👩‍👧‍👦</div><b className="mt-3 block text-lg">Family Name Challenge</b><p className="mt-1 text-sm text-muted-foreground">Upload 5 family photos and remember who is who against the clock.</p><button onClick={() => setActive("family")} className="mt-4 w-full rounded-xl bg-primary py-3 font-extrabold text-primary-foreground">Set up game</button></div>
        </div>
      </Panel>
    </div>
  )
}

function MindSprint({ onExit }: { onExit: () => void }) {
  const { addPoints, completeGame, toast } = useApp()
  const symbols = useMemo(() => ["🍎","🌸","🔑","⭐","🏠","🦋","☕","🌳"], [])
  const [sequence, setSequence] = useState(() => Array.from({length:4}, () => symbols[Math.floor(Math.random()*symbols.length)]))
  const [choices, setChoices] = useState<string[]>([])
  const [phase, setPhase] = useState<"show"|"answer"|"done">("show")
  const [time, setTime] = useState(45)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [target, setTarget] = useState(0)

  function nextRound() {
    const len = Math.min(7, 3 + round)
    const seq = Array.from({length:len}, () => symbols[Math.floor(Math.random()*symbols.length)])
    setSequence(seq); setTarget(len - 1); setChoices([]); setPhase("show")
  }
  useEffect(() => { if (phase !== "show") return; const id=setTimeout(()=>{setChoices(Array.from(new Set([sequence[target], ...symbols])).sort(()=>Math.random()-.5).slice(0,6));setPhase("answer")}, Math.max(900, 2200-round*180)); return ()=>clearTimeout(id) }, [phase, round, symbols])
  useEffect(() => { if (phase === "done") return; const id=setInterval(()=>setTime(t=>{if(t<=1){setPhase("done");return 0} return t-1}),1000); return ()=>clearInterval(id)},[phase])
  function answer(v:string) {
    if (phase !== "answer") return
    const right = v === sequence[target]
    if (right) { setScore(s=>s+1); addPoints(2); toast("Correct! 🔥") } else toast("Close! Keep going 🙂")
    if (round >= 7 || time <= 3) setPhase("done")
    else { setRound(r=>r+1); nextRound() }
  }
  if (phase === "done") return <Panel className="mx-auto max-w-2xl text-center"><Trophy className="mx-auto size-14 text-primary"/><h2 className="mt-3 text-3xl font-extrabold">Mind Sprint complete!</h2><p className="mt-2 text-muted-foreground">You scored <b>{score}</b> correct answers in {45-time} seconds.</p><div className="my-6 text-5xl font-extrabold text-primary">{score}/7</div><div className="flex justify-center gap-3"><button onClick={()=>{setTime(45);setRound(1);setScore(0);setSequence(Array.from({length:4},()=>symbols[Math.floor(Math.random()*symbols.length)]));setPhase("show")}} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground"><RotateCcw className="size-4"/>Play again</button><button onClick={onExit} className="rounded-xl border border-border px-5 py-3 font-bold">Back</button></div></Panel>
  return <Panel className="mx-auto max-w-2xl"><div className="flex items-center justify-between"><button onClick={onExit} className="font-semibold text-muted-foreground">← Back to games</button><span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 font-extrabold text-primary"><Clock3 className="size-4"/> {time}s</span></div><div className="mt-5 text-center"><h2 className="text-2xl font-extrabold">⚡ Mind Sprint</h2><p className="text-muted-foreground">Round {round}/7 · Remember the sequence, then pick the requested item.</p></div><div className="my-6 grid min-h-48 place-items-center rounded-3xl border-2 border-dashed border-primary/30 bg-muted/30 p-6">{phase==="show" ? <div className="flex flex-wrap justify-center gap-3">{sequence.map((s,i)=><span key={i} className="text-5xl">{s}</span>)}</div> : <div className="text-center"><b className="text-sm uppercase tracking-wide text-muted-foreground">What was item #{target+1}?</b><p className="mt-2 text-4xl">❓</p></div>}</div><div className="grid grid-cols-3 gap-3">{choices.map((c,i)=><button key={i} onClick={()=>answer(c)} className="rounded-2xl border-2 border-border bg-card p-4 text-4xl hover:border-primary">{c}</button>)}</div></Panel>
}

function FamilyGame({ onExit }: { onExit: () => void }) {
  const { addPoints, completeGame, toast } = useApp()
  const [family, setFamily] = useState<Family[]>(() => { try{return JSON.parse(localStorage.getItem("mind-sathi-family")||"[]")}catch{return []} })
  const [names, setNames] = useState<string[]>(Array(5).fill(""))
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [time, setTime] = useState(7)
  const [score, setScore] = useState(0)
  const [answer, setAnswer] = useState("")
  const [finished, setFinished] = useState(false)
  const [rounds, setRounds] = useState<Family[]>([])
  useEffect(()=>{ if(!active) return; const id=setInterval(()=>setTime(t=>{if(t<=1){next();return 7}return t-1}),1000); return ()=>clearInterval(id)},[active,index])
  function next(){ if(index+1>=rounds.length){setFinished(true);setActive(false);completeGame()} else {setIndex(i=>i+1);setTime(7);setAnswer("")} }
  function choose(n:string){ if(!active) return; if(n===rounds[index].name){setScore(s=>s+1);addPoints(2);toast("Correct! 🎉")} else toast(`It was ${rounds[index].name}`); next() }
  async function file(e: React.ChangeEvent<HTMLInputElement>, i:number){const f=e.target.files?.[0]; if(!f)return; const reader=new FileReader(); reader.onload=()=>{const copy=[...family];copy[i]={name:names[i]||`Person ${i+1}`,photo:String(reader.result)};setFamily(copy);setNames(a=>{const n=[...a];n[i]=copy[i].name;return n});};reader.readAsDataURL(f)}
  function start(){const ready=family.filter(x=>x?.photo && x?.name);if(ready.length<2){toast("Please add at least 2 family members");return} localStorage.setItem("mind-sathi-family",JSON.stringify(ready));setRounds([...ready].sort(()=>Math.random()-.5));setIndex(0);setScore(0);setTime(7);setFinished(false);setActive(true)}
  if(active) return <Panel className="mx-auto max-w-2xl text-center"><div className="flex items-center justify-between"><button onClick={()=>setActive(false)} className="font-semibold text-muted-foreground">← Exit</button><span className="font-extrabold text-primary">⏱️ {time}s</span></div><h2 className="mt-4 text-2xl font-extrabold">Who is this?</h2><p className="text-muted-foreground">Round {index+1}/{rounds.length}</p><div className="my-5 overflow-hidden rounded-3xl border bg-muted/20 p-4"><img src={rounds[index].photo} alt="Family member" className="mx-auto h-64 w-full object-contain rounded-2xl"/></div><div className="grid grid-cols-2 gap-3">{rounds.map(r=><button key={r.name} onClick={()=>choose(r.name)} className="rounded-xl border-2 border-border bg-card p-3 font-extrabold hover:border-primary">{r.name}</button>)}</div></Panel>
  if(finished) return <Panel className="mx-auto max-w-2xl text-center"><Trophy className="mx-auto size-14 text-primary"/><h2 className="mt-3 text-3xl font-extrabold">Great memory! 🎉</h2><p className="mt-2 text-muted-foreground">You remembered {score} of {rounds.length} family members.</p><button onClick={onExit} className="mt-6 rounded-xl bg-primary px-6 py-3 font-extrabold text-primary-foreground">Back to games</button></Panel>
  return <Panel className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-extrabold">👨‍👩‍👧‍👦 Family Name Challenge</h2><p className="text-muted-foreground">Add up to 5 photos. They stay in this browser.</p></div><button onClick={onExit} className="rounded-xl border border-border px-4 py-2 font-bold">Back</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{Array.from({length:5},(_,i)=><div key={i} className="rounded-2xl border border-border p-4"><div className="mb-3 flex items-center gap-3"><Users className="size-5 text-primary"/><b>Person {i+1}</b></div><input value={names[i]} onChange={e=>{const n=[...names];n[i]=e.target.value;setNames(n);setFamily(f=>{const c=[...f];if(c[i])c[i]={...c[i],name:e.target.value};return c})}} placeholder="Name" className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2"/><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 p-3 font-bold text-primary"><Upload className="size-4"/> {family[i]?.photo ? "Change photo" : "Upload photo"}<input type="file" accept="image/*" className="hidden" onChange={e=>file(e,i)}/></label>{family[i]?.photo&&<img src={family[i].photo} alt={family[i].name} className="mt-3 h-28 w-full rounded-xl object-cover"/>}</div>)}</div><button onClick={start} className="mt-5 w-full rounded-2xl bg-primary py-4 font-extrabold text-primary-foreground">Start 7-second challenge</button></Panel>
}
