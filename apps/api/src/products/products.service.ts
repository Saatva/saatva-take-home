import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import type { ProductsResponse } from '@saatva/contracts'
import { UpstreamClient } from '../upstream/upstream.client'
import { parseCatalog, parseContent, type ParsedContent } from '../upstream/upstream.schemas'
import { mapProducts } from './products.mapper'

@Injectable()
export class ProductsService {
  // Marketing copy tolerates staleness, prices don't: only content gets a fallback.
  private lastKnownContent: ParsedContent[] | null = null

  constructor(private readonly upstream: UpstreamClient) {}

  async getProducts(): Promise<ProductsResponse> {
    const [catalogResult, contentResult] = await Promise.allSettled([
      this.upstream.getCatalogProducts(),
      this.upstream.getContentProducts(),
    ])

    const catalog = catalogResult.status === 'fulfilled' ? parseCatalog(catalogResult.value) : null
    if (!catalog) {
      throw new ServiceUnavailableException('Product catalog is temporarily unavailable')
    }

    const parsed = contentResult.status === 'fulfilled' ? parseContent(contentResult.value) : null
    // A payload with no usable records is treated as an outage, so it can't wipe the cached copy
    const content = parsed?.length ? parsed : null
    if (content) this.lastKnownContent = content

    return mapProducts(catalog, content ?? this.lastKnownContent)
  }
}
