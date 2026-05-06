import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@phosphor-icons/react', () => {
  const Icon = () => null
  return {
    Checks: Icon,
    ForkKnife: Icon,
    Pulse: Icon,
    SlidersHorizontal: Icon,
    SquaresFour: Icon,
    Wallet: Icon,
  }
})

import { Sidebar } from '../src/renderer/shell/Sidebar'
import { KeyboardRouter } from '../src/renderer/shell/KeyboardRouter'
import { CommandPalette } from '../src/renderer/shell/CommandPalette'
import { useTagsStore } from '../src/renderer/tags/tags-store'

describe('Food shell integration', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    useTagsStore.setState({
      tags: [],
      selectedTagId: null,
      items: [],
      isLoaded: true,
      assignmentCache: {},
    })
  })

  it('adds Food to sidebar navigation', () => {
    const onNavigate = vi.fn()
    useTagsStore.setState({ isLoaded: true })

    render(<Sidebar activeModule="dashboard" onNavigate={onNavigate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Food' }))
    expect(onNavigate).toHaveBeenCalledWith('food')
  })

  it('handles Alt+5, direct meal logging, and N in the Food module', () => {
    const onNavigate = vi.fn()
    const onNewItem = vi.fn()
    const onLogMeal = vi.fn()

    render(
      <KeyboardRouter
        activeModule="food"
        onNavigate={onNavigate}
        onShowShortcuts={vi.fn()}
        onEscape={vi.fn()}
        onNewItem={onNewItem}
        onCommandPalette={vi.fn()}
        onLogMeal={onLogMeal}
      />
    )

    fireEvent.keyDown(document, { key: '5', altKey: true })
    fireEvent.keyDown(document, { key: 'm' })
    fireEvent.keyDown(document, { key: 'n' })

    expect(onNavigate).toHaveBeenCalledWith('food')
    expect(onLogMeal).toHaveBeenCalled()
    expect(onNewItem).toHaveBeenCalled()
  })

  it('exposes Log meal in the command palette action list', () => {
    const onAction = vi.fn()

    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        onAction={onAction}
        results={[]}
        isSearching={false}
        onSearchQueryChange={vi.fn()}
        onSelectResult={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Log meal/ }))
    expect(onAction).toHaveBeenCalledWith('log-meal')
  })
})
