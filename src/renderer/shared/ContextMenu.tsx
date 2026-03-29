import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  label: string
  onClick: () => void
  destructive?: boolean
  checked?: boolean
  children?: ContextMenuItem[]
  closeOnClick?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number }
  onClose: () => void
}

const MENU_WIDTH = 180

interface MenuPanelProps {
  items: ContextMenuItem[]
  onClose: () => void
  onOpenPathChange: (path: string | null) => void
  openPath: string | null
  pathPrefix: string
  parentPath: string | null
  style?: CSSProperties
}

function getMenuPanelStyle(style?: CSSProperties): CSSProperties {
  return {
    backgroundColor: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    zIndex: 2000,
    minWidth: `${MENU_WIDTH}px`,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    padding: 'var(--space-1) 0',
    ...style,
  }
}

function MenuPanel({
  items,
  onClose,
  onOpenPathChange,
  openPath,
  pathPrefix,
  parentPath,
  style,
}: MenuPanelProps) {
  return (
    <div
      style={getMenuPanelStyle(style)}
      onClick={(event) => event.stopPropagation()}
      onMouseLeave={() => onOpenPathChange(parentPath)}
    >
      {items.map((item, index) => {
        const pathKey = pathPrefix === '' ? String(index) : `${pathPrefix}.${index}`
        const hasChildren = (item.children?.length ?? 0) > 0
        const isSubmenuOpen = hasChildren && openPath?.startsWith(pathKey) === true
        const textColor = item.destructive ? 'var(--color-destructive)' : 'var(--color-text-primary)'

        return (
          <div
            key={pathKey}
            style={{ position: 'relative' }}
            onMouseEnter={() => onOpenPathChange(hasChildren ? pathKey : parentPath)}
          >
            <button
              type="button"
              onClick={() => {
                if (hasChildren) {
                  onOpenPathChange(pathKey)
                  return
                }

                item.onClick()
                if (item.closeOnClick !== false) {
                  onClose()
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                width: '100%',
                padding: 'var(--space-2) var(--space-4)',
                background: isSubmenuOpen ? 'var(--color-bg-subtle)' : 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 'var(--font-size-body)',
                color: textColor,
                transition: `background-color var(--duration-fast) ease-out`,
              }}
              onMouseEnter={(event) => {
                ;(event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'
              }}
              onMouseLeave={(event) => {
                ;(event.currentTarget as HTMLElement).style.backgroundColor = isSubmenuOpen
                  ? 'var(--color-bg-subtle)'
                  : 'transparent'
              }}
            >
              <span style={{ width: '12px', flexShrink: 0 }}>{item.checked ? '✓' : ''}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ width: '12px', textAlign: 'right', flexShrink: 0 }}>
                {hasChildren ? '›' : ''}
              </span>
            </button>

            {hasChildren && isSubmenuOpen ? (
              <MenuPanel
                items={item.children ?? []}
                onClose={onClose}
                onOpenPathChange={onOpenPathChange}
                openPath={openPath}
                pathPrefix={pathKey}
                parentPath={pathKey}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: `calc(100% - var(--space-1))`,
                }}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuHeight = items.length * 32 + 8
  const adjustedX = Math.min(position.x, window.innerWidth - MENU_WIDTH - 8)
  const adjustedY = Math.min(position.y, window.innerHeight - menuHeight - 8)
  const [openPath, setOpenPath] = useState<string | null>(null)

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
    <MenuPanel
      items={items}
      onClose={onClose}
      onOpenPathChange={setOpenPath}
      openPath={openPath}
      pathPrefix=""
      parentPath={null}
      style={{
        position: 'fixed',
        top: adjustedY,
        left: adjustedX,
      }}
    />,
    document.body
  )
}
