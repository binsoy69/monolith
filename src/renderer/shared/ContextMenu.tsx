import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  label: string
  onClick: () => void
  destructive?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number }
  onClose: () => void
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  // Adjust position to stay within viewport bounds
  const menuWidth = 180
  const menuHeight = items.length * 32 + 8
  const adjustedX = Math.min(position.x, window.innerWidth - menuWidth - 8)
  const adjustedY = Math.min(position.y, window.innerHeight - menuHeight - 8)

  useEffect(() => {
    const handleClick = () => onClose()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: adjustedY,
        left: adjustedX,
        backgroundColor: 'var(--color-bg-overlay)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        zIndex: 2000,
        minWidth: `${menuWidth}px`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        padding: 'var(--space-1) 0',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick()
            onClose()
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: 'var(--space-2) var(--space-4)',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: 'var(--font-size-body)',
            color: item.destructive ? 'var(--color-destructive)' : 'var(--color-text-primary)',
            transition: `background-color var(--duration-fast) ease-out`,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
          }}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  )
}
