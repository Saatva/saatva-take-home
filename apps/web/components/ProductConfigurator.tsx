'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@saatva/contracts'
import { useCart } from '@/components/CartProvider'
import { MattressToggle } from '@/components/MattressToggle'
import { MonthlyPayment } from '@/components/MonthlyPayment'
import { StarRating } from '@/components/StarRating'
import { formatPrice } from '@/lib/format'

type Props = {
  products: Product[]
  currency: string
  degraded: boolean
  initialSelectedId: string
}

const LABEL_ID = 'mattress-type-label'

export function ProductConfigurator({ products, currency, degraded, initialSelectedId }: Props) {
  const [selectedId, setSelectedId] = useState(initialSelectedId)
  const { add } = useCart()

  const product = products.find((p) => p.id === selectedId) ?? products[0]
  const variant = product.variants[0]
  const price = variant?.price

  // replaceState keeps the URL shareable without a navigation or a server re-render.
  const select = (id: string) => {
    setSelectedId(id)
    const url = new URL(window.location.href)
    url.searchParams.set('mattress', id)
    window.history.replaceState(null, '', url)
  }

  return (
    <div className="container configurator">
      <div className="configurator__media">
        <Image
          key={product.id}
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 634px"
          priority={product.id === initialSelectedId}
          // Wide photos keep the bed (left side) when cropped to the frame
          style={{ objectFit: 'cover', objectPosition: 'left center' }}
        />
      </div>

      <div className="configurator__details">
        <h1 className="configurator__title">Choose Your Mattress</h1>
        <p id={LABEL_ID} className="configurator__label">
          Select mattress type
        </p>
        <MattressToggle
          options={products.map((p) => ({ id: p.id, label: p.name }))}
          value={selectedId}
          onChange={select}
          labelledBy={LABEL_ID}
        />

        <div className="configurator__info">
          <div className="configurator__row">
            <h2 className="configurator__name">{product.name} Mattress</h2>
            {price && (
              <p className="configurator__price">
                {price.saleAmount != null ? (
                  <>
                    <span className="visually-hidden">Sale price</span>
                    <span className="configurator__price-sale">
                      {formatPrice(price.saleAmount, currency)}
                    </span>{' '}
                    <span className="visually-hidden">Original price</span>
                    <s className="configurator__price-original">
                      {formatPrice(price.amount, currency)}
                    </s>
                  </>
                ) : (
                  formatPrice(price.amount, currency)
                )}
              </p>
            )}
          </div>
          {price && <MonthlyPayment price={price.saleAmount ?? price.amount} />}

          {product.rating && (
            <StarRating average={product.rating.average} count={product.rating.count} />
          )}
          {product.descriptionHtml && (
            <div
              className="configurator__description"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
          {degraded && (
            <p className="configurator__notice">Some product details are temporarily unavailable.</p>
          )}
        </div>

        <button
          type="button"
          className="button-cta configurator__cta"
          disabled={!variant}
          onClick={() =>
            variant &&
            add(
              {
                sku: variant.sku,
                name: product.name,
                image: product.image,
                unitPrice: variant.price.saleAmount ?? variant.price.amount,
              },
              currency,
            )
          }
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
