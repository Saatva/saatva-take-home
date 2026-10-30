# Saatva Storefront Exercise

Thanks for spending time with us! This exercise is a small slice of how our storefront works: a Next.js frontend, a NestJS BFF (backend-for-frontend), and third-party "upstream" services it pulls data from.

Part of the app is already wired up. Your job is to build the rest.

**We don't expect this to take more than a few hours, however you choose to work.** We'd rather see a focused, well-reasoned slice than a polished everything. Unfinished is fine, and so are shortcuts. We'll talk about what you'd change with more time and resources in the pairing session.

## AI tools

Use whatever tools you'd normally use at work, including AI assistants. We do the same.

In the follow-up pairing session, we'll walk through your code together.

## Getting started

Requires Node 26 or later. With nvm, `nvm install` installs the latest Node 26 release from `.nvmrc`, including recent security fixes.

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

BFF endpoints (`http://localhost:4000/api`):

- `GET /api/health`: health check
- **your routes:** add them to the BFF in `apps/api/src/`. There's a stub in `products/` to start from.

## The exercise: mattress configurator and cart

Use `docs/mock.png` as your design guide for the configurator. It's desktop only, so you decide how it adapts to mobile. There's no mock for the cart, so design it however you like.

### As a shopper, I can

- choose between the mattresses and see each one's name, price, image, rating, and description
- add a mattress to my cart and see the cart count update
- view my cart, change quantities, remove items, and see an accurate total
- refresh the page and still have my cart

### Constraints

- The web app gets its data through the BFF and doesn't know which upstream service anything comes from.
- How you store data is up to you. It has to run locally with no cloud accounts or credentials. If it needs any setup beyond `npm install && npm run dev`, document the steps in your README.

Start with the TODOs in the code. Fonts are already loaded in `app/layout.tsx`, and product images live in `apps/web/public/images`.

If you have time left, add anything you think a real storefront needs.

## Submitting

Clone this repo to get started. When you're done, send us your work whichever way is easiest:

- **Your own repo:** push it to a new public repo on your GitHub account and send us the link
- **A zip:** zip the project (without `node_modules`, but with the `.git` folder) and send us a download link

Either way, make sure it runs from a clean checkout by following your README.

Questions? Reach out anytime. Asking is encouraged, not penalized.
