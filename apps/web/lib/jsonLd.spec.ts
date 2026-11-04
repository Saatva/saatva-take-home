import { describe, expect, it } from 'vitest'
import type { Product } from '@saatva/contracts'
import { buildProductJsonLd, serializeJsonLd } from './jsonLd'

function make(
  id: string,
  name: string,
  amount: number,
  saleAmount: number | null,
  rating: Product['rating'],
  headline: string | null,
  image: string,
): Product {
  return {
    id,
    name,
    image: { src: image, alt: name },
    headline,
    descriptionHtml: null,
    rating,
    badges: [],
    variants: [{ sku: `${id}-queen`.toUpperCase(), price: { amount, saleAmount } }],
  }
}

const products: Product[] = [
  make(
    'saatva-classic',
    'Saatva Classic',
    99900,
    null,
    { average: 4.9, count: 5231 },
    'The luxury innerspring',
    '/images/classic-carousel.jpg',
  ),
  make(
    'loom-and-leaf',
    'Loom & Leaf',
    129900,
    119900,
    { average: 4, count: 1876 },
    'The memory foam',
    '/images/loom-carousel.jpg',
  ),
  make('zenhaven', 'Zenhaven', 159900, null, null, null, '/images/zenhaven-carousel.jpg'),
]

const baseUrl = 'http://localhost:3000'

function build(selectedId: string | null, list = products, currency = 'USD') {
  return buildProductJsonLd({ products: list, currency, selectedId, baseUrl })
}

describe('buildProductJsonLd', () => {
  it('builds an ItemList when nothing is selected', () => {
    const ld = build(null) as any
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('ItemList')
    expect(ld.itemListElement).toHaveLength(3)
    expect(ld.itemListElement[0]).toMatchObject({ '@type': 'ListItem', position: 1 })
    expect(ld.itemListElement[2].item.name).toBe('Zenhaven')
  })

  it('builds a single Product when one is selected', () => {
    const ld = build('loom-and-leaf') as any
    expect(ld['@type']).toBe('Product')
    expect(ld.name).toBe('Loom & Leaf')
    expect(ld.sku).toBe('LOOM-AND-LEAF-QUEEN')
    expect(ld.description).toBe('The memory foam')
    expect(ld.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4,
      reviewCount: 1876,
    })
  })

  it('uses the sale price when present and the regular price otherwise', () => {
    expect((build('loom-and-leaf') as any).offers.price).toBe('1199.00')
    expect((build('saatva-classic') as any).offers.price).toBe('999.00')
  })

  it('takes priceCurrency from the argument', () => {
    expect((build('zenhaven', products, 'EUR') as any).offers.priceCurrency).toBe('EUR')
  })

  it('omits rating and description when unavailable', () => {
    const ld = build('zenhaven') as any
    expect('aggregateRating' in ld).toBe(false)
    expect('description' in ld).toBe(false)
  })

  it('emits absolute image URLs', () => {
    expect((build('loom-and-leaf') as any).image).toBe('http://localhost:3000/images/loom-carousel.jpg')
  })

  it('skips offers for products without variants', () => {
    const bare = { ...products[0], variants: [] }
    const ld = build('saatva-classic', [bare]) as any
    expect('offers' in ld).toBe(false)
    expect('sku' in ld).toBe(false)
  })
})

describe('serializeJsonLd', () => {
  it('cannot terminate a script tag', () => {
    const name = 'Evil </script><script>alert(1)</script>'
    const evil = [{ ...products[0], name }]
    const out = serializeJsonLd(build(null, evil))
    expect(out).not.toContain('</script')
    expect(out).not.toContain('<')
    expect(out).toContain('\\u003c')
    const parsed = JSON.parse(out)
    expect(parsed.itemListElement[0].item.name).toBe(name)
  })
})
