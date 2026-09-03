import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Short relative-time label ("Just now", "12 min ago", "3 hr ago", "5 days ago")
export function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const days = Math.floor(hr / 24)
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}
