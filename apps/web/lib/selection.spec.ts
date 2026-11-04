import { describe, expect, it } from 'vitest'
import { findExplicitSelection, resolveSelection } from './selection'

const products = [{ id: 'saatva-classic' }, { id: 'loom-and-leaf' }, { id: 'zenhaven' }]

const invalid: [string, string | string[] | undefined][] = [
  ['undefined', undefined],
  ['unknown', 'bogus'],
  ['repeated', ['zenhaven', 'loom-and-leaf']],
  ['too long', 'a'.repeat(65)],
  ['empty', ''],
]

describe('resolveSelection', () => {
  it('matches case-insensitively', () => {
    expect(resolveSelection(products, 'loom-and-leaf')).toBe('loom-and-leaf')
    expect(resolveSelection(products, 'Loom-And-Leaf')).toBe('loom-and-leaf')
    expect(resolveSelection(products, ' zenhaven ')).toBe('zenhaven')
  })

  it.each(invalid)('falls back to the first product for %s', (_, param) => {
    expect(resolveSelection(products, param)).toBe('saatva-classic')
  })

  it('returns null for an empty catalog', () => {
    expect(resolveSelection([], 'loom-and-leaf')).toBeNull()
  })
})

describe('findExplicitSelection', () => {
  it('returns the id for a valid value', () => {
    expect(findExplicitSelection(products, 'Loom-And-Leaf')).toBe('loom-and-leaf')
  })

  it.each(invalid)('returns null for %s', (_, param) => {
    expect(findExplicitSelection(products, param)).toBeNull()
  })
})
