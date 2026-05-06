import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ModuleHeader } from '../shell/ModuleHeader'
import type { Food, MealEntry } from '../../shared/domain-types'
import { MealQuickAdd } from './MealQuickAdd'
import { MealEntryModal } from './MealEntryModal'
import { MealJournalList } from './MealJournalList'
import { FoodAnalyticsSection } from './FoodAnalyticsSection'
import { FoodDetailPanel } from './FoodDetailPanel'
import { useFoodStore } from './food-store'

interface FoodViewProps {
  newItemRequestId?: number
  onNewItemHandled?: (requestId: number) => void
  highlightEntryId?: string
}

function todayDateKey(): string {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function deriveFoods(entries: MealEntry[]): Food[] {
  const map = new Map<string, Food>()
  for (const entry of entries) {
    if (!map.has(entry.foodId)) {
      map.set(entry.foodId, {
        id: entry.foodId,
        name: entry.foodName,
        normalizedName: entry.foodName.toLowerCase(),
        groupFoodId: null,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function countInPeriod(entries: MealEntry[], period: 'week' | 'month'): number {
  const now = new Date()
  if (period === 'month') {
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return entries.filter((entry) => entry.date.startsWith(key)).length
  }

  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = new Date(now)
  start.setDate(now.getDate() + mondayOffset)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return entries.filter((entry) => {
    const date = new Date(`${entry.date}T12:00:00`)
    return date >= start && date <= end
  }).length
}

export function FoodView({
  newItemRequestId,
  onNewItemHandled,
  highlightEntryId,
}: FoodViewProps): React.JSX.Element {
  const {
    entries,
    analytics,
    filters,
    loadEntries,
    loadAnalytics,
    updateEntry,
    deleteEntry,
    setFoodGroup,
    setFilters,
    clearFilters,
  } = useFoodStore(
    useShallow((state) => ({
      entries: state.entries,
      analytics: state.analytics,
      filters: state.filters,
      loadEntries: state.loadEntries,
      loadAnalytics: state.loadAnalytics,
      updateEntry: state.updateEntry,
      deleteEntry: state.deleteEntry,
      setFoodGroup: state.setFoodGroup,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
    }))
  )

  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month'>('week')
  const [quickAddSignal, setQuickAddSignal] = useState<number | undefined>(undefined)
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const foods = useMemo(() => deriveFoods(entries), [entries])
  const hasFilter = Boolean(filters.query || filters.foodId)

  useEffect(() => {
    void loadEntries()
  }, [filters, loadEntries])

  useEffect(() => {
    void loadAnalytics(todayDateKey(), analyticsPeriod)
  }, [analyticsPeriod, loadAnalytics])

  useEffect(() => {
    if (typeof newItemRequestId === 'number') {
      setQuickAddSignal(newItemRequestId)
      onNewItemHandled?.(newItemRequestId)
    }
  }, [newItemRequestId, onNewItemHandled])

  async function handleEditSave(data: {
    foodName: string
    mealType: MealEntry['mealType']
    mealTime: string
    notes?: string | null
  }): Promise<void> {
    if (!editingEntry) return
    await updateEntry(editingEntry.id, data)
    setEditingEntry(null)
    void loadAnalytics(todayDateKey(), analyticsPeriod)
  }

  function handleSelectFood(entry: MealEntry): void {
    const food = foods.find((item) => item.id === entry.foodId)
    if (food) {
      setSelectedFood(food)
      setFilters({ foodId: food.id, query: undefined })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ModuleHeader
        moduleId="food"
        right={
          <button type="button" onClick={() => setQuickAddSignal(Date.now())}>
            + Log Meal
          </button>
        }
      />
      <div style={{ display: 'flex', minHeight: 0, flex: 1 }}>
        <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <MealQuickAdd
            requestFocusSignal={quickAddSignal}
            onSaved={() => {
              void loadAnalytics(todayDateKey(), analyticsPeriod)
            }}
          />
          <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0, flex: 1 }}>
            <FoodAnalyticsSection
              analytics={analytics}
              period={analyticsPeriod}
              onSelectPeriod={setAnalyticsPeriod}
            />

            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <input
                aria-label="Search food history"
                value={filters.query ?? ''}
                onChange={(event) => setFilters({ query: event.target.value || undefined, foodId: undefined })}
                placeholder="Search food history"
                style={{ flex: 1, height: 38, padding: '0 var(--space-3)' }}
              />
              {hasFilter ? (
                <button type="button" onClick={clearFilters}>
                  Clear
                </button>
              ) : null}
            </div>

            {hasFilter ? (
              <div
                aria-label="Food filter counts"
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-small)',
                }}
              >
                <span>Current week: {countInPeriod(entries, 'week')}</span>
                <span>Current month: {countInPeriod(entries, 'month')}</span>
              </div>
            ) : null}

            <section
              aria-label="Recent meal journal"
              style={{ minHeight: 0, flex: 1, overflowY: 'auto', paddingRight: 'var(--space-1)' }}
            >
              <MealJournalList
                entries={entries}
                highlightEntryId={highlightEntryId}
                onEdit={setEditingEntry}
                onDelete={(id) => {
                  void deleteEntry(id)
                  void loadAnalytics(todayDateKey(), analyticsPeriod)
                }}
                onSelectFood={handleSelectFood}
              />
            </section>
          </div>
        </main>
        <FoodDetailPanel
          selectedFood={selectedFood}
          foods={foods}
          onClose={() => setSelectedFood(null)}
          onSetFoodGroup={async (foodId, groupFoodId) => {
            await setFoodGroup(foodId, groupFoodId)
            setSelectedFood(null)
          }}
        />
      </div>

      {editingEntry ? (
        <MealEntryModal
          mode="edit"
          entry={editingEntry}
          onSave={handleEditSave}
          onClose={() => setEditingEntry(null)}
        />
      ) : null}
    </div>
  )
}
