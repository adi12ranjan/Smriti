export type LangCode = "en" | "hi" | "bn" | "as" | "mni"

export const LANGUAGES: { code: LangCode; name: string; native: string; glyph: string; speechLang: string }[] = [
  { code: "en", name: "English", native: "English", glyph: "A", speechLang: "en-IN" },
  { code: "hi", name: "Hindi", native: "हिंदी", glyph: "ह", speechLang: "hi-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", glyph: "অ", speechLang: "bn-IN" },
  { code: "as", name: "Assamese", native: "অসমীয়া", glyph: "অসম", speechLang: "as-IN" },
  { code: "mni", name: "Manipuri", native: "মৈতৈলোন্", glyph: "ম", speechLang: "bn-IN" },
]

type Dict = {
  langName: string
  // nav
  nav_day: string
  nav_games: string
  nav_memory: string
  nav_family: string
  nav_journal: string
  nav_reminders: string
  nav_language: string
  nav_caregiver: string
  nav_profile: string
  patientMode: string
  // dashboard
  greeting: string
  dateLine: string
  voice: string
  language: string
  heroTitle: string
  heroText: string
  heroStart: string
  listen: string
  stat_score: string
  stat_streak: string
  stat_games: string
  stat_mood: string
  streakBest: string
  oneMore: string
  tapMood: string
  recommended: string
  aiAdapted: string
  weeklyTrend: string
  aiInsightTrend: string
  todayReminders: string
  recentActivity: string
  upcoming: string
  tomorrow: string
  // games
  gamesTitle: string
  gamesSubtitle: string
  play: string
  start: string
  g_memory_name: string
  g_memory_desc: string
  g_focus_name: string
  g_focus_desc: string
  g_pattern_name: string
  g_pattern_desc: string
  // game engine
  round: string
  score: string
  streakLabel: string
  memoryInstruction: string
  focusInstruction: string
  patternInstruction: string
  memorize: string
  correct: string
  tryAgain: string
  sessionComplete: string
  accuracy: string
  playAgain: string
  backToGames: string
  // reminders
  remindersTitle: string
  remindersSubtitle: string
  addReminder: string
  done: string
  completed: string
  markedDone: string
  reminderAdded: string
  noReminders: string
  // language page
  languageTitle: string
  languageSubtitle: string
  choosePreferred: string
  choosePreferredText: string
  voiceAssistance: string
  voiceAssistanceText: string
  readInstructions: string
  dailyGreeting: string
  reminderAnnounce: string
  gameFeedback: string
  play_btn: string
  accessibilityPrinciple: string
  accessibilityPrincipleText: string
  howItWorks: string
  step1t: string
  step1d: string
  step2t: string
  step2d: string
  step3t: string
  step3d: string
  step4t: string
  step4d: string
  languageChanged: string
  // caregiver
  caregiverTitle: string
  caregiverSubtitle: string
  synced: string
  score7: string
  memAccuracy: string
  engagement: string
  perWeek: string
  alerts: string
  needsReview: string
  weeklyInsight: string
  weeklyInsightText: string
  memory: string
  attention: string
  patternRec: string
  careAlerts: string
  missedHydration: string
  review: string
  noUrgent: string
  healthy: string
  // profile
  profileTitle: string
  profileSubtitle: string
  voiceAssist: string
  testVoice: string
  largeText: string
  enable: string
  offlineMode: string
  ready: string
  change: string
  // voice prompts
  v_welcome: string
  v_instructions: string
  v_reminder: string
  v_correct: string
}

export const translations: Record<LangCode, Dict> = {
  en: {
    langName: "English",
    nav_day: "My Day",
    nav_games: "Cognitive Games",
    nav_memory: "Memory Coach",
    nav_family: "Family Memories",
    nav_journal: "Voice Journal",
    nav_reminders: "Reminders",
    nav_language: "Language & Voice",
    nav_caregiver: "Caregiver View",
    nav_profile: "Profile",
    patientMode: "Patient mode",
    greeting: "Good afternoon, Anil",
    dateLine: "Let's keep your mind active today.",
    voice: "Voice",
    language: "Language",
    heroTitle: "Your brain workout is ready",
    heroText:
      "Today's session combines memory, attention and pattern recognition. Difficulty adapts automatically from your recent performance.",
    heroStart: "Start 10-min session",
    listen: "Listen",
    stat_score: "Cognitive score",
    stat_streak: "Memory streak",
    stat_games: "Games today",
    stat_mood: "Mood check",
    streakBest: "Best: 15 days",
    oneMore: "One more to complete",
    tapMood: "Tap to update",
    recommended: "Recommended for you",
    aiAdapted: "AI ADAPTED",
    weeklyTrend: "Weekly cognitive trend",
    aiInsightTrend: "AI insight: memory performance is improving steadily.",
    todayReminders: "Today's reminders",
    recentActivity: "Recent activity",
    upcoming: "Upcoming",
    tomorrow: "Tomorrow",
    gamesTitle: "Cognitive Games",
    gamesSubtitle: "Games adapt to your performance — no stressful timers.",
    play: "Play",
    start: "Start",
    g_memory_name: "Remember & Match",
    g_memory_desc: "Remember objects, faces and familiar places.",
    g_focus_name: "Focus Finder",
    g_focus_desc: "Find the object that matches the target.",
    g_pattern_name: "Pattern Path",
    g_pattern_desc: "Complete simple visual patterns.",
    round: "Round",
    score: "Score",
    streakLabel: "Streak",
    memoryInstruction: "Look carefully at the object, then choose the one you saw.",
    focusInstruction: "Tap the object that matches the target shown above.",
    patternInstruction: "Choose the item that comes next in the pattern.",
    memorize: "Memorize...",
    correct: "Correct! Great work",
    tryAgain: "Good try. Let's keep going",
    sessionComplete: "Session complete!",
    accuracy: "Accuracy",
    playAgain: "Play again",
    backToGames: "Back to games",
    remindersTitle: "My Reminders",
    remindersSubtitle: "Simple daily support for medicines, hydration and appointments.",
    addReminder: "Add reminder",
    done: "Done",
    completed: "Completed",
    markedDone: "Marked as completed",
    reminderAdded: "Reminder added",
    noReminders: "All done for now. No pending reminders.",
    languageTitle: "Language & Voice",
    languageSubtitle: "Built for the linguistic diversity of the North Eastern Region.",
    choosePreferred: "Choose preferred language",
    choosePreferredText:
      "The interface, game instructions, reminders and voice prompts follow the patient's selected language.",
    voiceAssistance: "Voice assistance",
    voiceAssistanceText: "Designed for users who may find it hard to read small text or navigate complex screens.",
    readInstructions: "Read instructions aloud",
    dailyGreeting: "Daily greeting",
    reminderAnnounce: "Reminder announcement",
    gameFeedback: "Game feedback",
    play_btn: "Play",
    accessibilityPrinciple: "Accessibility principle",
    accessibilityPrincipleText:
      "Short sentences • familiar words • large controls • voice-first support • low cognitive load.",
    howItWorks: "How multilingual AI works",
    step1t: "1. Detect preference",
    step1d: "Patient or caregiver selects a preferred language.",
    step2t: "2. Translate content",
    step2d: "Game prompts, reminders and guidance use the selected language pack.",
    step3t: "3. Voice output",
    step3d: "Text-to-speech reads important information aloud where supported.",
    step4t: "4. Keep it simple",
    step4d: "AI adapts wording and difficulty for the patient's cognitive level.",
    languageChanged: "Language changed to",
    caregiverTitle: "Caregiver Dashboard",
    caregiverSubtitle: "Simple, privacy-first progress monitoring.",
    synced: "Synced 2 min ago",
    score7: "7-day score",
    memAccuracy: "Memory accuracy",
    engagement: "Engagement",
    perWeek: "/ week",
    alerts: "Alerts",
    needsReview: "Needs review",
    weeklyInsight: "AI-generated weekly insight",
    weeklyInsightText:
      "Memory and attention scores are trending upward. The system recommends continuing short daily sessions and familiar-object games.",
    memory: "Memory",
    attention: "Attention",
    patternRec: "Pattern recognition",
    careAlerts: "Care alerts",
    missedHydration: "Missed hydration reminder",
    review: "Review",
    noUrgent: "No urgent alerts",
    healthy: "Healthy",
    profileTitle: "Profile & Accessibility",
    profileSubtitle:
      "Designed for elderly users: large controls, voice assistance, familiar visuals and low-connectivity support.",
    voiceAssist: "Voice assistance",
    testVoice: "Test voice",
    largeText: "Large text mode",
    enable: "Enable",
    offlineMode: "Offline mode",
    ready: "Ready",
    change: "Change",
    v_welcome: "Namaste Anil. Your cognitive session is ready.",
    v_instructions: "Look carefully at the object, then choose the object you saw.",
    v_reminder: "It is time to take your medicine.",
    v_correct: "Correct. Great work. Keep going.",
  },
  hi: {
    langName: "हिंदी",
    nav_day: "मेरा दिन",
    nav_games: "मस्तिष्क खेल",
    nav_memory: "स्मृति कोच",
    nav_family: "परिवार की यादें",
    nav_journal: "वॉइस जर्नल",
    nav_reminders: "अनुस्मारक",
    nav_language: "भाषा और आवाज़",
    nav_caregiver: "देखभालकर्ता",
    nav_profile: "प्रोफ़ाइल",
    patientMode: "रोगी मोड",
    greeting: "नमस्ते अनिल",
    dateLine: "आज अपने मन को सक्रिय रखें।",
    voice: "आवाज़",
    language: "भाषा",
    heroTitle: "आपका मस्तिष्क अभ्यास तैयार है",
    heroText:
      "आज का सत्र स्मृति, ध्यान और पैटर्न पहचान को जोड़ता है। कठिनाई आपके हाल के प्रदर्शन से अपने आप बदलती है।",
    heroStart: "10 मिनट का सत्र शुरू करें",
    listen: "सुनें",
    stat_score: "संज्ञानात्मक स्कोर",
    stat_streak: "स्मृति श्रृंखला",
    stat_games: "आज के खेल",
    stat_mood: "मनोदशा जाँच",
    streakBest: "सर्वश्रेष्ठ: 15 दिन",
    oneMore: "एक और बाकी है",
    tapMood: "बदलने के लिए टैप करें",
    recommended: "आपके लिए अनुशंसित",
    aiAdapted: "एआई अनुकूलित",
    weeklyTrend: "साप्ताहिक संज्ञानात्मक रुझान",
    aiInsightTrend: "एआई अंतर्दृष्टि: स्मृति प्रदर्शन लगातार सुधर रहा है।",
    todayReminders: "आज के अनुस्मारक",
    recentActivity: "हाल की गतिविधि",
    upcoming: "आगामी",
    tomorrow: "कल",
    gamesTitle: "मस्तिष्क खेल",
    gamesSubtitle: "खेल आपके प्रदर्शन के अनुसार बदलते हैं — कोई तनावपूर्ण टाइमर नहीं।",
    play: "खेलें",
    start: "शुरू करें",
    g_memory_name: "याद करें और मिलाएँ",
    g_memory_desc: "वस्तुओं, चेहरों और परिचित जगहों को याद रखें।",
    g_focus_name: "ध्यान खोजक",
    g_focus_desc: "लक्ष्य से मेल खाती वस्तु खोजें।",
    g_pattern_name: "पैटर्न पथ",
    g_pattern_desc: "सरल दृश्य पैटर्न पूरे करें।",
    round: "राउंड",
    score: "स्कोर",
    streakLabel: "श्रृंखला",
    memoryInstruction: "वस्तु को ध्यान से देखें, फिर वही चुनें जो आपने देखी।",
    focusInstruction: "ऊपर दिखाए गए लक्ष्य से मेल खाती वस्तु पर टैप करें।",
    patternInstruction: "पैटर्न में अगली आने वाली वस्तु चुनें।",
    memorize: "याद करें...",
    correct: "सही! बहुत अच्छा",
    tryAgain: "अच्छा प्रयास। आगे बढ़ते रहें",
    sessionComplete: "सत्र पूरा हुआ!",
    accuracy: "सटीकता",
    playAgain: "फिर से खेलें",
    backToGames: "खेलों पर वापस",
    remindersTitle: "मेरे अनुस्मारक",
    remindersSubtitle: "दवा, पानी और अपॉइंटमेंट के लिए सरल दैनिक सहायता।",
    addReminder: "अनुस्मारक जोड़ें",
    done: "पूर्ण",
    completed: "पूर्ण हुआ",
    markedDone: "पूर्ण के रूप में चिह्नित",
    reminderAdded: "अनुस्मारक जोड़ा गया",
    noReminders: "अभी सब पूरा। कोई लंबित अनुस्मारक नहीं।",
    languageTitle: "भाषा और आवाज़",
    languageSubtitle: "पूर्वोत्तर क्षेत्र की भाषाई विविधता के लिए बनाया गया।",
    choosePreferred: "पसंदीदा भाषा चुनें",
    choosePreferredText: "इंटरफ़ेस, खेल निर्देश, अनुस्मारक और आवाज़ रोगी की चुनी हुई भाषा में होंगे।",
    voiceAssistance: "आवाज़ सहायता",
    voiceAssistanceText: "उन उपयोगकर्ताओं के लिए जिन्हें छोटा पाठ पढ़ना कठिन लगता है।",
    readInstructions: "निर्देश ज़ोर से पढ़ें",
    dailyGreeting: "दैनिक अभिवादन",
    reminderAnnounce: "अनुस्मारक घोषणा",
    gameFeedback: "खेल प्रतिक्रिया",
    play_btn: "चलाएँ",
    accessibilityPrinciple: "पहुँच सिद्धांत",
    accessibilityPrincipleText: "छोटे वाक्य • परिचित शब्द • बड़े नियंत्रण • आवाज़-प्रथम सहायता।",
    howItWorks: "बहुभाषी एआई कैसे काम करता है",
    step1t: "1. पसंद पहचानें",
    step1d: "रोगी या देखभालकर्ता पसंदीदा भाषा चुनता है।",
    step2t: "2. सामग्री अनुवाद",
    step2d: "खेल संकेत, अनुस्मारक और मार्गदर्शन चुनी हुई भाषा का उपयोग करते हैं।",
    step3t: "3. आवाज़ आउटपुट",
    step3d: "टेक्स्ट-टू-स्पीच महत्वपूर्ण जानकारी ज़ोर से पढ़ता है।",
    step4t: "4. सरल रखें",
    step4d: "एआई रोगी के स्तर के अनुसार शब्द और कठिनाई ढालता है।",
    languageChanged: "भाषा बदली गई:",
    caregiverTitle: "देखभालकर्ता डैशबोर्ड",
    caregiverSubtitle: "सरल, गोपनीयता-प्रथम प्रगति निगरानी।",
    synced: "2 मिनट पहले सिंक हुआ",
    score7: "7-दिन का स्कोर",
    memAccuracy: "स्मृति सटीकता",
    engagement: "सहभागिता",
    perWeek: "/ सप्ताह",
    alerts: "अलर्ट",
    needsReview: "समीक्षा चाहिए",
    weeklyInsight: "एआई साप्ताहिक अंतर्दृष्टि",
    weeklyInsightText: "स्मृति और ध्यान स्कोर ऊपर की ओर हैं। छोटे दैनिक सत्र जारी रखने की सलाह है।",
    memory: "स्मृति",
    attention: "ध्यान",
    patternRec: "पैटर्न पहचान",
    careAlerts: "देखभाल अलर्ट",
    missedHydration: "पानी का अनुस्मारक छूटा",
    review: "समीक्षा",
    noUrgent: "कोई तत्काल अलर्ट नहीं",
    healthy: "स्वस्थ",
    profileTitle: "प्रोफ़ाइल और पहुँच",
    profileSubtitle: "बुज़ुर्ग उपयोगकर्ताओं के लिए: बड़े नियंत्रण, आवाज़ सहायता और परिचित दृश्य।",
    voiceAssist: "आवाज़ सहायता",
    testVoice: "आवाज़ जाँचें",
    largeText: "बड़ा पाठ मोड",
    enable: "सक्षम करें",
    offlineMode: "ऑफ़लाइन मोड",
    ready: "तैयार",
    change: "बदलें",
    v_welcome: "नमस्ते अनिल। आपका आज का संज्ञानात्मक अभ्यास तैयार है।",
    v_instructions: "वस्तु को ध्यान से देखें, फिर वही वस्तु चुनें जो आपने देखी थी।",
    v_reminder: "आपकी दवा लेने का समय हो गया है।",
    v_correct: "सही जवाब। बहुत अच्छा। आगे बढ़ते रहें।",
  },
  bn: {
    langName: "বাংলা",
    nav_day: "আমার দিন",
    nav_games: "মস্তিষ্কের খেলা",
    nav_memory: "স্মৃতি কোচ",
    nav_family: "পরিবারের স্মৃতি",
    nav_journal: "ভয়েস জার্নাল",
    nav_reminders: "অনুস্মারক",
    nav_language: "ভাষা ও ভয়েস",
    nav_caregiver: "পরিচর্যাকারী",
    nav_profile: "প্রোফাইল",
    patientMode: "রোগী মোড",
    greeting: "নমস্কার অনিল",
    dateLine: "আজ আপনার মনকে সক্রিয় রাখুন।",
    voice: "ভয়েস",
    language: "ভাষা",
    heroTitle: "আপনার মস্তিষ্কের অনুশীলন প্রস্তুত",
    heroText:
      "আজকের সেশনে স্মৃতি, মনোযোগ ও প্যাটার্ন চেনা মিলিত হয়েছে। কঠিনতা আপনার সাম্প্রতিক পারফরম্যান্স অনুযায়ী বদলায়।",
    heroStart: "১০ মিনিটের সেশন শুরু করুন",
    listen: "শুনুন",
    stat_score: "সংজ্ঞানমূলক স্কোর",
    stat_streak: "স্মৃতির ধারা",
    stat_games: "আজকের খেলা",
    stat_mood: "মেজাজ পরীক্ষা",
    streakBest: "সেরা: ১৫ দিন",
    oneMore: "আরও একটি বাকি",
    tapMood: "আপডেট করতে ট্যাপ করুন",
    recommended: "আপনার জন্য প্রস্তাবিত",
    aiAdapted: "এআই অভিযোজিত",
    weeklyTrend: "সাপ্তাহিক সংজ্ঞানমূলক প্রবণতা",
    aiInsightTrend: "এআই অন্তর্দৃষ্টি: স্মৃতির পারফরম্যান্স ক্রমশ উন্নত হচ্ছে।",
    todayReminders: "আজকের অনুস্মারক",
    recentActivity: "সাম্প্রতিক কার্যকলাপ",
    upcoming: "আসন্ন",
    tomorrow: "আগামীকাল",
    gamesTitle: "মস্তিষ্কের খেলা",
    gamesSubtitle: "খেলা আপনার পারফরম্যান্স অনুযায়ী বদলায় — কোনো চাপযুক্ত টাইমার নেই।",
    play: "খেলুন",
    start: "শুরু",
    g_memory_name: "মনে রাখুন ও মেলান",
    g_memory_desc: "বস্তু, মুখ ও পরিচিত জায়গা মনে রাখুন।",
    g_focus_name: "মনোযোগ অনুসন্ধানী",
    g_focus_desc: "লক্ষ্যের সাথে মেলে এমন বস্তু খুঁজুন।",
    g_pattern_name: "প্যাটার্ন পথ",
    g_pattern_desc: "সহজ দৃশ্য প্যাটার্ন সম্পূর্ণ করুন।",
    round: "রাউন্ড",
    score: "স্কোর",
    streakLabel: "ধারা",
    memoryInstruction: "বস্তুটি ভালো করে দেখুন, তারপর আপনি যেটি দেখেছেন সেটি বেছে নিন।",
    focusInstruction: "উপরে দেখানো লক্ষ্যের সাথে মেলে এমন বস্তুতে ট্যাপ করুন।",
    patternInstruction: "প্যাটার্নে পরের বস্তুটি বেছে নিন।",
    memorize: "মনে রাখুন...",
    correct: "সঠিক! খুব ভালো",
    tryAgain: "ভালো চেষ্টা। এগিয়ে চলুন",
    sessionComplete: "সেশন সম্পূর্ণ!",
    accuracy: "নির্ভুলতা",
    playAgain: "আবার খেলুন",
    backToGames: "খেলায় ফিরুন",
    remindersTitle: "আমার অনুস্মারক",
    remindersSubtitle: "ওষুধ, জল ও অ্যাপয়েন্টমেন্টের জন্য সহজ দৈনিক সহায়তা।",
    addReminder: "অনুস্মারক যোগ করুন",
    done: "সম্পন্ন",
    completed: "সম্পন্ন হয়েছে",
    markedDone: "সম্পন্ন হিসেবে চিহ্নিত",
    reminderAdded: "অনুস্মারক যোগ হয়েছে",
    noReminders: "এখন সব সম্পন্ন। কোনো অপেক্ষমাণ অনুস্মারক নেই।",
    languageTitle: "ভাষা ও ভয়েস",
    languageSubtitle: "উত্তর-পূর্বাঞ্চলের ভাষাগত বৈচিত্র্যের জন্য তৈরি।",
    choosePreferred: "পছন্দের ভাষা বেছে নিন",
    choosePreferredText: "ইন্টারফেস, খেলার নির্দেশ, অনুস্মারক ও ভয়েস রোগীর বেছে নেওয়া ভাষায় হবে।",
    voiceAssistance: "ভয়েস সহায়তা",
    voiceAssistanceText: "যাদের ছোট লেখা পড়া কঠিন তাদের জন্য ডিজাইন করা।",
    readInstructions: "নির্দেশ জোরে পড়ুন",
    dailyGreeting: "দৈনিক শুভেচ্ছা",
    reminderAnnounce: "অনুস্মারক ঘোষণা",
    gameFeedback: "খেলার প্রতিক্রিয়া",
    play_btn: "চালান",
    accessibilityPrinciple: "অভিগম্যতা নীতি",
    accessibilityPrincipleText: "ছোট বাক্য • পরিচিত শব্দ • বড় নিয়ন্ত্রণ • ভয়েস-প্রথম সহায়তা।",
    howItWorks: "বহুভাষিক এআই কীভাবে কাজ করে",
    step1t: "১. পছন্দ শনাক্ত করুন",
    step1d: "রোগী বা পরিচর্যাকারী পছন্দের ভাষা বেছে নেয়।",
    step2t: "২. বিষয়বস্তু অনুবাদ",
    step2d: "খেলার সংকেত, অনুস্মারক ও নির্দেশনা বেছে নেওয়া ভাষা ব্যবহার করে।",
    step3t: "৩. ভয়েস আউটপুট",
    step3d: "টেক্সট-টু-স্পিচ গুরুত্বপূর্ণ তথ্য জোরে পড়ে।",
    step4t: "৪. সহজ রাখুন",
    step4d: "এআই রোগীর স্তর অনুযায়ী শব্দ ও কঠিনতা ঠিক করে।",
    languageChanged: "ভাষা পরিবর্তিত হয়েছে:",
    caregiverTitle: "পরিচর্যাকারী ড্যাশবোর্ড",
    caregiverSubtitle: "সহজ, গোপনীয়তা-প্রথম অগ্রগতি পর্যবেক্ষণ।",
    synced: "২ মিনিট আগে সিঙ্ক হয়েছে",
    score7: "৭-দিনের স্কোর",
    memAccuracy: "স্মৃতির নির্ভুলতা",
    engagement: "সম্পৃক্ততা",
    perWeek: "/ সপ্তাহ",
    alerts: "সতর্কতা",
    needsReview: "পর্যালোচনা প্রয়োজন",
    weeklyInsight: "এআই সাপ্তাহিক অন্তর্দৃষ্টি",
    weeklyInsightText: "স্মৃতি ও মনোযোগের স্কোর ঊর্ধ্বমুখী। ছোট দৈনিক সেশন চালিয়ে যাওয়ার পরামর্শ।",
    memory: "স্মৃতি",
    attention: "মনোযোগ",
    patternRec: "প্যাটার্ন চেনা",
    careAlerts: "পরিচর্যা সতর্কতা",
    missedHydration: "জল পানের অনুস্মারক মিস",
    review: "পর্যালোচনা",
    noUrgent: "জরুরি সতর্কতা নেই",
    healthy: "সুস্থ",
    profileTitle: "প্রোফাইল ও অভিগম্যতা",
    profileSubtitle: "বয়স্ক ব্যবহারকারীদের জন্য: বড় নিয়ন্ত্রণ, ভয়েস সহায়তা ও পরিচিত দৃশ্য।",
    voiceAssist: "ভয়েস সহায়তা",
    testVoice: "ভয়েস পরীক্ষা",
    largeText: "বড় লেখা মোড",
    enable: "সক্ষম করুন",
    offlineMode: "অফলাইন মোড",
    ready: "প্রস্তুত",
    change: "পরিবর্তন",
    v_welcome: "নমস্কার অনিল। আপনার আজকের মস্তিষ্কের অনুশীলন প্রস্তুত।",
    v_instructions: "বস্তুটি ভালো করে দেখুন, তারপর আপনি যে বস্তুটি দেখেছেন সেটি বেছে নিন।",
    v_reminder: "আপনার ওষুধ খাওয়ার সময় হয়েছে।",
    v_correct: "সঠিক উত্তর। খুব ভালো। এগিয়ে চলুন।",
  },
  as: {
    langName: "অসমীয়া",
    nav_day: "মোৰ দিন",
    nav_games: "মগজুৰ খেল",
    nav_memory: "স্মৃতি কোচ",
    nav_family: "পরিবারের স্মৃতি",
    nav_journal: "ভয়েস জার্নাল",
    nav_reminders: "মনত পেলোৱা",
    nav_language: "ভাষা আৰু কণ্ঠ",
    nav_caregiver: "যত্নকাৰী",
    nav_profile: "প্ৰ'ফাইল",
    patientMode: "ৰোগী ম'ড",
    greeting: "নমস্কাৰ অনিল",
    dateLine: "আজি আপোনাৰ মন সক্ৰিয় ৰাখক।",
    voice: "কণ্ঠ",
    language: "ভাষা",
    heroTitle: "আপোনাৰ মগজুৰ অনুশীলন সাজু",
    heroText:
      "আজিৰ ছেছনত স্মৃতি, মনোযোগ আৰু আৰ্হি চিনাক্তকৰণ মিলিত হৈছে। কঠিনতা আপোনাৰ শেহতীয়া প্ৰদৰ্শন অনুসৰি সলনি হয়।",
    heroStart: "১০ মিনিটৰ ছেছন আৰম্ভ কৰক",
    listen: "শুনক",
    stat_score: "সংজ্ঞানাত্মক স্ক'ৰ",
    stat_streak: "স্মৃতিৰ ধাৰা",
    stat_games: "আজিৰ খেল",
    stat_mood: "মেজাজ পৰীক্ষা",
    streakBest: "শ্ৰেষ্ঠ: ১৫ দিন",
    oneMore: "আৰু এটা বাকী",
    tapMood: "আপডেট কৰিবলৈ টেপ কৰক",
    recommended: "আপোনাৰ বাবে পৰামৰ্শিত",
    aiAdapted: "এআই অভিযোজিত",
    weeklyTrend: "সাপ্তাহিক সংজ্ঞানাত্মক ধাৰা",
    aiInsightTrend: "এআই অন্তৰ্দৃষ্টি: স্মৃতিৰ প্ৰদৰ্শন ক্ৰমান্বয়ে উন্নত হৈছে।",
    todayReminders: "আজিৰ মনত পেলোৱা",
    recentActivity: "শেহতীয়া কাৰ্যকলাপ",
    upcoming: "আগন্তুক",
    tomorrow: "কাইলৈ",
    gamesTitle: "মগজুৰ খেল",
    gamesSubtitle: "খেল আপোনাৰ প্ৰদৰ্শন অনুসৰি সলনি হয় — কোনো চাপযুক্ত টাইমাৰ নাই।",
    play: "খেলক",
    start: "আৰম্ভ",
    g_memory_name: "মনত ৰাখক আৰু মিলাওক",
    g_memory_desc: "বস্তু, মুখ আৰু চিনাকি ঠাই মনত ৰাখক।",
    g_focus_name: "মনোযোগ অনুসন্ধানী",
    g_focus_desc: "লক্ষ্যৰ সৈতে মিলা বস্তু বিচাৰক।",
    g_pattern_name: "আৰ্হি পথ",
    g_pattern_desc: "সহজ দৃশ্য আৰ্হি সম্পূৰ্ণ কৰক।",
    round: "ৰাউণ্ড",
    score: "স্ক'ৰ",
    streakLabel: "ধাৰা",
    memoryInstruction: "বস্তুটো ভালদৰে চাওক, তাৰ পিছত আপুনি দেখা বস্তুটো বাছক।",
    focusInstruction: "ওপৰত দেখুওৱা লক্ষ্যৰ সৈতে মিলা বস্তুত টেপ কৰক।",
    patternInstruction: "আৰ্হিত পিছত অহা বস্তুটো বাছক।",
    memorize: "মনত ৰাখক...",
    correct: "শুদ্ধ! বহুত ভাল",
    tryAgain: "ভাল চেষ্টা। আগবাঢ়ি যাওক",
    sessionComplete: "ছেছন সম্পূৰ্ণ!",
    accuracy: "সঠিকতা",
    playAgain: "আকৌ খেলক",
    backToGames: "খেললৈ উভতি যাওক",
    remindersTitle: "মোৰ মনত পেলোৱা",
    remindersSubtitle: "ঔষধ, পানী আৰু এপইণ্টমেণ্টৰ বাবে সহজ দৈনিক সহায়।",
    addReminder: "যোগ কৰক",
    done: "সম্পন্ন",
    completed: "সম্পন্ন হ'ল",
    markedDone: "সম্পন্ন হিচাপে চিহ্নিত",
    reminderAdded: "মনত পেলোৱা যোগ হ'ল",
    noReminders: "এতিয়া সকলো সম্পন্ন। কোনো বাকী নাই।",
    languageTitle: "ভাষা আৰু কণ্ঠ",
    languageSubtitle: "উত্তৰ-পূৱাঞ্চলৰ ভাষিক বৈচিত্ৰ্যৰ বাবে নিৰ্মিত।",
    choosePreferred: "পছন্দৰ ভাষা বাছক",
    choosePreferredText: "ইণ্টাৰফেচ, খেলৰ নিৰ্দেশ, মনত পেলোৱা আৰু কণ্ঠ ৰোগীৰ বাছি লোৱা ভাষাত হ'ব।",
    voiceAssistance: "কণ্ঠ সহায়",
    voiceAssistanceText: "যিসকলে সৰু লিখা পঢ়াত অসুবিধা পায় তেওঁলোকৰ বাবে।",
    readInstructions: "নিৰ্দেশ ডাঙৰকৈ পঢ়ক",
    dailyGreeting: "দৈনিক অভিবাদন",
    reminderAnnounce: "মনত পেলোৱা ঘোষণা",
    gameFeedback: "খেলৰ প্ৰতিক্ৰিয়া",
    play_btn: "চলাওক",
    accessibilityPrinciple: "অভিগম্যতা নীতি",
    accessibilityPrincipleText: "সৰু বাক্য • চিনাকি শব্দ • ডাঙৰ নিয়ন্ত্ৰণ • কণ্ঠ-প্ৰথম সহায়।",
    howItWorks: "বহুভাষিক এআই কেনেকৈ কাম কৰে",
    step1t: "১. পছন্দ চিনাক্ত কৰক",
    step1d: "ৰোগী বা যত্নকাৰীয়ে পছন্দৰ ভাষা বাছে।",
    step2t: "২. বিষয়বস্তু অনুবাদ",
    step2d: "খেলৰ সংকেত, মনত পেলোৱা আৰু পথনিৰ্দেশ বাছি লোৱা ভাষা ব্যৱহাৰ কৰে।",
    step3t: "৩. কণ্ঠ আউটপুট",
    step3d: "টেক্সট-টু-স্পিচে গুৰুত্বপূৰ্ণ তথ্য ডাঙৰকৈ পঢ়ে।",
    step4t: "৪. সহজ ৰাখক",
    step4d: "এআইয়ে ৰোগীৰ স্তৰ অনুসৰি শব্দ আৰু কঠিনতা ঠিক কৰে।",
    languageChanged: "ভাষা সলনি কৰা হ'ল:",
    caregiverTitle: "যত্নকাৰী ডেশ্ববৰ্ড",
    caregiverSubtitle: "সহজ, গোপনীয়তা-প্ৰথম প্ৰগতি নিৰীক্ষণ।",
    synced: "২ মিনিট আগতে ছিংক হ'ল",
    score7: "৭-দিনৰ স্ক'ৰ",
    memAccuracy: "স্মৃতিৰ সঠিকতা",
    engagement: "সম্পৃক্ততা",
    perWeek: "/ সপ্তাহ",
    alerts: "সতৰ্কবাণী",
    needsReview: "পৰ্যালোচনা দৰকাৰ",
    weeklyInsight: "এআই সাপ্তাহিক অন্তৰ্দৃষ্টি",
    weeklyInsightText: "স্মৃতি আৰু মনোযোগৰ স্ক'ৰ ঊৰ্ধ্বমুখী। সৰু দৈনিক ছেছন চলাই যোৱাৰ পৰামৰ্শ।",
    memory: "স্মৃতি",
    attention: "মনোযোগ",
    patternRec: "আৰ্হি চিনাক্তকৰণ",
    careAlerts: "যত্ন সতৰ্কবাণী",
    missedHydration: "পানীৰ মনত পেলোৱা মিছ হ'ল",
    review: "পৰ্যালোচনা",
    noUrgent: "কোনো জৰুৰী সতৰ্কবাণী নাই",
    healthy: "সুস্থ",
    profileTitle: "প্ৰ'ফাইল আৰু অভিগম্যতা",
    profileSubtitle: "বয়স্ক ব্যৱহাৰকাৰীৰ বাবে: ডাঙৰ নিয়ন্ত্ৰণ, কণ্ঠ সহায় আৰু চিনাকি দৃশ্য।",
    voiceAssist: "কণ্ঠ সহায়",
    testVoice: "কণ্ঠ পৰীক্ষা",
    largeText: "ডাঙৰ লিখা ম'ড",
    enable: "সক্ষম কৰক",
    offlineMode: "অফলাইন ম'ড",
    ready: "সাজু",
    change: "সলনি",
    v_welcome: "নমস্কাৰ অনিল। আপোনাৰ আজিৰ মগজুৰ অনুশীলন সাজু হৈছে।",
    v_instructions: "বস্তুটো ভালদৰে চাওক, তাৰ পিছত আপুনি দেখা বস্তুটো বাছক।",
    v_reminder: "আপোনাৰ ঔষধ খোৱাৰ সময় হৈছে।",
    v_correct: "শুদ্ধ উত্তৰ। বহুত ভাল। আগবাঢ়ি যাওক।",
  },
  mni: {
    langName: "Manipuri",
    nav_day: "My Day",
    nav_games: "Cognitive Games",
    nav_memory: "Memory Coach",
    nav_family: "Family Memories",
    nav_journal: "Voice Journal",
    nav_reminders: "Reminders",
    nav_language: "Language & Voice",
    nav_caregiver: "Caregiver View",
    nav_profile: "Profile",
    patientMode: "Patient mode",
    greeting: "নমস্কাৰ অনিল",
    dateLine: "Ngasi nahakki pukning active thamu.",
    voice: "Voice",
    language: "Language",
    heroTitle: "Nahakki brain workout shajaba leire",
    heroText:
      "Ngasigi session-na memory, attention amasung pattern recognition punsille. Difficulty-na nahakki performance-gi matung inna hongi.",
    heroStart: "10-min session hougatlu",
    listen: "Listen",
    stat_score: "Cognitive score",
    stat_streak: "Memory streak",
    stat_games: "Ngasigi games",
    stat_mood: "Mood check",
    streakBest: "Best: 15 numit",
    oneMore: "Ama hendok loire",
    tapMood: "Update touba tap tou",
    recommended: "Nahakkidamak recommend toure",
    aiAdapted: "AI ADAPTED",
    weeklyTrend: "Weekly cognitive trend",
    aiInsightTrend: "AI insight: memory performance phagat-halli.",
    todayReminders: "Ngasigi reminders",
    recentActivity: "Recent activity",
    upcoming: "Upcoming",
    tomorrow: "Hayeng",
    gamesTitle: "Cognitive Games",
    gamesSubtitle: "Game-na nahakki performance-gi matung inna hongi — timer leite.",
    play: "Play",
    start: "Start",
    g_memory_name: "Remember & Match",
    g_memory_desc: "Object, maithong amasung khangba mapham ningsing-u.",
    g_focus_name: "Focus Finder",
    g_focus_desc: "Target-ga chanaba object thidok-u.",
    g_pattern_name: "Pattern Path",
    g_pattern_desc: "Laiba visual pattern loisin-u.",
    round: "Round",
    score: "Score",
    streakLabel: "Streak",
    memoryInstruction: "Object asi ningthina yeng-u, adudagi nahakna ubasi khan-u.",
    focusInstruction: "Mathakta utpa target-ga chanaba object-ta tap tou.",
    patternInstruction: "Pattern-gi matung tanaba object khan-u.",
    memorize: "Ningsing-u...",
    correct: "Correct! Phaba thabak",
    tryAgain: "Phaba hotnaba. Makha chatsi",
    sessionComplete: "Session loire!",
    accuracy: "Accuracy",
    playAgain: "Amuk play tou",
    backToGames: "Games-ta hallak-u",
    remindersTitle: "Eigi Reminders",
    remindersSubtitle: "Hidak, ising amasung appointment-gi laiba mateng.",
    addReminder: "Reminder hapchillu",
    done: "Done",
    completed: "Loire",
    markedDone: "Loire haina mark toure",
    reminderAdded: "Reminder hapchille",
    noReminders: "Houjik loire. Reminder leitre.",
    languageTitle: "Language & Voice",
    languageSubtitle: "North Eastern Region-gi lon kanglon-gidamak shaba.",
    choosePreferred: "Pamba lon khan-u",
    choosePreferredText: "Interface, game instruction, reminder amasung voice-na patient-na khanba lon-da chatkani.",
    voiceAssistance: "Voice assistance",
    voiceAssistanceText: "Apikpa text paba nattraga screen navigate touba wana leiba mising-gidamak.",
    readInstructions: "Instruction laose paar-u",
    dailyGreeting: "Numit khudinggi khurumjari",
    reminderAnnounce: "Reminder announcement",
    gameFeedback: "Game feedback",
    play_btn: "Play",
    accessibilityPrinciple: "Accessibility principle",
    accessibilityPrincipleText: "Apikpa wahei • khangba wahei • achouba control • voice-first mateng.",
    howItWorks: "Multilingual AI-na karamna thabak toubage",
    step1t: "1. Pamba khangdok-u",
    step1d: "Patient nattraga caregiver-na pamba lon khalli.",
    step2t: "2. Content translate tou",
    step2d: "Game prompt, reminder amasung guidance-na khanba lon shijinnari.",
    step3t: "3. Voice output",
    step3d: "Text-to-speech-na maruoiba wafam laose pari.",
    step4t: "4. Laina thamu",
    step4d: "AI-na patient-gi level-gi matung inna wahei difficulty hongdok-i.",
    languageChanged: "Lon hongle:",
    caregiverTitle: "Caregiver Dashboard",
    caregiverSubtitle: "Laiba, privacy-first progress monitoring.",
    synced: "2 min mamangda sync toure",
    score7: "7-numit score",
    memAccuracy: "Memory accuracy",
    engagement: "Engagement",
    perWeek: "/ chayol",
    alerts: "Alerts",
    needsReview: "Review chang-i",
    weeklyInsight: "AI weekly insight",
    weeklyInsightText: "Memory amasung attention score wangkhatlakli. Apikpa numit khudinggi session makha chatnaba tak-i.",
    memory: "Memory",
    attention: "Attention",
    patternRec: "Pattern recognition",
    careAlerts: "Care alerts",
    missedHydration: "Ising reminder ngamdre",
    review: "Review",
    noUrgent: "Urgent alert leite",
    healthy: "Healthy",
    profileTitle: "Profile & Accessibility",
    profileSubtitle: "Ahal lamangda: achouba control, voice assistance amasung khangba visual.",
    voiceAssist: "Voice assistance",
    testVoice: "Voice test tou",
    largeText: "Achouba text mode",
    enable: "Enable",
    offlineMode: "Offline mode",
    ready: "Ready",
    change: "Hongdok",
    v_welcome: "নমস্কাৰ অনিল। আপোনগী cognitive session শাজু লৈ।",
    v_instructions: "Object অসি নংগী অমসুং হাইরিবা object অসি শিজিন্নৌ।",
    v_reminder: "ঔষধ লৌবগী মতম লৈরে।",
    v_correct: "Correct। মাংজাও থোকপা।",
  },
}

export type TKey = keyof Dict
