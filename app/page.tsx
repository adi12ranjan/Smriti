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
import { Onboarding } from "@/components/onboarding"

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

export default function Page() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-[76px] px-4 py-6 md:ml-64 md:px-8 md:py-7">
          <div className="mx-auto max-w-6xl">
            <CurrentPage />
          </div>
        </main>
        <Toast />
      </div>
    </AppProvider>
  )
}
