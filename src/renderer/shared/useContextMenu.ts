import { useState, useCallback } from 'react'
import type { ContextMenuItem } from './ContextMenu'

interface ContextMenuState {
  position: { x: number; y: number }
  items: ContextMenuItem[]
} | null

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number }
    items: ContextMenuItem[]
  } | null>(null)

  const showContextMenu = useCallback((e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault()
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      items,
    })
  }, [])

  const hideContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  return { contextMenu, showContextMenu, hideContextMenu }
}
