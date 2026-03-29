import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContextMenu } from '../src/renderer/shared/ContextMenu'

describe('ContextMenu tag behaviors', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a checkmark for checked rows', () => {
    render(
      <ContextMenu
        items={[
          {
            label: 'Work',
            checked: true,
            onClick: vi.fn(),
          },
        ]}
        position={{ x: 40, y: 40 }}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /work/i })).toBeInTheDocument()
  })

  it('opens a nested panel for rows with children', () => {
    render(
      <ContextMenu
        items={[
          {
            label: 'Tags',
            onClick: vi.fn(),
            children: [
              {
                label: 'Work',
                onClick: vi.fn(),
              },
            ],
          },
        ]}
        position={{ x: 40, y: 40 }}
        onClose={vi.fn()}
      />
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: /tags/i }))

    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('keeps the menu open when closeOnClick is false', () => {
    const onClose = vi.fn()
    const onToggle = vi.fn()

    render(
      <ContextMenu
        items={[
          {
            label: 'Tags',
            onClick: vi.fn(),
            children: [
              {
                label: 'Work',
                onClick: onToggle,
                closeOnClick: false,
              },
            ],
          },
        ]}
        position={{ x: 40, y: 40 }}
        onClose={onClose}
      />
    )

    fireEvent.mouseEnter(screen.getByRole('button', { name: /tags/i }))
    fireEvent.click(screen.getByRole('button', { name: /work/i }))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps destructive styling for destructive rows', () => {
    render(
      <ContextMenu
        items={[
          {
            label: 'Delete',
            onClick: vi.fn(),
            destructive: true,
          },
        ]}
        position={{ x: 40, y: 40 }}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /delete/i })).toHaveStyle({
      color: 'var(--color-destructive)',
    })
  })
})
