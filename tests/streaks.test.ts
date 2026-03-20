// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateStreaks, isScheduledOn, getTodayStr } from '../src/main/utils/streaks'

// We'll mock date-fns format for deterministic tests
// But we use vi.mock selectively

describe('isScheduledOn', () => {
  it('returns true for scheduled days', () => {
    // Mon-Fri habit: '0111110' (index 0=Sun, 1=Mon, ...6=Sat)
    const habit = { daysOfWeek: '0111110' }
    // Monday = getDay() = 1
    expect(isScheduledOn(habit as any, '2024-01-01')).toBe(true) // 2024-01-01 is a Monday
  })

  it('returns false for unscheduled days', () => {
    // Mon-Fri habit: '0111110'
    const habit = { daysOfWeek: '0111110' }
    // 2024-01-06 is a Saturday = getDay() = 6
    expect(isScheduledOn(habit as any, '2024-01-06')).toBe(false)
  })

  it('returns true for every day of the week for daily habit', () => {
    const habit = { daysOfWeek: '1111111' }
    expect(isScheduledOn(habit as any, '2024-01-01')).toBe(true) // Monday
    expect(isScheduledOn(habit as any, '2024-01-06')).toBe(true) // Saturday
    expect(isScheduledOn(habit as any, '2024-01-07')).toBe(true) // Sunday
  })

  it('returns correct boolean for Mon/Wed/Fri habit', () => {
    // Mon=1, Wed=3, Fri=5 => daysOfWeek: '0101010' — indices 1,3,5 are 1
    // Actually: index 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Mon+Wed+Fri = '0101010'
    const habit = { daysOfWeek: '0101010' }
    // 2024-01-01 = Monday (getDay()=1)
    expect(isScheduledOn(habit as any, '2024-01-01')).toBe(true) // Mon
    // 2024-01-02 = Tuesday
    expect(isScheduledOn(habit as any, '2024-01-02')).toBe(false) // Tue
    // 2024-01-03 = Wednesday
    expect(isScheduledOn(habit as any, '2024-01-03')).toBe(true) // Wed
    // 2024-01-04 = Thursday
    expect(isScheduledOn(habit as any, '2024-01-04')).toBe(false) // Thu
    // 2024-01-05 = Friday
    expect(isScheduledOn(habit as any, '2024-01-05')).toBe(true) // Fri
    // 2024-01-06 = Saturday
    expect(isScheduledOn(habit as any, '2024-01-06')).toBe(false) // Sat
    // 2024-01-07 = Sunday
    expect(isScheduledOn(habit as any, '2024-01-07')).toBe(false) // Sun
  })
})

describe('getTodayStr', () => {
  it('returns YYYY-MM-DD format in local timezone', () => {
    const today = getTodayStr()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('calculateStreaks', () => {
  it('returns zero streaks when no completions', () => {
    const habit = { daysOfWeek: '1111111' }
    const result = calculateStreaks(habit as any, [])
    expect(result).toEqual({ currentStreak: 0, bestStreak: 0 })
  })

  it('Mon-Fri habit completed Mon-Thu, today is Fri (not yet completed) -> currentStreak = 4 (grace for today)', () => {
    // Today is Friday 2024-01-05 (Fri = scheduled)
    // Completed: Mon 2024-01-01, Tue 2024-01-02, Wed 2024-01-03, Thu 2024-01-04
    const habit = { daysOfWeek: '0111110' } // Mon-Fri
    const completions = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04']
    const result = calculateStreaks(habit as any, completions, '2024-01-05') // Friday
    expect(result.currentStreak).toBe(4)
  })

  it('Mon-Fri habit completed Mon-Fri -> currentStreak = 5', () => {
    const habit = { daysOfWeek: '0111110' } // Mon-Fri
    const completions = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05']
    const result = calculateStreaks(habit as any, completions, '2024-01-05') // Friday
    expect(result.currentStreak).toBe(5)
  })

  it('Mon/Wed/Fri habit, completed Mon+Wed, missed Fri, today is next Mon (not yet completed) -> currentStreak = 0', () => {
    // Mon=2024-01-01, Wed=2024-01-03, Fri=2024-01-05 (missed)
    // Next Mon=2024-01-08 (today, not yet completed)
    const habit = { daysOfWeek: '0101010' } // Mon/Wed/Fri
    const completions = ['2024-01-01', '2024-01-03']
    const result = calculateStreaks(habit as any, completions, '2024-01-08') // Next Monday
    expect(result.currentStreak).toBe(0)
  })

  it('daily habit, completed last 10 days -> currentStreak = 10', () => {
    const habit = { daysOfWeek: '1111111' }
    // Today is 2024-01-15, completed 10 days from 2024-01-06 to 2024-01-15
    const completions = [
      '2024-01-06', '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10',
      '2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15'
    ]
    const result = calculateStreaks(habit as any, completions, '2024-01-15')
    expect(result.currentStreak).toBe(10)
  })

  it('Mon/Wed/Fri habit completed 3 weeks straight -> bestStreak = 9', () => {
    const habit = { daysOfWeek: '0101010' } // Mon/Wed/Fri
    // 3 weeks: Mon Jan 1, Wed Jan 3, Fri Jan 5, Mon Jan 8, Wed Jan 10, Fri Jan 12, Mon Jan 15, Wed Jan 17, Fri Jan 19
    const completions = [
      '2024-01-01', '2024-01-03', '2024-01-05',
      '2024-01-08', '2024-01-10', '2024-01-12',
      '2024-01-15', '2024-01-17', '2024-01-19'
    ]
    const result = calculateStreaks(habit as any, completions, '2024-01-19')
    expect(result.bestStreak).toBe(9)
  })

  it('bestStreak is max of current and any historical run', () => {
    const habit = { daysOfWeek: '1111111' }
    // Historical run of 5 days, then a break, then current run of 3
    const completions = [
      '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', // 5-day run
      // break on Jan 6, Jan 7
      '2024-01-08', '2024-01-09', '2024-01-10' // current 3-day run
    ]
    const result = calculateStreaks(habit as any, completions, '2024-01-10')
    expect(result.bestStreak).toBe(5)
    expect(result.currentStreak).toBe(3)
  })

  it('unscheduled days (Sat/Sun for Mon-Fri habit) do NOT break streak', () => {
    const habit = { daysOfWeek: '0111110' } // Mon-Fri
    // Completed all Mon-Fri for 2 weeks; Sat/Sun skipped but shouldn't break it
    const completions = [
      '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', // week 1 Mon-Fri
      // Sat Jan 6, Sun Jan 7 not in completions
      '2024-01-08', '2024-01-09', '2024-01-10', '2024-01-11', '2024-01-12'  // week 2 Mon-Fri
    ]
    const result = calculateStreaks(habit as any, completions, '2024-01-12')
    expect(result.currentStreak).toBe(10)
  })
})
