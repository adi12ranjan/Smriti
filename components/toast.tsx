"use client"

import { useApp } from "@/components/app-provider"

export function Toast() {
  const { toastMsg } = useApp()
  if (!toastMsg) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)] rounded-xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-lg animate-in fade-in slide-in-from-bottom-4"
    >
      {toastMsg}
    </div>
  )
}
