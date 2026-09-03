// Centralized voice-prompt scripts used across the app's speak() calls.
// These are supplemental, English-only flavor lines layered on top of the
// core multilingual UI strings in lib/i18n.ts (which stay the source of
// truth for translated interface text).

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const VOICE = {
  welcome: "Welcome to Smriti. Let's take things one step at a time.",
  moodCheckin: "How are you feeling today?",
  checkinComplete: "Your check-in is complete. Well done!",
  memoryGameIntro: "Let's exercise your memory. Ready?",
  memoryStart: "Let's see what your memory can do!",
  memoryComplete: "Great job! You completed the memory challenge.",
  focusStart: "Time to put your focus to the test!",
  focusComplete: "Focus challenge complete! Well played.",
  gameStart: "Ready? Let's get started!",
  countdown: "Three… two… one… go!",
  gameExit: "Nice work! Come back whenever you're ready for another challenge.",
  highScore: "New high score! Look at you!",
  streakReminder: "Your streak is waiting! Don't break it!",
} as const

export const CORRECT_LINES = ["Great job! You remembered that.", "Yes! You got it!"]

export const WRONG_LINES = [
  "That's okay. Let's try another one.",
  "Not quite! No worries, try again.",
  "Almost! Give it another try.",
]

// Time-of-day aware greeting used for the mood check-in prompt.
export function moodCheckinGreeting(): string {
  const hour = new Date().getHours()
  const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
  return `Good ${part}! ${VOICE.moodCheckin}`
}

export function reminderVoiceLine(icon: string, label: string): string {
  if (icon === "💊") return "This is your reminder to take your scheduled medicine."
  if (icon === "💧") return "Quick reminder: grab a glass of water!"
  if (icon === "🚶") return "Hey! Time to get up and take a little walk."
  if (icon === "👨‍⚕️") return "Don't forget, you have a doctor's appointment today."
  return `Reminder: ${label}. It is time now.`
}
