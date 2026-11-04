'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useCart } from '@/components/CartProvider'
import { MAX_QUANTITY } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

type Props = {
  id: string
  onClose: () => void
}

export function CartPopover({ id, onClose }: Props) {
  const { lines, currency, count, subtotal, increment, decrement, remove } = useCart()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleId = `${id}-title`

  // Keeps focus in the panel when a delete removes the focused row
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const deleteLine = (sku: string) => {
    remove(sku)
    titleRef.current?.focus()
  }

  return (
    <div id={id} className="cart-popover" role="dialog" aria-labelledby={titleId}>
      <div className="cart-popover__header">
        <h2 id={titleId} ref={titleRef} className="cart-popover__title" tabIndex={-1}>
          Your Cart ({count})
        </h2>
        <button type="button" className="cart-popover__close" aria-label="Close cart" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {lines.length === 0 || !currency ? (
        <p className="cart-popover__empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-popover__lines">
            {lines.map((line) => (
              <li key={line.sku} className="cart-line">
                <div className="cart-line__image">
                  <Image src={line.image.src} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
                </div>
                <p className="cart-line__name">{line.name} Mattress</p>
                <div className="cart-line__stepper" role="group" aria-label={`Quantity of ${line.name}`}>
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${line.name}`}
                    disabled={line.quantity <= 1}
                    onClick={() => decrement(line.sku)}
                  >
                    −
                  </button>
                  <span className="cart-line__qty">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${line.name}`}
                    disabled={line.quantity >= MAX_QUANTITY}
                    onClick={() => increment(line.sku)}
                  >
                    +
                  </button>
                </div>
                <p className="cart-line__unit">{formatPrice(line.unitPrice, currency)} each</p>
                <button
                  type="button"
                  className="cart-line__remove"
                  aria-label={`Remove ${line.name} from cart`}
                  onClick={() => deleteLine(line.sku)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-popover__footer">
            <span>Subtotal</span>
            <span className="cart-popover__subtotal">{formatPrice(subtotal, currency)}</span>
          </div>
        </>
      )}
    </div>
  )
}
