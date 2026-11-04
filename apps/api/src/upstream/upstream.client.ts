import { Injectable, Logger } from '@nestjs/common'

const UPSTREAM_URL = process.env.UPSTREAM_URL ?? 'http://localhost:4100'
const DEFAULT_TIMEOUT_MS = 3000

export function resolveTimeoutMs(): number {
  const parsed = Number(process.env.UPSTREAM_TIMEOUT_MS)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS
}

/**
 * Thin client for the upstream catalog and content services.
 * Returns raw, untrusted JSON; validation happens in upstream.schemas.ts.
 */
@Injectable()
export class UpstreamClient {
  private readonly logger = new Logger(UpstreamClient.name)

  async getCatalogProducts(): Promise<unknown> {
    return this.get('/catalog/v1/products')
  }

  async getContentProducts(): Promise<unknown> {
    return this.get('/content/v1/products')
  }

  private async get(path: string): Promise<unknown> {
    const url = `${UPSTREAM_URL}${path}`
    const timeoutMs = resolveTimeoutMs()

    let res: Response
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    } catch (err) {
      this.logger.warn(`GET ${path} failed (timeout ${timeoutMs}ms): ${(err as Error).message}`)
      throw err
    }

    if (!res.ok) {
      this.logger.warn(`GET ${path} -> ${res.status}`)
      throw new Error(`Upstream request failed: ${path} (${res.status})`)
    }

    return res.json()
  }
}
