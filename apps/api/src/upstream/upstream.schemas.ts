import { z } from 'zod'

/** Accepts finite numbers and plain numeric strings. "", null, "abc" -> undefined (invalid). */
function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const text = value.trim()
    if (!/^-?\d+(\.\d+)?$/.test(text)) return undefined
    return Number(text)
  }
  return undefined
}

const numeric = (schema: z.ZodNumber) => z.preprocess(toNumber, schema)

const nonEmptyString = z.string().trim().min(1)

const priceCents = numeric(z.number().int().positive())

const catalogProductSchema = z
  .object({
    sku: nonEmptyString,
    productHandle: nonEmptyString,
    displayName: nonEmptyString,
    priceCents,
    salePriceCents: priceCents.nullable().catch(null),
    imageKey: nonEmptyString,
    status: z.enum(['active', 'discontinued']),
  })
  .transform((product) => ({
    ...product,
    salePriceCents:
      product.salePriceCents !== null && product.salePriceCents < product.priceCents
        ? product.salePriceCents
        : null,
  }))

const ratingSchema = z.object({
  average: numeric(z.number().min(0).max(5)),
  count: numeric(z.number().int().min(0)),
})

const contentSchema = z.object({
  handle: nonEmptyString,
  headline: z.string().trim(),
  descriptionHtml: z.string(),
  badges: z.unknown().transform((value) =>
    Array.isArray(value)
      ? value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  ),
  reviews: z.unknown().transform((value) => ratingSchema.safeParse(value).data ?? null),
})

// ISO 4217 shape; anything else would make Intl.NumberFormat throw in the web app
const currencyCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/)
  .transform((code) => code.toUpperCase())

const envelopeSchema = z.object({
  meta: z.object({ currency: currencyCode }),
  data: z.array(z.unknown()),
})

export type ParsedCatalogProduct = z.output<typeof catalogProductSchema>
export type ParsedContent = z.output<typeof contentSchema>
export interface ParsedCatalog {
  currency: string
  products: ParsedCatalogProduct[]
}

/** Returns null when the envelope is unusable; invalid records are dropped individually. */
export function parseCatalog(raw: unknown): ParsedCatalog | null {
  const envelope = envelopeSchema.safeParse(raw)
  if (!envelope.success) return null

  const products: ParsedCatalogProduct[] = []
  for (const record of envelope.data.data) {
    const parsed = catalogProductSchema.safeParse(record)
    if (parsed.success) products.push(parsed.data)
  }
  return { currency: envelope.data.meta.currency, products }
}

/** Returns null when the payload is not an array; invalid records are dropped individually. */
export function parseContent(raw: unknown): ParsedContent[] | null {
  if (!Array.isArray(raw)) return null

  const records: ParsedContent[] = []
  for (const record of raw) {
    const parsed = contentSchema.safeParse(record)
    if (parsed.success) records.push(parsed.data)
  }
  return records
}
