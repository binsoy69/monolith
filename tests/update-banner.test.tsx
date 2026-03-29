import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UpdateBanner } from '../src/renderer/shell/UpdateBanner'

describe('UpdateBanner', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders Restart to update for downloaded updates', () => {
    render(
      <UpdateBanner
        status={{ state: 'downloaded', version: '1.2.3' }}
        onInstall={vi.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: 'Restart to update' })
    ).toBeInTheDocument()
  })

  it('clicking Restart to update calls onInstall', () => {
    const onInstall = vi.fn()

    render(
      <UpdateBanner
        status={{ state: 'downloaded', version: '1.2.3' }}
        onInstall={onInstall}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Restart to update' }))

    expect(onInstall).toHaveBeenCalledTimes(1)
  })

  it('renders Update check failed for updater errors', () => {
    render(
      <UpdateBanner
        status={{ state: 'error', message: 'Network unavailable' }}
        onInstall={vi.fn()}
      />
    )

    expect(screen.getByText('Update check failed')).toBeInTheDocument()
  })

  it('renders Checking for updates... while the updater is polling', () => {
    render(
      <UpdateBanner status={{ state: 'checking' }} onInstall={vi.fn()} />
    )

    expect(screen.getByText('Checking for updates...')).toBeInTheDocument()
  })
})
