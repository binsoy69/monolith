import { Notification } from 'electron'
import type { NotificationConstructorOptions } from 'electron'
import { getDb } from '../db/connection'
import { HabitRepository } from '../repositories/HabitRepository'
import { getStore } from '../settings/store'
import type { Habit } from '../../shared/domain-types'
import type { ShellNavigatePayload } from '../../shared/ipc-types'

export interface HabitReminderSnapshot {
  notificationsEnabled: boolean
  notificationTime: string
  lastReminderDate: string | null
}

interface MainWindowLike {
  isMinimized: () => boolean
  restore: () => void
  focus: () => void
  webContents: {
    send: (channel: 'shell:navigate', payload: ShellNavigatePayload) => void
  }
}

interface NotificationLike {
  on: (event: 'click', listener: () => void) => void
  show: () => void
}

interface HabitReminderServiceOptions {
  getMainWindow?: () => MainWindowLike | null
  createNotification?: (options: NotificationConstructorOptions) => NotificationLike
  loadSnapshot?: () => Promise<HabitReminderSnapshot>
  setLastReminderDate?: (date: string) => Promise<void>
  getUncheckedCount?: (date: string) => number
  setIntervalFn?: typeof setInterval
  clearIntervalFn?: typeof clearInterval
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMinutesFromTimeString(value: string): number | null {
  const [hoursText, minutesText] = value.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

function getCurrentMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes()
}

function isHabitCompleted(habit: Pick<Habit, 'kind' | 'targetCount'>, value: number): boolean {
  if (habit.kind === 'count') {
    return value >= (habit.targetCount ?? 1)
  }

  return value > 0
}

function getUncheckedScheduledHabitCount(date: string): number {
  const repo = new HabitRepository(getDb())
  const habits = repo.listActive()
  const completionValuesByHabitId = new Map(
    repo.getCompletionValuesForDate(date).map((row) => [row.habitId, row.value]),
  )
  const dayIndex = new Date(`${date}T12:00:00`).getDay()

  return habits.filter((habit) => {
    if (habit.daysOfWeek[dayIndex] !== '1') {
      return false
    }

    const value = completionValuesByHabitId.get(habit.id) ?? 0
    return !isHabitCompleted(habit, value)
  }).length
}

async function loadSnapshotFromStore(): Promise<HabitReminderSnapshot> {
  const store = await getStore()

  return {
    notificationsEnabled: store.get('notificationsEnabled', false),
    notificationTime: store.get('notificationTime', '09:00'),
    lastReminderDate: store.get('_lastHabitReminderDate') || null,
  }
}

async function persistLastReminderDate(date: string): Promise<void> {
  const store = await getStore()
  store.set('_lastHabitReminderDate', date)
}

export function shouldSendHabitReminder(
  snapshot: HabitReminderSnapshot,
  now: Date,
  uncheckedCount: number
): boolean {
  if (!snapshot.notificationsEnabled || uncheckedCount <= 0) {
    return false
  }

  const today = formatLocalDate(now)
  if (snapshot.lastReminderDate === today) {
    return false
  }

  const scheduledMinutes = getMinutesFromTimeString(snapshot.notificationTime)
  if (scheduledMinutes === null) {
    return false
  }

  return getCurrentMinutes(now) >= scheduledMinutes
}

export class HabitReminderService {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private readonly getMainWindow: () => MainWindowLike | null
  private readonly createNotification: (options: NotificationConstructorOptions) => NotificationLike
  private readonly loadSnapshot: () => Promise<HabitReminderSnapshot>
  private readonly setLastReminderDate: (date: string) => Promise<void>
  private readonly getUncheckedCount: (date: string) => number
  private readonly setIntervalFn: typeof setInterval
  private readonly clearIntervalFn: typeof clearInterval

  constructor(options: HabitReminderServiceOptions = {}) {
    this.getMainWindow = options.getMainWindow ?? (() => null)
    this.createNotification = options.createNotification ?? ((notificationOptions) => new Notification(notificationOptions))
    this.loadSnapshot = options.loadSnapshot ?? loadSnapshotFromStore
    this.setLastReminderDate = options.setLastReminderDate ?? persistLastReminderDate
    this.getUncheckedCount = options.getUncheckedCount ?? getUncheckedScheduledHabitCount
    this.setIntervalFn = options.setIntervalFn ?? setInterval
    this.clearIntervalFn = options.clearIntervalFn ?? clearInterval
  }

  start(): void {
    this.stop()
    void this.checkNow()
    this.intervalId = this.setIntervalFn(() => void this.checkNow(), 60_000)
  }

  stop(): void {
    if (this.intervalId) {
      this.clearIntervalFn(this.intervalId)
      this.intervalId = null
    }
  }

  async checkNow(now = new Date()): Promise<void> {
    const today = formatLocalDate(now)
    const snapshot = await this.loadSnapshot()
    const uncheckedCount = this.getUncheckedCount(today)

    if (!shouldSendHabitReminder(snapshot, now, uncheckedCount)) {
      return
    }

    const notification = this.createNotification({
      title: 'Habits remaining',
      body: `${uncheckedCount} habits unchecked today`,
    })

    notification.on('click', () => {
      const mainWindow = this.getMainWindow()
      if (!mainWindow) {
        return
      }

      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }

      mainWindow.focus()
      mainWindow.webContents.send('shell:navigate', { module: 'habits' })
    })

    notification.show()
    await this.setLastReminderDate(today)
  }
}
