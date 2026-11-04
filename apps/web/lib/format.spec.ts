import { describe, expect, it } from 'vitest'
import { formatCount, formatPrice, formatRating } from './format'

describe('formatPrice', () => {
  it.each([
    [99900, '$999'],
    [129900, '$1,299'],
    [159900, '$1,599'],
    [119900, '$1,199'],
  ])('formats %i as %s', (cents, expected) => {
    expect(formatPrice(cents, 'USD')).toBe(expected)
  })

  it('uses the given currency', () => {
    expect(formatPrice(99900, 'EUR')).toContain('€')
  })
})

describe('formatCount', () => {
  it('groups thousands', () => {
    expect(formatCount(5231)).toBe('5,231')
  })
})

describe('formatRating', () => {
  it('uses one decimal', () => {
    expect(formatRating(4)).toBe('4.0')
    expect(formatRating(4.9)).toBe('4.9')
  })
})
