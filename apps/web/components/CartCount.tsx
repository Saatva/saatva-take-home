'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import { CartPopover } from '@/components/CartPopover'

export function CartCount() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const label = `Cart, ${count} ${count === 1 ? 'item' : 'items'}`

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  return (
    <div className="site-header__cart" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="site-header__cart-button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="20" r="1.25" fill="currentColor" />
          <circle cx="17" cy="20" r="1.25" fill="currentColor" />
        </svg>
        <span className="site-header__cart-badge" aria-hidden="true">
          {count}
        </span>
      </button>
      <span className="visually-hidden" aria-live="polite">
        {label}
      </span>
      {open && <CartPopover id={panelId} onClose={() => close(true)} />}
    </div>
  )
}
