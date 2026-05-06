import { useEffect, useRef, useState } from 'react'
import type { FoodGroupingSuggestion, MealEntry, MealType } from '../../shared/domain-types'
import { useFoodStore } from './food-store'

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function inferMealType(date: Date): MealType {
  const hour = date.getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 21) return 'dinner'
  return 'snack'
}

function toLocalDateTimeInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toIsoFromLocalInput(value: string): string {
  return new Date(value).toISOString()
}

interface MealQuickAddProps {
  requestFocusSignal?: number
  onSaved?: (entry: MealEntry) => void
}

export function MealQuickAdd({ requestFocusSignal, onSaved }: MealQuickAddProps): React.JSX.Element {
  const createEntry = useFoodStore((state) => state.createEntry)
  const [foodName, setFoodName] = useState('')
  const [mealType, setMealType] = useState<MealType>(() => inferMealType(new Date()))
  const [mealTime, setMealTime] = useState(() => toLocalDateTimeInput(new Date()))
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [suggestion, setSuggestion] = useState<FoodGroupingSuggestion | null>(null)
  const [confirmedGroupFoodId, setConfirmedGroupFoodId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (typeof requestFocusSignal === 'number') {
      inputRef.current?.focus()
    }
  }, [requestFocusSignal])

  async function refreshGroupingSuggestion(name: string): Promise<void> {
    const trimmed = name.trim()
    setConfirmedGroupFoodId(null)
    if (trimmed.length < 2) {
      setSuggestion(null)
      return
    }

    const nextSuggestion = await window.api.food.getGroupingSuggestion({ foodName: trimmed })
    setSuggestion(nextSuggestion)
  }

  async function handleSuppressSuggestion(): Promise<void> {
    if (!suggestion) return
    await window.api.food.suppressGroupingSuggestion({
      inputName: foodName,
      suggestedFoodId: suggestion.suggestedFood.id,
    })
    setConfirmedGroupFoodId(null)
    setSuggestion(null)
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    const trimmed = foodName.trim()
    if (!trimmed || isSaving) return

    setIsSaving(true)
    const entry = await createEntry({
      foodName: trimmed,
      mealType,
      mealTime: toIsoFromLocalInput(mealTime),
      notes: showNotes && notes.trim() ? notes.trim() : undefined,
      confirmedGroupFoodId,
    })
    setIsSaving(false)

    if (entry) {
      setFoodName('')
      setMealType(inferMealType(new Date()))
      setMealTime(toLocalDateTimeInput(new Date()))
      setNotes('')
      setShowNotes(false)
      setSuggestion(null)
      setConfirmedGroupFoodId(null)
      onSaved?.(entry)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Quick add meal"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 132px 184px auto', gap: 'var(--space-2)' }}>
        <input
          ref={inputRef}
          value={foodName}
          onChange={(event) => setFoodName(event.target.value)}
          onBlur={() => void refreshGroupingSuggestion(foodName)}
          placeholder="Food name"
          aria-label="Food name"
          style={{ height: '38px', padding: '0 var(--space-3)' }}
        />
        <select
          aria-label="Meal type"
          value={mealType}
          onChange={(event) => setMealType(event.target.value as MealType)}
          style={{ height: '38px', padding: '0 var(--space-2)', textTransform: 'capitalize' }}
        >
          {mealTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          aria-label="Meal time"
          type="datetime-local"
          value={mealTime}
          onChange={(event) => setMealTime(event.target.value)}
          style={{ height: '38px', padding: '0 var(--space-2)', colorScheme: 'dark' }}
        />
        <button
          type="submit"
          disabled={!foodName.trim() || isSaving}
          style={{
            minWidth: '96px',
            height: '38px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent)',
            color: '#102017',
            fontWeight: 700,
            cursor: foodName.trim() && !isSaving ? 'pointer' : 'not-allowed',
            opacity: foodName.trim() && !isSaving ? 1 : 0.5,
          }}
        >
          Log meal
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setShowNotes((value) => !value)}
          style={{
            border: 'none',
            background: 'none',
            color: showNotes ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: 0,
            fontSize: 'var(--font-size-small)',
          }}
        >
          {showNotes ? 'Hide notes' : 'Add notes'}
        </button>

        {suggestion ? (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-small)',
            }}
          >
            <span>Group with {suggestion.suggestedFood.name}?</span>
            <button type="button" onClick={() => setConfirmedGroupFoodId(suggestion.suggestedFood.id)}>
              Confirm group
            </button>
            <button type="button" onClick={() => setConfirmedGroupFoodId(null)}>
              Save ungrouped
            </button>
            <button type="button" onClick={() => void handleSuppressSuggestion()}>
              Never suggest this
            </button>
            {confirmedGroupFoodId ? <span>Confirmed</span> : null}
          </div>
        ) : null}
      </div>

      {showNotes ? (
        <textarea
          aria-label="Meal notes"
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional note"
          style={{ width: '100%', padding: 'var(--space-2)', fontFamily: 'inherit' }}
        />
      ) : null}
    </form>
  )
}
