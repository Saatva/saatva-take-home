import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ServiceUnavailableException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UpstreamClient } from '../upstream/upstream.client'
import { ProductsService } from './products.service'

const dataDir = join(__dirname, '../../../../services/upstream/data')
const catalogJson = JSON.parse(readFileSync(join(dataDir, 'catalog-products.json'), 'utf8'))
const contentJson = JSON.parse(readFileSync(join(dataDir, 'content-products.json'), 'utf8'))

const unavailable = () => Promise.reject(new Error('Upstream request failed (503)'))

function setup() {
  const upstream = {
    getCatalogProducts: vi.fn(() => Promise.resolve(catalogJson)),
    getContentProducts: vi.fn(() => Promise.resolve(contentJson)),
  }
  const service = new ProductsService(upstream as unknown as UpstreamClient)
  return { upstream, service }
}

describe('ProductsService', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(() => {
    ctx = setup()
  })

  it('merges both upstreams on the healthy path', async () => {
    const res = await ctx.service.getProducts()

    expect(res.currency).toBe('USD')
    expect(res.products.map((p) => p.id)).toEqual(['saatva-classic', 'loom-and-leaf', 'zenhaven'])
    expect(res.products.every((p) => p.descriptionHtml !== null)).toBe(true)
    expect('degraded' in res).toBe(false)
  })

  it('throws 503 when the catalog fails', async () => {
    ctx.upstream.getCatalogProducts.mockImplementation(unavailable)

    await expect(ctx.service.getProducts()).rejects.toBeInstanceOf(ServiceUnavailableException)
  })

  it('throws 503 when the catalog envelope is malformed', async () => {
    ctx.upstream.getCatalogProducts.mockResolvedValue({ unexpected: true })

    await expect(ctx.service.getProducts()).rejects.toBeInstanceOf(ServiceUnavailableException)
  })

  it('never serves stale prices: catalog failure after a healthy call still throws', async () => {
    await ctx.service.getProducts()
    ctx.upstream.getCatalogProducts.mockImplementation(unavailable)

    await expect(ctx.service.getProducts()).rejects.toBeInstanceOf(ServiceUnavailableException)
  })

  it('degrades when content fails and nothing is cached', async () => {
    ctx.upstream.getContentProducts.mockImplementation(unavailable)

    const res = await ctx.service.getProducts()

    expect(res.degraded).toBe(true)
    expect(res.products).toHaveLength(3)
    for (const p of res.products) {
      expect(p.headline).toBeNull()
      expect(p.descriptionHtml).toBeNull()
      expect(p.rating).toBeNull()
      expect(p.badges).toEqual([])
      expect(p.variants[0].price.amount).toBeGreaterThan(0)
    }
  })

  it('serves last known content when content fails after a healthy call', async () => {
    const healthy = await ctx.service.getProducts()
    ctx.upstream.getContentProducts.mockImplementation(unavailable)

    const res = await ctx.service.getProducts()

    expect('degraded' in res).toBe(false)
    expect(res.products.map((p) => p.descriptionHtml)).toEqual(
      healthy.products.map((p) => p.descriptionHtml),
    )
    expect(res.products.find((p) => p.id === 'zenhaven')?.rating).toEqual({
      average: 4.5,
      count: 2140,
    })
  })

  it('keeps the cached copy when content returns no usable records', async () => {
    const healthy = await ctx.service.getProducts()
    ctx.upstream.getContentProducts.mockResolvedValue([{ handle: '' }, 'junk'])

    const afterJunk = await ctx.service.getProducts()
    ctx.upstream.getContentProducts.mockImplementation(unavailable)
    const afterOutage = await ctx.service.getProducts()

    for (const res of [afterJunk, afterOutage]) {
      expect('degraded' in res).toBe(false)
      expect(res.products.map((p) => p.descriptionHtml)).toEqual(
        healthy.products.map((p) => p.descriptionHtml),
      )
    }
  })

  it('degrades when content returns an empty list and nothing is cached', async () => {
    ctx.upstream.getContentProducts.mockResolvedValue([])

    const res = await ctx.service.getProducts()

    expect(res.degraded).toBe(true)
  })

  it('throws 503 when the catalog currency is invalid', async () => {
    ctx.upstream.getCatalogProducts.mockResolvedValue({
      ...catalogJson,
      meta: { ...catalogJson.meta, currency: 'US' },
    })

    await expect(ctx.service.getProducts()).rejects.toBeInstanceOf(ServiceUnavailableException)
  })

  it('treats malformed content like a content outage', async () => {
    ctx.upstream.getContentProducts.mockResolvedValue({ not: 'an array' })

    const res = await ctx.service.getProducts()

    expect(res.degraded).toBe(true)
  })
})
