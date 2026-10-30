// Mock third-party services (catalog + content).
//
//   GET /catalog/v1/products   -> product + pricing data
//   GET /content/v1/products   -> marketing content
//
// Env:
//   UPSTREAM_PORT          default 4100
//   UPSTREAM_LATENCY_MS    default 150   (applied per request, +/- jitter)
//   UPSTREAM_FAILURE_RATE  default 0     (0..1, chance a request returns 503)
//   UPSTREAM_FAIL_SERVICE  default ""    ("catalog" | "content" to always 503 one service)

import http from 'node:http'
import { readFile } from 'node:fs/promises'

const PORT = Number(process.env.UPSTREAM_PORT ?? 4100)
const LATENCY_MS = Number(process.env.UPSTREAM_LATENCY_MS ?? 150)
const FAILURE_RATE = Number(process.env.UPSTREAM_FAILURE_RATE ?? 0)
const FAIL_SERVICE = process.env.UPSTREAM_FAIL_SERVICE ?? ''

const load = async (file) =>
  JSON.parse(await readFile(new URL(`./data/${file}`, import.meta.url), 'utf8'))

const routes = {
  '/catalog/v1/products': { service: 'catalog', file: 'catalog-products.json' },
  '/content/v1/products': { service: 'content', file: 'content-products.json' },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  const route = routes[url.pathname]

  if (req.method !== 'GET' || !route) {
    return send(res, 404, { error: 'not_found' })
  }

  const jitter = Math.round(Math.random() * LATENCY_MS * 0.5)
  await sleep(LATENCY_MS + jitter)

  if (FAIL_SERVICE === route.service || Math.random() < FAILURE_RATE) {
    console.log(`[upstream] ${route.service} -> 503`)
    return send(res, 503, { error: 'service_unavailable', service: route.service })
  }

  try {
    const body = await load(route.file)
    console.log(`[upstream] ${route.service} -> 200`)
    return send(res, 200, body)
  } catch (err) {
    console.error(`[upstream] failed to read ${route.file}`, err)
    return send(res, 500, { error: 'internal_error' })
  }
})

server.listen(PORT, () => {
  console.log(`[upstream] listening on http://localhost:${PORT}`)
  console.log(`[upstream] latency=${LATENCY_MS}ms failureRate=${FAILURE_RATE} failService=${FAIL_SERVICE || 'none'}`)
})
