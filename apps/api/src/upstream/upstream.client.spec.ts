import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UpstreamClient } from './upstream.client'

function hangingFetch(_url: unknown, init?: { signal?: AbortSignal }) {
  return new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
  })
}

describe('UpstreamClient timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(hangingFetch))
    // Node's AbortSignal.timeout uses internal timers that fake timers do not control.
    vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms: number) => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(new Error('timeout')), ms)
      return controller.signal
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('rejects after 3000 ms by default, not before', async () => {
    let outcome = 'pending'
    new UpstreamClient().getCatalogProducts().then(
      () => (outcome = 'resolved'),
      () => (outcome = 'rejected'),
    )
    await vi.advanceTimersByTimeAsync(2999)
    expect(outcome).toBe('pending')
    await vi.advanceTimersByTimeAsync(1)
    expect(outcome).toBe('rejected')
  })

  it('honours UPSTREAM_TIMEOUT_MS', async () => {
    vi.stubEnv('UPSTREAM_TIMEOUT_MS', '500')
    let outcome = 'pending'
    new UpstreamClient().getContentProducts().then(
      () => (outcome = 'resolved'),
      () => (outcome = 'rejected'),
    )
    await vi.advanceTimersByTimeAsync(499)
    expect(outcome).toBe('pending')
    await vi.advanceTimersByTimeAsync(1)
    expect(outcome).toBe('rejected')
  })

  it('falls back to 3000 ms for an invalid UPSTREAM_TIMEOUT_MS', async () => {
    vi.stubEnv('UPSTREAM_TIMEOUT_MS', 'abc')
    let outcome = 'pending'
    new UpstreamClient().getContentProducts().then(
      () => (outcome = 'resolved'),
      () => (outcome = 'rejected'),
    )
    await vi.advanceTimersByTimeAsync(2999)
    expect(outcome).toBe('pending')
    await vi.advanceTimersByTimeAsync(1)
    expect(outcome).toBe('rejected')
  })
})
