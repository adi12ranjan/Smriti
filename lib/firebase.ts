// lib/firebase.ts
// Firebase config. Set these in Vercel → Project → Settings → Environment Variables
// (or in a local .env.local file) — see .env.example. Values come from
// https://console.firebase.google.com → Project Settings → Your Apps → SDK setup.
//
// If they are NOT set, Smriti still works: it switches to "this device only" mode
// (accounts and progress are kept in the browser's local storage) instead of failing
// with "something went wrong" on login / sign up.

import { initializeApp, getApps } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// NOTE: each variable must be written out in full so Next.js can inline it.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "YOUR_APP_ID",
}

// True only when real values (not the "YOUR_..." placeholders) are present.
export const firebaseConfigured =
  !!firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith("YOUR_") &&
  !firebaseConfig.projectId.startsWith("YOUR_")

let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

if (firebaseConfigured) {
  try {
    // Prevent re-initialising on hot-reload in development
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
  } catch (e) {
    console.error("Firebase failed to initialise:", e)
  }
}

// Kept as `auth` / `db` so existing imports keep working. They are only used
// when `firebaseConfigured` is true (see app-provider.tsx).
export const auth = authInstance as Auth
export const db = dbInstance as Firestore
export const firebaseReady = firebaseConfigured && !!authInstance && !!dbInstance
