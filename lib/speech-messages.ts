// Central place for every spoken AI prompt in Smriti.
// Keeping these together makes it easy to review, tweak wording, or (later)
// translate them without hunting through every component that calls speak().

export const SPEECH = {
  // Welcome
  welcome: "Welcome to Smriti. Let's take things one step at a time.",

  // Mood check-in
  checkinComplete: "Your check-in is complete. Well done!",

  // Memory Game (quick per-round feedback)
  memoryGameIntro: "Let's exercise your memory. Ready?",
  memoryCorrect: "Great job! You remembered that.",
  memoryWrong: "That's okay. Let's try another one.",

  // Memory challenge (session-level)
  memoryStart: "Let's see what your memory can do!",
  memoryComplete: "Great job! You completed the memory challenge.",

  // Focus challenge
  focusStart: "Time to put your focus to the test!",
  focusComplete: "Focus challenge complete! Well played.",

  // Generic game flow
  gameStart: "Ready? Let's get started!",
  countdown: "Three… two… one… go!",
  correctAnswer: "Yes! You got it!",
  almostAnswer: "Almost! Give it another try.",
  wrongAnswer: "Not quite! No worries, try again.",
  highScore: "New high score! Look at you!",
  gameExit: "Nice work! Come back whenever you're ready for another challenge.",
  streakReminder: "Your streak is waiting! Don't break it!",

  // Reminders
  waterReminder: "Quick reminder: grab a glass of water!",
  medicineReminder: "This is your reminder to take your scheduled medicine.",
  walkReminder: "Hey! Time to get up and take a little walk.",
  doctorReminder: "Don't forget, you have a doctor's appointment today.",
} as const

export type SpeechKey = keyof typeof SPEECH

// "Good morning / afternoon / evening! How are you feeling today?" — greeting
// adapts to the time of day the check-in is opened.
export function moodCheckinPrompt(date: Date = new Date()): string {
  const hour = date.getHours()
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
  return `Good ${timeOfDay}! How are you feeling today?`
}

export type ReminderKind = "medicine" | "water" | "walk" | "doctor" | "custom"

// Maps a reminder's kind to its spoken line; falls back to a generic
// "Reminder: <label>. It is time now." for anything custom/unrecognized.
export function reminderSpeech(kind: ReminderKind | undefined, label: string): string {
  switch (kind) {
    case "medicine":
      return SPEECH.medicineReminder
    case "water":
      return SPEECH.waterReminder
    case "walk":
      return SPEECH.walkReminder
    case "doctor":
      return SPEECH.doctorReminder
    default:
      return `Reminder: ${label}. It is time now.`
  }
}

// Best-effort guess at a reminder's kind from its label, so reminders typed
// in by the user (or old saved data with no `kind`) still get the right voice line.
export function guessReminderKind(label: string): ReminderKind {
  const l = label.toLowerCase()
  if (l.includes("medic") || l.includes("pill") || l.includes("tablet") || l.includes("dose")) return "medicine"
  if (l.includes("water") || l.includes("hydrat")) return "water"
  if (l.includes("walk") || l.includes("stroll") || l.includes("exercise")) return "walk"
  if (l.includes("doctor") || l.includes("appointment") || l.includes("physician") || l.includes("clinic")) return "doctor"
  return "custom"
}
