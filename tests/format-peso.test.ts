import { describe, it, expect } from 'vitest'
import { formatPeso } from '../src/shared/format'

describe('formatPeso', () => {
  it('formatPeso(15000) returns "₱150"', () => {
    expect(formatPeso(15000)).toBe('₱150')
  })

  it('formatPeso(15050) returns "₱150.50"', () => {
    expect(formatPeso(15050)).toBe('₱150.50')
  })

  it('formatPeso(0) returns "₱0"', () => {
    expect(formatPeso(0)).toBe('₱0')
  })

  it('formatPeso(99) returns "₱0.99"', () => {
    expect(formatPeso(99)).toBe('₱0.99')
  })

  it('formatPeso(100) returns "₱1"', () => {
    expect(formatPeso(100)).toBe('₱1')
  })
})
