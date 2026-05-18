/**
 * Rings utility — shared helper to mark today's activity rings as done.
 * Each ring maps to a core daily action:
 *   build  → completed a roadmap step
 *   earn   → logged revenue
 *   grow   → completed all habits for the day
 */

function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function setRing(userId: string, ring: 'build' | 'earn' | 'grow') {
  try {
    const key = `${userId}_rings_${todayKey()}`
    const raw = localStorage.getItem(key)
    const current = raw ? JSON.parse(raw) : { build: false, earn: false, grow: false }
    localStorage.setItem(key, JSON.stringify({ ...current, [ring]: true }))
  } catch { /* private mode or storage blocked */ }
}
