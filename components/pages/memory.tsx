"use client"

import { useApp } from "@/components/app-provider"
import { GamePlay } from "@/components/game-play"

export function MemoryCoach() {
  const { navigate } = useApp()
  return (
    <div className="space-y-5">
      <GamePlay type="memory" onExit={() => navigate("dashboard")} />
    </div>
  )
}
