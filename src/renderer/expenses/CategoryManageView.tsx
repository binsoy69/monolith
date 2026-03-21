import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Category } from '../../shared/domain-types'
import { InlineCategoryForm } from './InlineCategoryForm'

const PRESET_COLORS = [
  '#f97316', '#3b82f6', '#ef4444', '#a855f7',
  '#ec4899', '#22c55e', '#6b7280', '#eab308',
  '#14b8a6', '#8b5cf6', '#f43f5e', '#06b6d4',
]

interface CategoryManageViewProps {
  categories: Category[]
  onUpdate: (id: string, data: { name?: string; color?: string }) => void
  onDelete: (id: string) => Promise<boolean>
  onCreate?: (data: { name: string; color: string }) => void
}

interface EditingState {
  id: string
  field: 'name' | 'color'
  value: string
}

export function CategoryManageView({ categories, onUpdate, onDelete, onCreate }: CategoryManageViewProps) {
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  function startEditName(cat: Category) {
    setEditing({ id: cat.id, field: 'name', value: cat.name })
    setNameInput(cat.name)
  }

  function saveName(id: string) {
    if (nameInput.trim()) {
      onUpdate(id, { name: nameInput.trim() })
    }
    setEditing(null)
  }

  function handleColorClick(catId: string, color: string) {
    onUpdate(catId, { color })
    setEditing(null)
  }

  async function handleDelete(id: string) {
    await onDelete(id)
  }

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <h3
        style={{
          margin: '0 0 var(--space-4) 0',
          fontSize: 'var(--font-size-heading)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        Manage Categories
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) 0',
            }}
          >
            {/* Color dot — click to open color picker */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() =>
                  setEditing(
                    editing?.id === cat.id && editing?.field === 'color'
                      ? null
                      : { id: cat.id, field: 'color', value: cat.color ?? '' }
                  )
                }
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: cat.color ?? 'var(--color-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              />
              {/* Color palette popup */}
              {editing?.id === cat.id && editing?.field === 'color' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: 0,
                    backgroundColor: 'var(--color-bg-overlay)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    width: '120px',
                    zIndex: 500,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorClick(cat.id, color)}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: cat.color === color ? '2px solid white' : '2px solid transparent',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Name — click to edit inline */}
            {editing?.id === cat.id && editing?.field === 'name' ? (
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName(cat.id)
                  if (e.key === 'Escape') setEditing(null)
                }}
                onBlur={() => saveName(cat.id)}
                style={{
                  flex: 1,
                  height: '24px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-focused)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-body)',
                  padding: '0 var(--space-2)',
                  outline: 'none',
                }}
              />
            ) : (
              <span
                onClick={() => startEditName(cat)}
                style={{
                  flex: 1,
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-text-primary)',
                  cursor: 'text',
                  padding: '2px var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                {cat.name}
              </span>
            )}

            {/* Delete button */}
            <button
              onClick={() => handleDelete(cat.id)}
              title="Delete category"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-destructive)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add category form or button */}
      {showAddForm ? (
        <InlineCategoryForm
          onSave={(data) => {
            onCreate?.(data)
            setShowAddForm(false)
          }}
          onCancel={() => setShowAddForm(false)}
        />
      ) : onCreate ? (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-accent)',
            padding: 0,
            marginTop: 'var(--space-2)',
            textAlign: 'left',
          }}
        >
          + New Category
        </button>
      ) : null}
    </div>
  )
}
