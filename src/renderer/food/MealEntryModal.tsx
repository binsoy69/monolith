import { useEffect, useState } from 'react'
import type { MealEntry, MealType } from '../../shared/domain-types'
import { inferMealType } from './MealQuickAdd'

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function todayLocalDateTime(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function isoToLocalInput(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return todayLocalDateTime()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

interface MealEntryModalProps {
  mode: 'create' | 'edit'
  entry?: MealEntry
  onSave: (data: {
    foodName: string
    mealType: MealType
    mealTime: string
    notes?: string | null
  }) => Promise<void> | void
  onClose: () => void
}

export function MealEntryModal({ mode, entry, onSave, onClose }: MealEntryModalProps): React.JSX.Element {
  const [foodName, setFoodName] = useState(entry?.foodName ?? '')
  const [mealType, setMealType] = useState<MealType>(entry?.mealType ?? inferMealType(new Date()))
  const [mealTime, setMealTime] = useState(entry ? isoToLocalInput(entry.mealTime) : todayLocalDateTime())
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSubmit(): Promise<void> {
    if (!foodName.trim()) {
      setShowError(true)
      return
    }

    await onSave({
      foodName: foodName.trim(),
      mealType,
      mealTime: new Date(mealTime).toISOString(),
      notes: notes.trim() ? notes.trim() : null,
    })
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(7, 6, 5, 0.62)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? 'Edit meal' : 'Log meal'}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(420px, 100%)',
          background: 'var(--color-bg-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.48)',
        }}
      >
        <h2 style={{ margin: '0 0 var(--space-5)', fontSize: 'var(--font-size-heading)' }}>
          {mode === 'edit' ? 'Edit meal' : 'Log meal'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label>
            <span style={{ display: 'block', marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Food
            </span>
            <input
              aria-label="Food"
              value={foodName}
              onChange={(event) => {
                setFoodName(event.target.value)
                setShowError(false)
              }}
              style={{ width: '100%', height: 38, padding: '0 var(--space-3)' }}
            />
            {showError ? (
              <span style={{ color: 'var(--color-destructive)', fontSize: 'var(--font-size-small)' }}>
                Enter a food name
              </span>
            ) : null}
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Meal type
            </span>
            <select
              aria-label="Modal meal type"
              value={mealType}
              onChange={(event) => setMealType(event.target.value as MealType)}
              style={{ width: '100%', height: 38, padding: '0 var(--space-2)' }}
            >
              {mealTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Meal time
            </span>
            <input
              aria-label="Modal meal time"
              type="datetime-local"
              value={mealTime}
              onChange={(event) => setMealTime(event.target.value)}
              style={{ width: '100%', height: 38, padding: '0 var(--space-2)', colorScheme: 'dark' }}
            />
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Notes
            </span>
            <textarea
              aria-label="Modal meal notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              style={{ width: '100%', padding: 'var(--space-2)', fontFamily: 'inherit' }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          <button type="button" onClick={onClose}>
            Discard
          </button>
          <button type="button" onClick={() => void handleSubmit()}>
            {mode === 'edit' ? 'Save changes' : 'Log meal'}
          </button>
        </div>
      </div>
    </div>
  )
}
