// Spoken lines in every supported language.
//
// lib/voice-lines.ts holds English-only lines; reading those with a Hindi or
// Bengali voice sounds wrong. These are the same messages translated so the
// voice always speaks the language the user picked.
//
// NOTE: Manipuri (mni) lines are written in Bengali script (the script the app
// already uses for Manipuri) and mix in common English loanwords, matching the
// existing style in lib/i18n.ts. They should be reviewed by a native speaker.

import type { LangCode } from "@/lib/i18n"

export type LineKey =
  | "welcome"
  | "ready"
  | "opening"
  | "correct"
  | "wrong"
  | "reminderMedicine"
  | "reminderWater"
  | "reminderWalk"
  | "reminderDoctor"
  | "reminderCustom"

type Line = string | ((arg: string) => string)

const LINES: Record<LangCode, Record<LineKey, Line>> = {
  en: {
    welcome: "Welcome to Smriti. Let's take things one step at a time.",
    ready: (n) => `Namaste ${n}. Your Smriti is ready. Let us start.`,
    opening: (l) => `Opening ${l}.`,
    correct: "That's right! Very good.",
    wrong: (n) => `That's okay. This is ${n}.`,
    reminderMedicine: "This is your reminder to take your scheduled medicine.",
    reminderWater: "Quick reminder: grab a glass of water!",
    reminderWalk: "Hey! Time to get up and take a little walk.",
    reminderDoctor: "Don't forget, you have a doctor's appointment today.",
    reminderCustom: (l) => `Reminder: ${l}. It is time now.`,
  },
  hi: {
    welcome: "स्मृति में आपका स्वागत है। चलिए, एक-एक कदम आगे बढ़ते हैं।",
    ready: (n) => `नमस्ते ${n}। आपका स्मृति तैयार है। चलिए शुरू करते हैं।`,
    opening: (l) => `${l} खोल रहे हैं।`,
    correct: "बिल्कुल सही! बहुत बढ़िया।",
    wrong: (n) => `कोई बात नहीं। यह ${n} है।`,
    reminderMedicine: "यह आपकी दवा लेने का समय है।",
    reminderWater: "ज़रा याद दिला दूँ, एक गिलास पानी पी लीजिए।",
    reminderWalk: "अब थोड़ी सैर पर चलने का समय हो गया है।",
    reminderDoctor: "याद रखिए, आज आपकी डॉक्टर से मुलाक़ात है।",
    reminderCustom: (l) => `याद दिलाना है: ${l}। अब इसका समय हो गया है।`,
  },
  bn: {
    welcome: "স্মৃতিতে আপনাকে স্বাগতম। চলুন, এক ধাপ করে এগোই।",
    ready: (n) => `নমস্কার ${n}। আপনার স্মৃতি প্রস্তুত। চলুন শুরু করি।`,
    opening: (l) => `${l} খোলা হচ্ছে।`,
    correct: "একদম ঠিক! খুব ভালো।",
    wrong: (n) => `কোনো সমস্যা নেই। এটি ${n}।`,
    reminderMedicine: "এখন আপনার ওষুধ খাওয়ার সময়।",
    reminderWater: "মনে করিয়ে দিই, এক গ্লাস জল খেয়ে নিন।",
    reminderWalk: "এবার একটু হেঁটে আসার সময় হয়েছে।",
    reminderDoctor: "মনে রাখবেন, আজ আপনার ডাক্তারের অ্যাপয়েন্টমেন্ট আছে।",
    reminderCustom: (l) => `মনে করিয়ে দিই: ${l}। এখন তার সময় হয়েছে।`,
  },
  as: {
    welcome: "স্মৃতিলৈ আপোনাক স্বাগতম। আহক, এটা এটাকৈ আগবাঢ়ি যাওঁ।",
    ready: (n) => `নমস্কাৰ ${n}। আপোনাৰ স্মৃতি সাজু। আহক আৰম্ভ কৰোঁ।`,
    opening: (l) => `${l} খোলা হৈছে।`,
    correct: "একেবাৰে শুদ্ধ! বহুত ভাল।",
    wrong: (n) => `কোনো অসুবিধা নাই। এইটো ${n}।`,
    reminderMedicine: "এতিয়া আপোনাৰ ঔষধ খোৱাৰ সময়।",
    reminderWater: "মনত পেলাই দিওঁ, এগিলাচ পানী খাই লওক।",
    reminderWalk: "এতিয়া অলপ খোজ কাঢ়িবলৈ যোৱাৰ সময় হৈছে।",
    reminderDoctor: "মনত ৰাখিব, আজি আপোনাৰ চিকিৎসকৰ লগত সাক্ষাৎ আছে।",
    reminderCustom: (l) => `মনত পেলাই দিওঁ: ${l}। এতিয়া ইয়াৰ সময় হৈছে।`,
  },
  mni: {
    welcome: "নমস্কার। স্মৃতি শাজু লৈ। অমা অমা তৌনা শুরু তৌরক্লো।",
    ready: (n) => `নমস্কার ${n}। নঙ্গী স্মৃতি শাজু লৈ। শুরু তৌরক্লো।`,
    opening: (l) => `${l} ওপেন তৌরি।`,
    correct: "Correct। মাংজাও থোকপা।",
    wrong: (n) => `প্রব্লেম নত্তে। অসি ${n} নি।`,
    reminderMedicine: "ঔষধ লৌবগী মতম লৈরে।",
    reminderWater: "ইশিং অমা থুংবগী মতম লৈরে।",
    reminderWalk: "ওয়াক তৌবগী মতম লৈরে।",
    reminderDoctor: "ঙসি ডাক্তরগী অ্যাপয়েন্টমেন্ট লৈ।",
    reminderCustom: (l) => `রিমাইন্ডর: ${l}। মতম লৈরে।`,
  },
}

export function voiceLine(lang: LangCode, key: LineKey, arg = ""): string {
  const line = LINES[lang]?.[key] ?? LINES.en[key]
  return typeof line === "function" ? line(arg) : line
}

// Spoken text for a reminder, chosen by its icon (same mapping as lib/voice-lines.ts).
export function reminderLineFor(lang: LangCode, icon: string, label: string): string {
  if (icon === "💊") return voiceLine(lang, "reminderMedicine")
  if (icon === "💧") return voiceLine(lang, "reminderWater")
  if (icon === "🚶") return voiceLine(lang, "reminderWalk")
  if (icon === "👨‍⚕️") return voiceLine(lang, "reminderDoctor")
  return voiceLine(lang, "reminderCustom", label)
}
