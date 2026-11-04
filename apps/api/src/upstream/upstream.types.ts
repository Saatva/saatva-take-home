// Response shapes as documented by each third-party provider.
// Untrusted: parse with upstream.schemas.ts before use.

export type { ParsedCatalog, ParsedCatalogProduct, ParsedContent } from './upstream.schemas'

export interface CatalogProduct {
  sku: string
  productHandle: string
  displayName: string
  /** Price in cents. */
  priceCents: string | number
  /** Sale price in cents, when a promotion is active. */
  salePriceCents: string | number | null
  imageKey: string
  status: 'active' | 'discontinued'
}

export interface CatalogResponse {
  meta: {
    source: 'catalog'
    generatedAt: string
    currency: string
  }
  data: CatalogProduct[]
}

export interface ContentProduct {
  /** Matches the catalog's productHandle. */
  handle: string
  headline: string
  /** Trusted HTML authored in the CMS. */
  descriptionHtml: string
  reviews: {
    average: number | string
    count: number | string
  }
  badges: string[]
}

export type ContentResponse = ContentProduct[]
