"use client"

import { AppProvider, useApp } from "@/components/app-provider"
import { Sidebar } from "@/components/sidebar"
import { Toast } from "@/components/toast"
import { Dashboard } from "@/components/pages/dashboard"
import { Games } from "@/components/pages/games"
import { MemoryCoach } from "@/components/pages/memory"
import { Reminders } from "@/components/pages/reminders"
import { Language } from "@/components/pages/language"
import { Caregiver } from "@/components/pages/caregiver"
import { Profile } from "@/components/pages/profile"
import { MemoryBook } from "@/components/pages/memory-book"
import { Journal } from "@/components/pages/journal"
import { Onboarding } from "@/components/onboarding"
import { AuthScreen } from "@/components/auth-screen"

function CurrentPage() {
  const { page, onboardingDone } = useApp()
  if (!onboardingDone) return <Onboarding />
  switch (page) {
    case "games":
      return <Games />
    case "memory":
      return <MemoryCoach />
    case "reminders":
      return <Reminders />
    case "memory-book":
      return <MemoryBook />
    case "journal":
      return <Journal />
    case "language":
      return <Language />
    case "caregiver":
      return <Caregiver />
    case "profile":
      return <Profile />
    default:
      return <Dashboard />
  }
}

function App() {
  const { isLoggedIn } = useApp()
  if (!isLoggedIn) return <AuthScreen />
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[76px] px-4 py-6 md:ml-64 md:px-8 md:py-7">
        <div className="mx-auto max-w-6xl">
          <CurrentPage />
        </div>
      </main>
      <Toast />
    </div>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}
