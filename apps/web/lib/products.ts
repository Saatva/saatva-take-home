import { cache } from 'react'
import type { ProductsResponse } from '@saatva/contracts'
import { apiGet } from '@/lib/api'

// Deduped per request so generateMetadata and the page share one BFF call.
export const getProducts = cache(() => apiGet<ProductsResponse>('/api/products'))
