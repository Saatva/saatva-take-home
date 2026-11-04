import type { ProductImage } from '@saatva/contracts'

export type CartLine = {
  sku: string
  name: string
  image: ProductImage
  unitPrice: number // cents, price at add time
  quantity: number
}

export type CartState = {
  currency: string | null
  lines: CartLine[]
}

export type CartAction =
  | { type: 'add'; line: Omit<CartLine, 'quantity'>; currency: string }
  | { type: 'increment'; sku: string }
  | { type: 'decrement'; sku: string }
  | { type: 'remove'; sku: string }

export const MAX_QUANTITY = 10

export const emptyCart: CartState = { currency: null, lines: [] }

const setQuantity = (state: CartState, sku: string, next: (q: number) => number): CartState => ({
  ...state,
  lines: state.lines.map((l) =>
    l.sku === sku ? { ...l, quantity: Math.min(MAX_QUANTITY, Math.max(1, next(l.quantity))) } : l,
  ),
})

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      if (state.lines.some((l) => l.sku === action.line.sku)) {
        return setQuantity(state, action.line.sku, (q) => q + 1)
      }
      return {
        currency: state.currency ?? action.currency,
        lines: [...state.lines, { ...action.line, quantity: 1 }],
      }
    }
    case 'increment':
      return setQuantity(state, action.sku, (q) => q + 1)
    // Floors at 1: removing the line is an explicit delete, not a side effect of "-"
    case 'decrement':
      return setQuantity(state, action.sku, (q) => q - 1)
    case 'remove': {
      const lines = state.lines.filter((l) => l.sku !== action.sku)
      return { currency: lines.length ? state.currency : null, lines }
    }
  }
}

export function cartCount(state: CartState): number {
  return state.lines.reduce((n, l) => n + l.quantity, 0)
}

export function cartSubtotal(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
}
