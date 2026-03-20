import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Category } from '../../shared/domain-types'
import { InlineCategoryForm } from './InlineCategoryForm'

interface CategoryPickerProps {
  categories: Category[]
  selectedId: string | null
  onChange: (id: string) => void
  onCreateCategory: (data: { name: string; color: string }) => Promise<Category | null>
  hasError?: boolean
}

export function CategoryPicker({
  categories,
  selectedId,
  onChange,
  onCreateCategory,
  hasError,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const [showInlineForm, setShowInlineForm] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = categories.find((c) => c.id === selectedId) ?? null

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setShowInlineForm(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleCreateCategory(data: { name: string; color: string }) {
    const created = await onCreateCategory(data)
    if (created) {
      onChange(created.id)
      setShowInlineForm(false)
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          if (open) setShowInlineForm(false)
        }}
        style={{
          width: '100%',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-2)',
          background: 'var(--color-bg-base)',
          border: `1px solid ${hasError ? 'var(--color-destructive)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: selected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          fontSize: 'var(--font-size-body)',
          cursor: 'pointer',
          gap: 'var(--space-2)',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {selected && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: selected.color ?? 'var(--color-text-muted)',
                flexShrink: 0,
              }}
            />
          )}
          <span>{selected ? selected.name : 'Select category'}</span>
        </span>
        <ChevronDown size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '2px',
            backgroundColor: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            zIndex: 1000,
            maxHeight: '240px',
            overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onChange(cat.id)
                setOpen(false)
                setShowInlineForm(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                width: '100%',
                padding: 'var(--space-2) var(--space-4)',
                background: cat.id === selectedId ? 'var(--color-bg-subtle)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor =
                  cat.id === selectedId ? 'var(--color-bg-subtle)' : 'transparent'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: cat.color ?? 'var(--color-text-muted)',
                  flexShrink: 0,
                }}
              />
              <span>{cat.name}</span>
            </button>
          ))}

          {/* Separator */}
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: 0 }} />

          {/* + New Category button or inline form */}
          {showInlineForm ? (
            <InlineCategoryForm
              onSave={handleCreateCategory}
              onCancel={() => setShowInlineForm(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowInlineForm(true)}
              style={{
                display: 'block',
                width: '100%',
                padding: 'var(--space-2) var(--space-4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-small)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              }}
            >
              + New Category
            </button>
          )}
        </div>
      )}
    </div>
  )
}
