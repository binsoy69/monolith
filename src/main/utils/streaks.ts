import type { Habit } from '../../shared/domain-types'

/**
 * Parse a YYYY-MM-DD string into a local Date object.
 * Uses local timezone (NOT UTC parseISO).
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Format a Date object as YYYY-MM-DD in local timezone (NOT UTC).
 * Avoids date-fns format() to sidestep date-fns v4 ESM packaging issues
 * in the vitest node environment (_lib/protectedTokens.js missing).
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Subtract n days from a date, returning a new Date.
 */
function subtractDays(date: Date, n: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - n)
  return result
}

/**
 * Returns true if the habit is scheduled on the given date.
 * daysOfWeek bitmask: index 0 = Sunday, 1 = Monday, ..., 6 = Saturday (matches getDay())
 */
export function isScheduledOn(habit: Pick<Habit, 'daysOfWeek'>, dateStr: string): boolean {
  const date = parseLocalDate(dateStr)
  const dayIndex = date.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
  return habit.daysOfWeek[dayIndex] === '1'
}

/**
 * Returns today's date as YYYY-MM-DD string in local timezone.
 * Uses local date arithmetic (NOT .toISOString() which returns UTC).
 */
export function getTodayStr(): string {
  return formatDateLocal(new Date())
}

/**
 * Calculate current and best streak for a habit given its completion dates.
 *
 * Current streak: walk backwards from today counting consecutive SCHEDULED days
 * that were completed. Today gets grace (if scheduled but not completed today,
 * don't break streak yet — start counting from yesterday's scheduled day).
 *
 * Best streak: scan all completions sorted ascending. For each, check if
 * previous scheduled day was also completed. Track max run.
 *
 * @param habit - The habit with daysOfWeek bitmask
 * @param completionDates - Array of YYYY-MM-DD strings when habit was completed
 * @param todayOverride - Optional override for "today" (used in tests for determinism)
 */
export function calculateStreaks(
  habit: Pick<Habit, 'daysOfWeek'>,
  completionDates: string[],
  todayOverride?: string
): { currentStreak: number; bestStreak: number } {
  if (completionDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 }
  }

  const completionSet = new Set(completionDates)
  const today = todayOverride ?? getTodayStr()

  // --- Current streak ---
  let currentStreak = 0
  let cursor = today
  let firstIteration = true

  for (let safetyCounter = 0; safetyCounter < 365; safetyCounter++) {
    if (isScheduledOn(habit, cursor)) {
      if (firstIteration && !completionSet.has(cursor)) {
        // Today is scheduled but not completed — give grace, don't break streak
        // Move back to check previous scheduled days
        cursor = formatDateLocal(subtractDays(parseLocalDate(cursor), 1))
        firstIteration = false
        continue
      }

      if (completionSet.has(cursor)) {
        currentStreak++
      } else {
        // Scheduled but not completed — streak broken
        break
      }
    }
    // Unscheduled day — skip over it (doesn't break streak)

    firstIteration = false
    cursor = formatDateLocal(subtractDays(parseLocalDate(cursor), 1))
  }

  // --- Best streak ---
  // Sort completions ascending
  const sorted = [...completionDates].sort()

  let bestStreak = 0
  let runLength = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    // Walk backwards from curr to find the previous scheduled day
    // and check if it equals prev
    const prevScheduledDay = findPreviousScheduledDay(habit, curr)

    if (prevScheduledDay === prev) {
      runLength++
    } else {
      bestStreak = Math.max(bestStreak, runLength)
      runLength = 1
    }
  }
  bestStreak = Math.max(bestStreak, runLength)

  // Best streak is the max of historical and current streak
  bestStreak = Math.max(bestStreak, currentStreak)

  return { currentStreak, bestStreak }
}

/**
 * Find the previous scheduled day before the given date (exclusive).
 * Returns null if no scheduled day found within 7 days back.
 */
function findPreviousScheduledDay(
  habit: Pick<Habit, 'daysOfWeek'>,
  dateStr: string
): string | null {
  let cursor = formatDateLocal(subtractDays(parseLocalDate(dateStr), 1))

  for (let i = 0; i < 7; i++) {
    if (isScheduledOn(habit, cursor)) {
      return cursor
    }
    cursor = formatDateLocal(subtractDays(parseLocalDate(cursor), 1))
  }

  return null
}
