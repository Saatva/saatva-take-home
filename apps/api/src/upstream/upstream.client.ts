import { Injectable, Logger } from '@nestjs/common'
import type { CatalogResponse, ContentResponse } from './upstream.types'

const UPSTREAM_URL = process.env.UPSTREAM_URL ?? 'http://localhost:4100'

/**
 * Thin client for the upstream catalog and content services.
 * Already wired up for you. Change it if you think it needs changing.
 */
@Injectable()
export class UpstreamClient {
  private readonly logger = new Logger(UpstreamClient.name)

  async getCatalogProducts(): Promise<CatalogResponse> {
    return this.get<CatalogResponse>('/catalog/v1/products')
  }

  async getContentProducts(): Promise<ContentResponse> {
    return this.get<ContentResponse>('/content/v1/products')
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${UPSTREAM_URL}${path}`
    const res = await fetch(url)

    if (!res.ok) {
      this.logger.warn(`GET ${path} -> ${res.status}`)
      throw new Error(`Upstream request failed: ${path} (${res.status})`)
    }

    return (await res.json()) as T
  }
}
