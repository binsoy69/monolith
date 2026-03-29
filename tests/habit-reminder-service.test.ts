import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HabitReminderService,
  shouldSendHabitReminder,
} from '../src/main/services/HabitReminderService'

describe('HabitReminderService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('disabled reminders never fire', () => {
    expect(
      shouldSendHabitReminder(
        {
          notificationsEnabled: false,
          notificationTime: '09:00',
          lastReminderDate: null,
        },
        new Date(2026, 2, 29, 9, 0),
        3
      )
    ).toBe(false)
  })

  it('same-day reminders do not fire twice', () => {
    expect(
      shouldSendHabitReminder(
        {
          notificationsEnabled: true,
          notificationTime: '09:00',
          lastReminderDate: '2026-03-29',
        },
        new Date(2026, 2, 29, 9, 15),
        2
      )
    ).toBe(false)
  })

  it('time earlier than notificationTime does not fire', () => {
    expect(
      shouldSendHabitReminder(
        {
          notificationsEnabled: true,
          notificationTime: '09:00',
          lastReminderDate: null,
        },
        new Date(2026, 2, 29, 8, 59),
        2
      )
    ).toBe(false)
  })

  it('clicking the notification invokes the habits shell navigation callback', async () => {
    let clickHandler: (() => void) | undefined
    const show = vi.fn()
    const createNotification = vi.fn(() => ({
      show,
      on: vi.fn((event: 'click', listener: () => void) => {
        if (event === 'click') {
          clickHandler = listener
        }
      }),
    }))
    const restore = vi.fn()
    const focus = vi.fn()
    const send = vi.fn()
    const setLastReminderDate = vi.fn().mockResolvedValue(undefined)
    const service = new HabitReminderService({
      getMainWindow: () => ({
        isMinimized: () => true,
        restore,
        focus,
        webContents: { send },
      }),
      createNotification,
      loadSnapshot: async () => ({
        notificationsEnabled: true,
        notificationTime: '09:00',
        lastReminderDate: null,
      }),
      setLastReminderDate,
      getUncheckedCount: () => 2,
    })

    await service.checkNow(new Date(2026, 2, 29, 9, 0))

    expect(createNotification).toHaveBeenCalledWith({
      title: 'Habits remaining',
      body: '2 habits unchecked today',
    })
    expect(show).toHaveBeenCalledTimes(1)
    expect(setLastReminderDate).toHaveBeenCalledWith('2026-03-29')

    clickHandler?.()

    expect(restore).toHaveBeenCalledTimes(1)
    expect(focus).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('shell:navigate', { module: 'habits' })
  })
})
