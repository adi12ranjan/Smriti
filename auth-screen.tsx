"use client"

import { useState } from "react"
import { Brain, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from "lucide-react"
import { useApp } from "@/components/app-provider"
import { VOICE } from "@/lib/voice-lines"

export function AuthScreen() {
  const { login, signup, authError, setAuthError, speak } = useApp()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setLoading(true)
    if (mode === "login") {
      const ok = await login(email.trim(), password)
      if (ok) speak(VOICE.welcome)
    } else {
      await signup(email.trim(), password, displayName.trim())
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 grid overflow-y-auto bg-gradient-to-br from-primary/10 via-background to-background p-4 sm:p-8">
      <form
        onSubmit={handleSubmit}
        className="m-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-9"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Brain className="size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Smriti</h1>
            <p className="mt-1 text-sm text-muted-foreground">AI Cognitive Care — याददाश्त के साथ</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-2xl border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setAuthError(null) }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
              mode === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <LogIn className="size-4" /> Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setAuthError(null) }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
              mode === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <UserPlus className="size-4" /> Sign Up
          </button>
        </div>

        <div className="grid gap-4">
          {mode === "signup" && (
            <label className="grid gap-1.5">
              <span className="text-sm font-bold">Full Name</span>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required={mode === "signup"}
                autoFocus={mode === "signup"}
                placeholder="Ramesh Kumar"
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />
            </label>
          )}

          <label className="grid gap-1.5">
            <span className="text-sm font-bold">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus={mode === "login"}
              placeholder="ramesh@example.com"
              autoCapitalize="none"
              autoComplete="email"
              className="rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-bold">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>
        </div>

        {authError && (
          <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-semibold text-destructive">
            ⚠️ {authError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-extrabold text-primary-foreground disabled:opacity-60"
        >
          {loading ? (
            <span className="animate-pulse">Please wait…</span>
          ) : mode === "login" ? (
            <><LogIn className="size-5" /> Login</>
          ) : (
            <><ArrowRight className="size-5" /> Create Account</>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "login"
            ? "New to Smriti? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setAuthError(null) }}
            className="font-bold text-primary underline underline-offset-2"
          >
            {mode === "login" ? "Sign up free" : "Login"}
          </button>
        </p>
      </form>
    </div>
  )
}
