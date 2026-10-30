// Server-side code can't use the /api rewrite (that only applies to browser
// requests), so it talks to the BFF directly.
const API_URL = process.env.API_URL ?? 'http://localhost:4000'

export async function apiGet<T>(path: string): Promise<T> {
  const isServer = typeof window === 'undefined'
  const url = isServer ? `${API_URL}${path}` : path

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`)
  }
  return (await res.json()) as T
}
