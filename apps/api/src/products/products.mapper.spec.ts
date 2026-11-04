import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  parseCatalog,
  parseContent,
  type ParsedCatalog,
  type ParsedContent,
} from '../upstream/upstream.schemas'
import { mapProducts } from './products.mapper'

const dataDir = resolve(__dirname, '../../../../services/upstream/data')
const readJson = (name: string): unknown => JSON.parse(readFileSync(resolve(dataDir, name), 'utf8'))

const catalog = parseCatalog(readJson('catalog-products.json')) as ParsedCatalog
const content = parseContent(readJson('content-products.json')) as ParsedContent[]

const byId = (result: ReturnType<typeof mapProducts>, id: string) =>
  result.products.find((p) => p.id === id)

describe('mapProducts (real fixtures)', () => {
  const result = mapProducts(catalog, content)

  it('fixtures parse', () => {
    expect(catalog).not.toBeNull()
    expect(content).not.toBeNull()
  })

  it('preserves catalog order and drops content orphans', () => {
    expect(result.products.map((p) => p.id)).toEqual(['saatva-classic', 'loom-and-leaf', 'zenhaven'])
    expect(byId(result, 'saatva-youth')).toBeUndefined()
  })

  it('uses catalog currency and omits degraded', () => {
    expect(result.currency).toBe('USD')
    expect('degraded' in result).toBe(false)
  })

  it('attaches Zenhaven content despite handle case', () => {
    const zen = byId(result, 'zenhaven')
    expect(zen?.headline).toBe('Flippable natural latex, two firmness levels in one')
    expect(zen?.rating).toEqual({ average: 4.5, count: 2140 })
    expect(zen?.badges).toEqual(['Natural latex'])
  })

  it('maps one variant per product with its SKU and integer cents', () => {
    const prices = result.products.map((p) => {
      expect(p.variants).toHaveLength(1)
      expect(p.variants[0].sku).toMatch(/-Q$/)
      return [p.variants[0].price.amount, p.variants[0].price.saleAmount]
    })
    expect(prices).toEqual([
      [99900, null],
      [129900, 119900],
      [159900, null],
    ])
  })

  it('returns numeric rating for loom-and-leaf', () => {
    expect(byId(result, 'loom-and-leaf')?.rating).toEqual({ average: 4, count: 1876 })
  })

  it('maps image src and alt', () => {
    const catalogByHandle = new Map(catalog.products.map((p) => [p.productHandle, p]))
    for (const p of result.products) {
      const source = catalogByHandle.get(p.id)!
      expect(p.image).toEqual({
        src: `/images/${source.imageKey}.jpg`,
        alt: `${source.displayName} mattress`,
      })
      expect(p.name).toBe(source.displayName)
    }
  })

  it('keeps allowed description markup', () => {
    const classic = byId(result, 'saatva-classic')!.descriptionHtml!
    expect(classic).toContain('<p>')
    expect(classic).toContain('<strong>')
    expect(classic).toContain('<ul>')
    expect(classic).toContain('<li>')
  })
})

describe('mapProducts (edge cases)', () => {
  const item = (overrides: Partial<ParsedCatalog['products'][number]> = {}) => ({
    sku: 'X-Q',
    productHandle: 'x',
    displayName: 'X',
    priceCents: 1000,
    salePriceCents: null,
    imageKey: 'x-img',
    status: 'active' as const,
    ...overrides,
  })
  const record = (overrides: Partial<ParsedContent> = {}): ParsedContent => ({
    handle: 'x',
    headline: 'Head',
    descriptionHtml: '<p>d</p>',
    badges: ['b'],
    reviews: { average: 3, count: 1 },
    ...overrides,
  })

  it('excludes discontinued products', () => {
    const cat: ParsedCatalog = {
      currency: 'USD',
      products: [item(), item({ productHandle: 'old', sku: 'OLD-Q', status: 'discontinued' })],
    }
    expect(mapProducts(cat, [record()]).products.map((p) => p.id)).toEqual(['x'])
  })

  it('returns null fields and degraded when content is null', () => {
    const result = mapProducts({ currency: 'USD', products: [item()] }, null)
    expect(result.degraded).toBe(true)
    expect(result.products[0]).toMatchObject({
      headline: null,
      descriptionHtml: null,
      rating: null,
      badges: [],
    })
  })

  it('nulls a product with no content match without degraded', () => {
    const cat: ParsedCatalog = {
      currency: 'USD',
      products: [item(), item({ productHandle: 'y', sku: 'Y-K' })],
    }
    const result = mapProducts(cat, [record()])
    expect('degraded' in result).toBe(false)
    expect(result.products[0].headline).toBe('Head')
    expect(result.products[1]).toMatchObject({
      headline: null,
      descriptionHtml: null,
      rating: null,
      badges: [],
    })
  })

  it('first content record wins on duplicate normalized handles', () => {
    const result = mapProducts({ currency: 'USD', products: [item()] }, [
      record({ handle: 'X', headline: 'first' }),
      record({ handle: 'x', headline: 'second' }),
    ])
    expect(result.products[0].headline).toBe('first')
  })

  it('sanitizes unsafe descriptions', () => {
    const result = mapProducts({ currency: 'USD', products: [item()] }, [
      record({ descriptionHtml: '<p>x</p><script>bad()</script>' }),
    ])
    expect(result.products[0].descriptionHtml).toBe('<p>x</p>')
  })

  it('maps empty headline to null and missing reviews to null rating', () => {
    const result = mapProducts({ currency: 'USD', products: [item()] }, [
      record({ headline: '', reviews: null }),
    ])
    expect(result.products[0].headline).toBeNull()
    expect(result.products[0].rating).toBeNull()
  })
})
