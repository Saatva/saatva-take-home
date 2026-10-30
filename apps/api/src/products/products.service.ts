import { Injectable, NotImplementedException } from '@nestjs/common'
import { UpstreamClient } from '../upstream/upstream.client'

@Injectable()
export class ProductsService {
  constructor(private readonly upstream: UpstreamClient) {}

  /**
   * TODO (candidate): complete me.
   *
   * Product and pricing data lives in the catalog service, and marketing copy
   * and reviews live in the content service. The web app shouldn't have to
   * know that. You decide the response shape.
   */
  async getProducts(): Promise<unknown> {
    throw new NotImplementedException('GET /api/products is not implemented yet')
  }
}
