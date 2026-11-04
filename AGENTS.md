# AGENTS.md

Guidance for AI coding agents working in this repository. `README.md` holds the exercise brief and is the source of truth for requirements. This file covers how to work in the code.

## What this is

A small storefront slice:
- A Next.js frontend (`apps/web`).
- A NestJS BFF (`apps/api`) that merges two third-party upstream services into one storefront-shaped API.
- A mock of those upstream services (`services/upstream`).
- A types-only package (`packages/contracts`) shared by the API and web.

## Commands

Node 22.12 or later (`.nvmrc`). npm workspaces; run everything from the repo root.

```bash
npm install
npm run dev            # upstream :4100, api :4000, web :3000 (concurrently -k: one dies, all die)
npm run dev:api        # or dev:upstream / dev:web individually
npm test               # vitest: apps/api then apps/web
npx tsc --noEmit -p apps/web
npx tsc --noEmit -p apps/api/tsconfig.json        # includes specs
npm run build -w apps/api && npm run build -w apps/web
```

Upstream failure drills: start the upstream with env vars such as `UPSTREAM_FAIL_SERVICE=catalog|content`, `UPSTREAM_LATENCY_MS=5000` or `UPSTREAM_FAILURE_RATE=0.5`. On the BFF side, `UPSTREAM_TIMEOUT_MS` (default 3000) sets the upstream timeout. On the web side, `SITE_URL` (default `http://localhost:3000`) is the base for canonical, Open Graph and JSON-LD URLs.

## Hard rules

- **Never modify `services/upstream/**`.** It stands in for third-party services we don't control. Exercise failures with its env switches instead.
- **The mattress toggle stays hand-built.** No component library for it (README requirement). Avoid UI or CSS frameworks generally; styling is plain CSS in `apps/web/app/globals.css`.
- **Fonts are the README's:** Source Serif 4 (headings) and Questrial (body), loaded in `apps/web/app/layout.tsx`. Don't swap fonts to match the mock.
- **`npm install && npm run dev` must work from a clean checkout on Windows.** Keep `package-lock.json` in sync with any dependency change.
- **Don't add logging or metrics.** It's out of scope; the upstream client's existing `Logger.warn` is the only logging.

## Architecture and invariants

### API (`apps/api`)
- **Upstream data is untrusted.** `UpstreamClient` returns `unknown`. Everything goes through zod in `src/upstream/upstream.schemas.ts` (`parseCatalog`, `parseContent`), which uses per-record `safeParse` so a bad record is dropped rather than failing the response.
  - Numbers may arrive as strings. Use the existing `toNumber` preprocess, **never** `z.coerce.number()`, because it turns `""` and `null` into `0`.
  - The currency must be a 3-letter code; anything else makes the catalog envelope invalid.
- **Failure policy** (`src/products/products.service.ts`):
  - Prices are never stale. A catalog that is rejected, malformed or times out → `ServiceUnavailableException` (503).
  - Content can be stale. The last good content is cached in memory. A content result with no usable records is treated like an outage, so it can't overwrite the cache.
  - No content and nothing cached → the response gets `degraded: true`.
- **`src/products/products.mapper.ts` is pure:** no Nest imports, no decorators. Keep risky logic in pure functions like this, so it's testable without Nest.
- **Description HTML is sanitized in the BFF** (`src/products/sanitize.ts`, an allowlist), even though the provider calls it trusted. `descriptionHtml` is safe by contract. Don't loosen the allowlist casually.
- **Specs stay out of the build.** `tsconfig.build.json` excludes `*.spec.ts`, so `dist/` must not contain specs.

### Contract (`packages/contracts/index.d.ts`)
- It's a hand-written `.d.ts`, imported with `import type` only. Don't convert it to `.ts`: the API's `rootDir: ./src` would break and Next would need `transpilePackages`.
- Prices are integer **cents**, with one top-level `currency`. Content fields are `null` when unavailable, never omitted. `degraded` is only ever present as `true`.
- A change to the contract means updating the producer (mapper), the consumers (web) and the fixtures in specs together.

### Web (`apps/web`)
- `app/page.tsx` is a server component.
  - It fetches through `lib/products.ts` (`cache()`-wrapped, so `generateMetadata` and the page share one BFF call), resolves `?mattress=` with `lib/selection.ts`, and renders JSON-LD and the configurator.
  - `searchParams` is a Promise and must be awaited.
- Client components are marked `'use client'`: `ProductConfigurator`, `MattressToggle`, `CartProvider`, `CartCount`, `CartPopover` and `app/error.tsx`. Props crossing from server to client must be serializable.
- **Selection lives in the URL** (`?mattress=<id>`). The client updates it with `window.history.replaceState`, **not** `router.push`/`replace`, which would re-run the server component and re-fetch the BFF. The default selection is the first catalog product. The canonical URL is always `/`.
- **The toggle is a WAI-ARIA radio group with roving tabindex** (arrow keys, Home and End). Preserve the keyboard and ARIA behavior when touching it.
- **Cart:**
  - `lib/cart.ts` is a pure reducer: one line per SKU, quantity 1–10, and `−` floors at 1, so delete is explicit.
  - `CartProvider` wraps it. The cart is in memory and per tab.
  - The popup is a non-modal dialog: Escape, × or an outside click closes it, and focus returns to the cart button.
- **JSON-LD:** build it in `lib/jsonLd.ts` and always serialize with `serializeJsonLd`, which escapes `<`.
- **Error recovery:** "Try again" in `app/error.tsx` must call `router.refresh()` **and** `reset()`. `reset()` alone doesn't re-fetch server data.
- **`app/loading.tsx` mirrors the configurator layout classes,** so nothing shifts when content streams in. Keep it in step with layout changes.

## Code style

- **Prettier** (`.prettierrc`): no semicolons, single quotes, trailing commas, `printWidth` 100.
- **Comments:** sparse. Comment a non-obvious *why*, not what the code does. Don't reference planning docs or README sections in code comments.
- **Imports:** use `@/` in web (it maps to `apps/web`), relative paths in the API, and `import type` for contracts.
- **Styling:** use the CSS custom properties defined on `:root` in `globals.css` (`--color-*`); add a token rather than a hard-coded color. BEM-ish class names (`block__element`, `is-selected`).
- **Line endings:** `apps/web/app/globals.css` uses CRLF. Preserve it when editing.

## Testing

- vitest in both apps. Specs sit next to the code as `*.spec.ts`. Run them with `npm test`.
- API specs use fixtures and the real mock data in `services/upstream/data/`, with no network and no Nest testing module. Construct `ProductsService` with a stub client.
- Web specs cover pure functions only, in the node environment. There are no React Testing Library or jsdom component tests.
- Add or adjust tests with any change to parsing, mapping, the failure policy, selection, formatting, JSON-LD or the cart reducer.

## Gotchas

- **Don't run `next build` while `npm run dev` is running.** Both write `apps/web/.next`.
- **VS Code bundles TypeScript 6**, which enables `noUncheckedSideEffectImports` and flags `import './globals.css'`. `apps/web/tsconfig.json` sets it to `false`; keep that setting.
- **Next 15.5 streams metadata into `<body>`** for normal browsers and Googlebot, and into `<head>` for link-preview bots. That's expected, not a bug.
- **The logo is `public/images/saatva-logo.webp`** (WebP data). The product images have different aspect ratios. They are cropped into a fixed 634×349 frame with `object-position: left center`.
- **`.ae-artifacts/`** holds local planning and UAT documents. Don't commit it.
