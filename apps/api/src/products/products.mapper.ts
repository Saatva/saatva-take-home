import type { Product, ProductsResponse } from '@saatva/contracts'
import type { ParsedCatalog, ParsedContent } from '../upstream/upstream.schemas'
import { sanitizeDescription } from './sanitize'

const normalizeHandle = (handle: string) => handle.trim().toLowerCase()

export function mapProducts(
  catalog: ParsedCatalog,
  content: ParsedContent[] | null,
): ProductsResponse {
  const contentByHandle = new Map<string, ParsedContent>()
  for (const record of content ?? []) {
    const key = normalizeHandle(record.handle)
    if (!contentByHandle.has(key)) contentByHandle.set(key, record)
  }

  const products: Product[] = catalog.products
    .filter((item) => item.status !== 'discontinued')
    .map((item) => {
      const id = normalizeHandle(item.productHandle)
      const match = contentByHandle.get(id)
      return {
        id,
        name: item.displayName,
        image: { src: `/images/${item.imageKey}.jpg`, alt: `${item.displayName} mattress` },
        headline: match?.headline.trim() || null,
        descriptionHtml: match ? sanitizeDescription(match.descriptionHtml) : null,
        rating: match?.reviews
          ? { average: match.reviews.average, count: match.reviews.count }
          : null,
        badges: match ? [...match.badges] : [],
        variants: [
          {
            sku: item.sku,
            price: { amount: item.priceCents, saleAmount: item.salePriceCents },
          },
        ],
      }
    })

  const response: ProductsResponse = { currency: catalog.currency, products }
  if (content === null) response.degraded = true
  return response
}
