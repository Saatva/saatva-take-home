import type { Product } from '@saatva/contracts'

type JsonObject = Record<string, unknown>

function productNode(p: Product, currency: string, baseUrl: string | URL): JsonObject {
  const node: JsonObject = {
    '@type': 'Product',
    name: p.name,
  }
  const variant = p.variants[0]
  if (variant) node.sku = variant.sku
  node.image = new URL(p.image.src, baseUrl).toString()
  if (p.headline !== null) node.description = p.headline
  if (variant) {
    const effective = variant.price.saleAmount ?? variant.price.amount
    node.offers = {
      '@type': 'Offer',
      price: (effective / 100).toFixed(2),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    }
  }
  if (p.rating !== null) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating.average,
      reviewCount: p.rating.count,
    }
  }
  return node
}

export function buildProductJsonLd(args: {
  products: Product[]
  currency: string
  selectedId: string | null
  baseUrl: string | URL
}): JsonObject {
  const { products, currency, selectedId, baseUrl } = args
  const selected = selectedId === null ? undefined : products.find((p) => p.id === selectedId)
  if (selected) {
    return { '@context': 'https://schema.org', ...productNode(selected, currency, baseUrl) }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: productNode(p, currency, baseUrl),
    })),
  }
}

// Escape '<' so catalog text can never terminate the surrounding <script> tag.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
