import type { Product } from '@saatva/contracts'

export const MAX_SELECTION_PARAM_LENGTH = 64

type WithId = Pick<Product, 'id'>

export function findExplicitSelection(
  products: WithId[],
  param: string | string[] | undefined,
): string | null {
  if (typeof param !== 'string') return null
  if (param.length > MAX_SELECTION_PARAM_LENGTH) return null
  const wanted = param.trim().toLowerCase()
  if (!wanted) return null
  return products.find((p) => p.id.toLowerCase() === wanted)?.id ?? null
}

export function resolveSelection(
  products: WithId[],
  param: string | string[] | undefined,
): string | null {
  if (products.length === 0) return null
  return findExplicitSelection(products, param) ?? products[0].id
}
