// Response contract for GET /api/products, shared by apps/api and apps/web.

/** Money in integer cents. Currency lives on the response. */
export interface Money {
  amount: number
  /** Present only when a valid sale price below `amount` is active. */
  saleAmount: number | null
}

export interface ProductVariant {
  sku: string
  price: Money
}

export interface Rating {
  average: number
  count: number
}

export interface ProductImage {
  src: string
  alt: string
}

export interface Product {
  /** Normalized (lowercased) catalog product handle, e.g. "loom-and-leaf". */
  id: string
  name: string
  image: ProductImage
  headline: string | null
  /** Sanitized by the BFF. Safe to render as HTML. */
  descriptionHtml: string | null
  rating: Rating | null
  badges: string[]
  variants: ProductVariant[]
}

export interface ProductsResponse {
  /** ISO 4217 code, e.g. "USD". */
  currency: string
  products: Product[]
  /** Set only when marketing content was unavailable and no cached copy existed. */
  degraded?: true
}
