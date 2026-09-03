"use client"

import { useState } from "react"
import { Brain, ArrowRight } from "lucide-react"
import { useApp, type Mood } from "@/components/app-provider"
import type { LangCode } from "@/lib/i18n"

const MOODS: Mood[] = [
  { emoji: "😀", label: "Great" },
  { emoji: "😊", label: "Good" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Low" },
]

export function Onboarding() {
  const { languages, saveProfile, speak } = useApp()
  const [name, setName] = useState("")
  const [age, setAge] = useState("60+")
  const [language, setLanguage] = useState<LangCode>("en")
  const [mood, setMood] = useState(MOODS[1])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    saveProfile(name, age, language, mood)
    // The login button is a user action, so this also unlocks browser speech audio.
    speak(`Namaste ${name.trim()}. Your Smriti is ready. Let us start.`)
  }

  return (
    <div className="fixed inset-0 z-50 grid overflow-y-auto bg-background/95 p-4 backdrop-blur-sm sm:p-8">
      <form onSubmit={submit} className="m-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><Brain className="size-6" /></div>
          <div><p className="text-sm font-bold text-primary">Smriti</p><h1 className="text-2xl font-extrabold">Let’s make this personal 👋</h1></div>
        </div>
        <p className="mb-6 text-muted-foreground">Tell us a little about you. We’ll use this to make the app easier and more friendly for you.</p>
        <div className="grid gap-5">
          <label className="grid gap-2"><span className="font-bold">What should we call you?</span><input value={name} onChange={e=>setName(e.target.value)} required autoFocus placeholder="Your name" className="rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" /></label>
          <label className="grid gap-2"><span className="font-bold">Your age group</span><select value={age} onChange={e=>setAge(e.target.value)} className="rounded-2xl border border-border bg-background px-4 py-3"><option>Under 50</option>
            <option>50–55</option>
            <option>56–60</option>
            <option>61–65</option>
            <option>66–70</option>
            <option>71–75</option>
            <option>76–80</option>
            <option>80+</option>
            <option>Prefer not to say</option></select></label>
          <div><p className="mb-2 font-bold">Which language feels easiest?</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{languages.map(l=><button type="button" key={l.code} onClick={()=>setLanguage(l.code)} className={`rounded-2xl border-2 p-3 text-left ${language===l.code?"border-primary bg-primary/10":"border-border"}`}><b>{l.native}</b><small className="block text-muted-foreground">{l.name}</small></button>)}</div></div>
          <div><p className="mb-2 font-bold">How are you feeling today?</p><div className="grid grid-cols-4 gap-2">{MOODS.map(m=><button type="button" key={m.label} onClick={()=>setMood(m)} className={`rounded-2xl border-2 p-3 ${mood.label===m.label?"border-primary bg-primary/10":"border-border"}`}><span className="text-3xl">{m.emoji}</span><small className="mt-1 block font-semibold">{m.label}</small></button>)}</div></div>
        </div>
        <button className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-extrabold text-primary-foreground">Create my Smriti <ArrowRight className="size-5" /></button>
      </form>
    </div>
  )
}
