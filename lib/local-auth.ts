// "This device only" accounts, used when Firebase isn't configured so that
// login / sign up still work. Data lives in this browser's localStorage only.
// Errors use Firebase-style codes so the app's friendly error messages apply.

type StoredUser = { uid: string; name: string; salt: string; hash: string }
type Users = Record<string, StoredUser>

const USERS_KEY = "smriti.local.users"
const SESSION_KEY = "smriti.local.session"
const dataKey = (uid: string) => `smriti.local.data.${uid}`

function fail(code: string): never {
  throw Object.assign(new Error(code), { code })
}

function readUsers(): Users {
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "{}") as Users
  } catch {
    return {}
  }
}

function randomId(): string {
  const a = new Uint8Array(12)
  window.crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("")
}

async function hashPassword(password: string, salt: string): Promise<string> {
  if (window.crypto?.subtle) {
    const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + password))
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")
  }
  return btoa(unescape(encodeURIComponent(salt + password))) // very old browsers
}

export type LocalSession = { uid: string; email: string; name: string }

export async function localSignUp(email: string, password: string, name: string): Promise<LocalSession> {
  const key = email.trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(key)) fail("auth/invalid-email")
  if (password.length < 6) fail("auth/weak-password")
  const users = readUsers()
  if (users[key]) fail("auth/email-already-in-use")
  const salt = randomId()
  const user: StoredUser = { uid: randomId(), name: name.trim(), salt, hash: await hashPassword(password, salt) }
  users[key] = user
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    fail("auth/internal-error")
  }
  return setSession(key, user)
}

export async function localSignIn(email: string, password: string): Promise<LocalSession> {
  const key = email.trim().toLowerCase()
  const user = readUsers()[key]
  if (!user) fail("auth/user-not-found")
  if ((await hashPassword(password, user.salt)) !== user.hash) fail("auth/wrong-password")
  return setSession(key, user)
}

function setSession(email: string, user: StoredUser): LocalSession {
  const session: LocalSession = { uid: user.uid, email, name: user.name }
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}
  return session
}

export function localGetSession(): LocalSession | null {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null") as LocalSession | null
  } catch {
    return null
  }
}

export function localSignOut(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {}
}

export function localReadData(uid: string): Record<string, unknown> | null {
  try {
    return JSON.parse(window.localStorage.getItem(dataKey(uid)) ?? "null")
  } catch {
    return null
  }
}

export function localWriteData(uid: string, data: unknown): void {
  try {
    window.localStorage.setItem(dataKey(uid), JSON.stringify(data))
  } catch (e) {
    console.error("Local save error:", e)
  }
}
