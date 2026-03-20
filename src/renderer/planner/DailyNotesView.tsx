import { useState, useEffect, useRef } from 'react'
import { usePlannerStore } from './planner-store'

interface DailyNotesViewProps {
  date: string
}

export function DailyNotesView({ date }: DailyNotesViewProps) {
  const { notesContent, loadNotes, saveNotes } = usePlannerStore()
  const [localContent, setLocalContent] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const hasChanged = useRef(false)
  const prevDate = useRef<string | null>(null)

  // Load notes when date changes
  useEffect(() => {
    // Flush any pending save for the previous date before switching
    if (prevDate.current && prevDate.current !== date && hasChanged.current) {
      clearTimeout(timerRef.current)
      saveNotes(prevDate.current, localContent)
    }

    // Reset change tracking for the new date
    hasChanged.current = false
    prevDate.current = date

    loadNotes(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // Sync local content when store notes change (on load)
  useEffect(() => {
    if (!hasChanged.current) {
      setLocalContent(notesContent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesContent])

  // Auto-save with 500ms debounce
  useEffect(() => {
    if (!hasChanged.current) return // skip initial load
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveNotes(date, localContent)
    }, 500)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localContent])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    hasChanged.current = true
    setLocalContent(e.target.value)
  }

  return (
    <textarea
      value={localContent}
      onChange={handleChange}
      placeholder="Write anything about today..."
      style={{
        flex: 1,
        width: '100%',
        backgroundColor: 'var(--color-bg-base)',
        border: 'none',
        color: 'var(--color-text-primary)',
        fontSize: 'var(--font-size-body)',
        lineHeight: 'var(--line-height-normal)',
        padding: 'var(--space-4)',
        resize: 'none',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    />
  )
}
