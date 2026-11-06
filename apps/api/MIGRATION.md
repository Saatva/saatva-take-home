# Content API v2 migration notes

v1 (`/content/v1/products`) is deprecated and will be turned off on December 15.

## What's new in v2

- `GET /content/v2/products`
- The response is now wrapped in an object: `{ meta, data }`. Products are in `data`.
- Every product has an `updatedAt` timestamp.
- Slugs are now always lowercase.
- Review counts and ratings are always numbers.

## Renamed fields

| v1 | v2 |
|----|----|
| `handle` | `slug` |
| `headline` | `title` |
| `descriptionHtml` | `bodyHtml` |
| `reviews.average` | `rating.value` |
| `reviews.count` | `rating.count` |
| `badges` | `tags` |

## Behavior changes

- `rating.value` is now on a **10-point scale** (v1 used 5), to match our new review provider.
- `bodyHtml` is still trusted HTML from the CMS.

Questions? Ask in #content-api.
