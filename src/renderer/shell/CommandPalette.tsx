import { useState, useEffect, useRef } from 'react'

export type PaletteAction = 'add-task' | 'log-expense' | 'check-habit'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onAction: (action: PaletteAction) => void
}

const ACTIONS: Array<{ id: PaletteAction; label: string }> = [
  { id: 'add-task', label: 'Add task' },
  { id: 'log-expense', label: 'Log expense' },
  { id: 'check-habit', label: 'Check habit' },
]

export function CommandPalette({ isOpen, onClose, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const filtered = ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  )

  // Reset query and focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  // Reset activeIndex when query changes
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Click-outside close (same setTimeout(0) pattern as KeyboardShortcutOverlay)
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen, onClose])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation() // Prevent KeyboardRouter from also handling
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault()
      onAction(filtered[activeIndex].id)
      return
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '20vh',
        zIndex: 100,
        animation: 'fadeIn var(--duration-normal) ease-out',
      }}
    >
      <div
        ref={overlayRef}
        onKeyDown={handleKeyDown}
        style={{
          width: 560,
          backgroundColor: 'var(--color-bg-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
        }}
      >
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="What do you want to do?"
          style={{
            width: '100%',
            background: 'var(--color-bg-subtle)',
            border: `1px solid ${inputFocused ? 'var(--color-border-focused)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            transition: 'border-color var(--duration-fast) ease-out',
          }}
        />

        {/* Items container */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onAction(item.id)}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-heading)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  backgroundColor: index === activeIndex ? 'var(--color-accent-subtle)' : 'transparent',
                  transition: 'background-color var(--duration-fast) ease-out',
                }}
              >
                {item.label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: 'var(--space-4)',
                textAlign: 'center',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text-muted)',
              }}
            >
              No matching actions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
