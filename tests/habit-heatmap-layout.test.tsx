// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { buildMonthLabels } from '../src/renderer/habits/HabitHeatmap'
import type { HabitHistoryPoint } from '../src/shared/ipc-types'

function makePoints(startDate: string, days: number): HabitHistoryPoint[] {
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const cursor = new Date(startYear, startMonth - 1, startDay)
  const points: HabitHistoryPoint[] = []

  for (let index = 0; index < days; index += 1) {
    const year = cursor.getFullYear()
    const month = String(cursor.getMonth() + 1).padStart(2, '0')
    const day = String(cursor.getDate()).padStart(2, '0')
    points.push({
      date: `${year}-${month}-${day}`,
      value: 0,
      completed: false,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return points
}

describe('buildMonthLabels', () => {
  it('builds labels from rendered week columns instead of raw day transitions', () => {
    const labels = buildMonthLabels(makePoints('2025-10-03', 90))

    expect(labels.length).toBeGreaterThan(0)
    expect(labels.every((label, index, list) => index === 0 || label.column >= list[index - 1]!.column)).toBe(true)
  })

  it('prefers the newer month when Dec and Jan fall inside the same week column', () => {
    const labels = buildMonthLabels(makePoints('2025-10-06', 90))

    const januaryLabel = labels.find((label) => label.label === 'Jan')
    expect(januaryLabel).toBeDefined()

    const sameColumnLabels = labels.filter((label) => label.column === januaryLabel!.column)
    expect(sameColumnLabels).toEqual([{ label: 'Jan', column: januaryLabel!.column }])
  })

  it('never emits duplicate labels for the same week column', () => {
    const labels = buildMonthLabels(makePoints('2025-10-06', 90))
    const uniqueSlots = new Set(labels.map((label) => `${label.column}:${label.label}`))
    const uniqueColumns = new Set(labels.map((label) => label.column))

    expect(uniqueSlots.size).toBe(labels.length)
    expect(uniqueColumns.size).toBe(labels.length)
  })
})
