import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import type { UserLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getXPForNextLevel(
  currentXP: number,
  thresholds: Record<string, number>
): { current: number; next: number; percentage: number; nextLevel: string } {
  const levels = Object.entries(thresholds).sort(([, a], [, b]) => a - b)
  for (let i = 0; i < levels.length - 1; i++) {
    const [, currentThreshold] = levels[i]
    const [nextLevelName, nextThreshold] = levels[i + 1]
    if (currentXP >= currentThreshold && currentXP < nextThreshold) {
      const progress = currentXP - currentThreshold
      const range = nextThreshold - currentThreshold
      return {
        current: currentXP,
        next: nextThreshold,
        percentage: Math.round((progress / range) * 100),
        nextLevel: nextLevelName,
      }
    }
  }
  return { current: currentXP, next: currentXP, percentage: 100, nextLevel: 'max' }
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}…`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return '#5BA878'
  if (percentage >= 50) return '#C4A264'
  if (percentage >= 25) return '#E5974A'
  return '#D95B5B'
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const MOTIVATION_QUOTES = [
  "She believed she could, so she did.",
  "Your only limit is your mind.",
  "Consistency is the key to unlocking your CEO era.",
  "Build the business you can't stop thinking about.",
  "Every expert was once a beginner. Keep going.",
  "Success is the sum of small efforts, repeated daily.",
  "You didn't come this far to only come this far.",
  "Dream it. Plan it. Build it. Live it.",
  "Your future self is watching. Make her proud.",
  "The best investment you can make is in yourself.",
  "Don't wait for opportunity. Create it.",
  "You are one decision away from a completely different life.",
  "Work hard in silence. Let success make the noise.",
  "Successful women don't have secrets. They have systems.",
]

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length]
}
