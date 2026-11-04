import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseCatalog, parseContent } from './upstream.schemas'

const product = (overrides: Record<string, unknown> = {}) => ({
  sku: 'SKU-1',
  productHandle: 'handle-1',
  displayName: 'Mattress',
  priceCents: '99900',
  salePriceCents: null,
  imageKey: 'img',
  status: 'active',
  ...overrides,
})

const catalog = (...products: unknown[]) => ({
  meta: { source: 'catalog', generatedAt: 'x', currency: 'USD' },
  data: products,
})

const content = (overrides: Record<string, unknown> = {}) => ({
  handle: 'h',
  headline: 'Head',
  descriptionHtml: '<p>x</p>',
  reviews: { average: 4.5, count: 10 },
  badges: ['a'],
  ...overrides,
})

const firstProduct = (p: unknown) => parseCatalog(catalog(p))?.products[0]

describe('parseCatalog prices', () => {
  it('normalizes string and numeric prices to integer cents', () => {
    expect(firstProduct(product({ priceCents: '99900' }))?.priceCents).toBe(99900)
    expect(firstProduct(product({ priceCents: 99900 }))?.priceCents).toBe(99900)
  })

  it.each(['', null, 'abc', '-5', -5, 0, '12.5', 12.5, undefined])(
    'drops product with invalid price %j',
    (priceCents) => {
      expect(parseCatalog(catalog(product({ priceCents })))?.products).toEqual([])
    },
  )

  it('keeps good records when a neighbour is bad', () => {
    const parsed = parseCatalog(catalog(product({ priceCents: 'abc' }), product()))
    expect(parsed?.products).toHaveLength(1)
  })

  it('drops unknown status and empty strings', () => {
    expect(parseCatalog(catalog(product({ status: 'weird' })))?.products).toEqual([])
    expect(parseCatalog(catalog(product({ imageKey: '' })))?.products).toEqual([])
  })
})

describe('parseCatalog sale price', () => {
  it('normalizes a valid sale price', () => {
    expect(firstProduct(product({ salePriceCents: '79900' }))?.salePriceCents).toBe(79900)
    expect(firstProduct(product({ salePriceCents: 79900 }))?.salePriceCents).toBe(79900)
  })

  it.each(['', null, 'abc', -1, '0', 100.5, undefined])('sale %j becomes null', (sale) => {
    const p = firstProduct(product({ salePriceCents: sale }))
    expect(p).toBeDefined()
    expect(p?.salePriceCents).toBeNull()
  })

  it('sale >= price becomes null', () => {
    expect(firstProduct(product({ salePriceCents: '99900' }))?.salePriceCents).toBeNull()
    expect(firstProduct(product({ salePriceCents: 150000 }))?.salePriceCents).toBeNull()
  })
})

describe('parseCatalog envelope', () => {
  it('returns null for malformed envelopes', () => {
    expect(parseCatalog({ meta: { currency: 'USD' } })).toBeNull()
    expect(parseCatalog({ data: [] })).toBeNull()
    expect(parseCatalog({ meta: {}, data: [] })).toBeNull()
    expect(parseCatalog({ meta: { currency: 'USD' }, data: 'nope' })).toBeNull()
    expect(parseCatalog(null)).toBeNull()
  })

  it('returns null when the currency is not a 3-letter code', () => {
    for (const currency of ['US', 'USDD', '1234', 'U$D', '', 42]) {
      expect(parseCatalog({ meta: { currency }, data: [] })).toBeNull()
    }
  })

  it('normalizes the currency code to upper case', () => {
    expect(parseCatalog({ meta: { currency: ' usd ' }, data: [] })?.currency).toBe('USD')
  })

  it('returns an empty list for an empty but valid envelope', () => {
    expect(parseCatalog(catalog())).toEqual({ currency: 'USD', products: [] })
  })
})

describe('parseContent', () => {
  it('normalizes text reviews to numbers', () => {
    const [record] = parseContent([content({ reviews: { average: '4.0', count: '1876' } })])!
    expect(record.reviews).toEqual({ average: 4, count: 1876 })
  })

  it.each([
    { average: 7, count: 1 },
    { average: 4, count: -1 },
    { average: 'x', count: 1 },
    { average: 4, count: 'x' },
    { average: '', count: 1 },
    { average: 4, count: 1.5 },
    null,
    undefined,
  ])('invalid reviews %j -> rating null, record kept', (reviews) => {
    const parsed = parseContent([content({ reviews })])!
    expect(parsed).toHaveLength(1)
    expect(parsed[0].reviews).toBeNull()
  })

  it('defaults missing or invalid badges to []', () => {
    const { badges: _omit, ...noBadges } = content()
    expect(parseContent([noBadges])![0].badges).toEqual([])
    expect(parseContent([content({ badges: 'x' })])![0].badges).toEqual([])
  })

  it('drops records without a handle and preserves handle case', () => {
    const { handle: _omit, ...noHandle } = content()
    const parsed = parseContent([noHandle, content({ handle: 'Zenhaven' })])!
    expect(parsed.map((r) => r.handle)).toEqual(['Zenhaven'])
  })

  it('returns null for non-array payloads', () => {
    expect(parseContent({})).toBeNull()
    expect(parseContent(null)).toBeNull()
  })
})

describe('real upstream fixtures', () => {
  const dataDir = resolve(__dirname, '../../../../services/upstream/data')
  const load = (name: string) => JSON.parse(readFileSync(resolve(dataDir, name), 'utf8'))

  it('parses 3 catalog products', () => {
    const parsed = parseCatalog(load('catalog-products.json'))
    expect(parsed?.currency).toBe('USD')
    expect(parsed?.products).toHaveLength(3)
    expect(parsed?.products.find((p) => p.productHandle === 'loom-and-leaf')).toMatchObject({
      priceCents: 129900,
      salePriceCents: 119900,
    })
  })

  it('parses 4 content records', () => {
    const parsed = parseContent(load('content-products.json'))
    expect(parsed).toHaveLength(4)
    expect(parsed?.find((r) => r.handle === 'loom-and-leaf')?.reviews).toEqual({
      average: 4,
      count: 1876,
    })
  })
})
