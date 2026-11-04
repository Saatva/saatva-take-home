'use client'

import { createContext, useContext, useMemo, useReducer } from 'react'
import { cartCount, cartReducer, cartSubtotal, emptyCart, type CartLine } from '@/lib/cart'

type CartContextValue = {
  lines: CartLine[]
  currency: string | null
  count: number
  subtotal: number
  add: (line: Omit<CartLine, 'quantity'>, currency: string) => void
  increment: (sku: string) => void
  decrement: (sku: string) => void
  remove: (sku: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCart)

  const actions = useMemo(
    () => ({
      add: (line: Omit<CartLine, 'quantity'>, currency: string) =>
        dispatch({ type: 'add', line, currency }),
      increment: (sku: string) => dispatch({ type: 'increment', sku }),
      decrement: (sku: string) => dispatch({ type: 'decrement', sku }),
      remove: (sku: string) => dispatch({ type: 'remove', sku }),
    }),
    [],
  )

  const value = useMemo(
    () => ({
      lines: state.lines,
      currency: state.currency,
      count: cartCount(state),
      subtotal: cartSubtotal(state),
      ...actions,
    }),
    [state, actions],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
