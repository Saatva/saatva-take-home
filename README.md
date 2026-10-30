# Saatva Storefront Exercise

Thanks for spending time with us! This exercise is a small slice of how our storefront works: a Next.js frontend, a NestJS BFF (backend-for-frontend), and third-party "upstream" services it pulls data from.

Part of the app is already wired up. Your job is to finish piping it together.

**We don't expect this to take more than a few hours, however you choose to work.** We'd rather see a focused, well-reasoned slice than a polished everything. Unfinished is fine, and we'll talk about what you'd do next in the pairing session.

## AI tools

Use whatever tools you'd normally use at work, including AI assistants. We do the same.

In the follow-up pairing session, we'll walk through your code together.

## Getting started

Requires Node 22.12 or later. With nvm, `nvm install` picks up the version from `.nvmrc`.

```bash
nvm install
npm install
npm run dev
```

This starts three processes:

| Process  | URL                                | What it is                                                       |
| -------- | ---------------------------------- | ---------------------------------------------------------------- |
| upstream | http://localhost:4100              | Mock third-party catalog + content services. **We don't control these, so don't change them.** |
| api      | http://localhost:4000/api/health   | NestJS BFF. Yours to change.                                     |
| web      | http://localhost:3000              | Next.js app. Yours to change.                                    |

Upstream endpoints:

- `GET http://localhost:4100/catalog/v1/products`: products and pricing
- `GET http://localhost:4100/content/v1/products`: marketing copy and reviews

BFF endpoints:

- `GET http://localhost:4000/api/health`: health check
- `GET http://localhost:4000/api/products`: not implemented yet (that's your job)

## The exercise: mattress configurator

Use `docs/mock.png` as your design guide. It's desktop only, so you decide how it adapts to mobile.

### API

1. Implement `GET /api/products` in `apps/api/src/products/products.service.ts`.
2. The web app needs data from both upstream services. Combine them in the BFF so the frontend doesn't need to know where each piece lives.
3. You decide the response shape. Design it for what the storefront needs.

### UI

1. Build the mattress selection toggle from scratch (no component library for this piece, but anything else is fair game).
2. As the selection changes, show the selected mattress's name, price, image, and review rating.
3. Render the product description.
4. "Add to Cart" increments the cart count in the header.

Fonts (Source Serif for headings, Questrial for body) are already loaded in `app/layout.tsx`. Product images live in `apps/web/public/images`.

### Nice to have (only if time allows)

- A test for whichever part you think most deserves one
- Loading and error states
- Anything you think a real storefront page would need

## Submitting

Clone this repo to get started. When you're done, send us your work whichever way is easiest:

- **Your own repo:** push it to a new public repo on your GitHub account and send us the link
- **A zip:** zip the project (without `node_modules`, but with the `.git` folder) and send us a download link

Either way, make sure `npm install && npm run dev` works from a clean checkout.

Questions? Reach out anytime. Asking is encouraged, not penalized.
