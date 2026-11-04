import type { Product } from '@saatva/contracts'
import { buildProductJsonLd, serializeJsonLd } from '@/lib/jsonLd'

type Props = {
  products: Product[]
  currency: string
  selectedId: string | null
  baseUrl: string
}

export function ProductJsonLd({ products, currency, selectedId, baseUrl }: Props) {
  const data = buildProductJsonLd({ products, currency, selectedId, baseUrl })
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
  )
}
