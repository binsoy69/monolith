import { useState } from 'react'
import type { Food } from '../../shared/domain-types'

interface FoodDetailPanelProps {
  selectedFood: Food | null
  foods: Food[]
  onSetFoodGroup: (foodId: string, groupFoodId: string | null) => Promise<void> | void
  onClose: () => void
}

export function FoodDetailPanel({
  selectedFood,
  foods,
  onSetFoodGroup,
  onClose,
}: FoodDetailPanelProps): React.JSX.Element | null {
  const [groupFoodId, setGroupFoodId] = useState(selectedFood?.groupFoodId ?? '')

  if (!selectedFood) return null

  return (
    <aside
      aria-label="Food detail"
      style={{
        width: '280px',
        borderLeft: '1px solid var(--color-border)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-small)' }}>
            Food detail
          </div>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-heading)' }}>{selectedFood.name}</h3>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Group under</span>
        <select
          aria-label="Food group"
          value={groupFoodId}
          onChange={(event) => setGroupFoodId(event.target.value)}
          style={{ height: 38, padding: '0 var(--space-2)' }}
        >
          <option value="">No group</option>
          {foods
            .filter((food) => food.id !== selectedFood.id)
            .map((food) => (
              <option key={food.id} value={food.id}>
                {food.name}
              </option>
            ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => void onSetFoodGroup(selectedFood.id, groupFoodId || null)}
      >
        Save group
      </button>
    </aside>
  )
}
