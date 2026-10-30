import { Injectable, NotImplementedException } from '@nestjs/common'
import { UpstreamClient } from '../upstream/upstream.client'

@Injectable()
export class ProductsService {
  constructor(private readonly upstream: UpstreamClient) {}

  async getProducts(): Promise<unknown> {
    throw new NotImplementedException('GET /api/products is not implemented yet')
  }
}
