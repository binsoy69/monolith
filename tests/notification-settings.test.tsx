import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsView } from '../src/renderer/settings/SettingsView'
import type { AppSettings } from '../src/shared/ipc-types'
import {
  useSettings,
  useUpdateSettings,
} from '../src/renderer/settings/useSettings'

vi.mock('../src/renderer/settings/useSettings', () => ({
  useSettings: vi.fn(),
  useUpdateSettings: vi.fn(),
}))

const useSettingsMock = vi.mocked(useSettings)
const useUpdateSettingsMock = vi.mocked(useUpdateSettings)

describe('Notification settings', () => {
  let settings: AppSettings
  let mutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    settings = {
      dateFormat: 'DD/MM/YYYY',
      notificationTime: '09:00',
      notificationsEnabled: false,
    }
    mutate = vi.fn((updates: Partial<AppSettings>) => {
      settings = { ...settings, ...updates }
    })

    useSettingsMock.mockImplementation(() => ({
      data: settings,
      isLoading: false,
      isError: false,
    }) as ReturnType<typeof useSettings>)
    useUpdateSettingsMock.mockImplementation(() => ({
      mutate,
    }) as ReturnType<typeof useUpdateSettings>)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders Enable habit reminder', () => {
    render(<SettingsView />)

    expect(screen.getByText('Enable habit reminder')).toBeInTheDocument()
  })

  it('disables the time input when reminders are off', () => {
    render(<SettingsView />)

    expect(screen.getByLabelText('Habit Reminder')).toBeDisabled()
  })

  it('toggling reminders on enables the time input', () => {
    const { rerender } = render(<SettingsView />)

    fireEvent.click(screen.getByLabelText('Enable habit reminder'))

    expect(mutate).toHaveBeenCalledWith({ notificationsEnabled: true })

    rerender(<SettingsView />)

    expect(screen.getByLabelText('Habit Reminder')).toBeEnabled()
  })

  it('updating the toggle and time input calls the settings mutation hook', () => {
    const { rerender } = render(<SettingsView />)

    fireEvent.click(screen.getByLabelText('Enable habit reminder'))
    rerender(<SettingsView />)

    fireEvent.change(screen.getByLabelText('Habit Reminder'), {
      target: { value: '07:30' },
    })

    expect(mutate).toHaveBeenNthCalledWith(1, { notificationsEnabled: true })
    expect(mutate).toHaveBeenNthCalledWith(2, { notificationTime: '07:30' })
  })
})
