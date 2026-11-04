import { describe, expect, it } from 'vitest'
import { MAX_QUANTITY, cartCount, cartReducer, cartSubtotal, emptyCart, type CartState } from './cart'

const classic = {
  sku: 'SAT-CLASSIC-Q',
  name: 'Saatva Classic',
  image: { src: '/images/classic-carousel.jpg', alt: 'Saatva Classic mattress' },
  unitPrice: 99900,
}
const loom = {
  sku: 'LNL-Q',
  name: 'Loom & Leaf',
  image: { src: '/images/loom-carousel.jpg', alt: 'Loom & Leaf mattress' },
  unitPrice: 119900,
}

const add = (state: CartState, line: typeof classic) =>
  cartReducer(state, { type: 'add', line, currency: 'USD' })

describe('cartReducer', () => {
  it('adds a new line with quantity 1 and sets the currency', () => {
    const state = add(emptyCart, classic)
    expect(state.currency).toBe('USD')
    expect(state.lines).toEqual([{ ...classic, quantity: 1 }])
  })

  it('stacks repeat adds of the same SKU on one line', () => {
    const state = add(add(emptyCart, classic), classic)
    expect(state.lines).toHaveLength(1)
    expect(state.lines[0].quantity).toBe(2)
  })

  it('keeps lines in the order they were first added', () => {
    const state = add(add(add(emptyCart, loom), classic), loom)
    expect(state.lines.map((l) => l.sku)).toEqual(['LNL-Q', 'SAT-CLASSIC-Q'])
  })

  it('increments and decrements, never below 1', () => {
    let state = add(emptyCart, classic)
    state = cartReducer(state, { type: 'increment', sku: classic.sku })
    expect(state.lines[0].quantity).toBe(2)
    state = cartReducer(state, { type: 'decrement', sku: classic.sku })
    state = cartReducer(state, { type: 'decrement', sku: classic.sku })
    expect(state.lines[0].quantity).toBe(1)
  })

  it(`caps quantity at ${MAX_QUANTITY}`, () => {
    let state = add(emptyCart, classic)
    for (let i = 0; i < MAX_QUANTITY + 5; i++) state = add(state, classic)
    expect(state.lines[0].quantity).toBe(MAX_QUANTITY)
  })

  it('removes a whole line and clears the currency when empty', () => {
    let state = add(add(emptyCart, classic), loom)
    state = cartReducer(state, { type: 'remove', sku: classic.sku })
    expect(state.lines.map((l) => l.sku)).toEqual(['LNL-Q'])
    state = cartReducer(state, { type: 'remove', sku: loom.sku })
    expect(state).toEqual(emptyCart)
  })

  it('ignores actions for unknown SKUs', () => {
    const state = add(emptyCart, classic)
    expect(cartReducer(state, { type: 'increment', sku: 'NOPE' })).toEqual(state)
    expect(cartReducer(state, { type: 'remove', sku: 'NOPE' })).toEqual(state)
  })
})

describe('cartCount / cartSubtotal', () => {
  it('sums quantities and line totals in cents', () => {
    let state = add(add(emptyCart, classic), loom)
    state = cartReducer(state, { type: 'increment', sku: loom.sku })
    expect(cartCount(state)).toBe(3)
    expect(cartSubtotal(state)).toBe(99900 + 2 * 119900)
  })

  it('is zero for an empty cart', () => {
    expect(cartCount(emptyCart)).toBe(0)
    expect(cartSubtotal(emptyCart)).toBe(0)
  })
})
