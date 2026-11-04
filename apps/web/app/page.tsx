import type { Metadata } from 'next'
import type { Product } from '@saatva/contracts'
import { ProductConfigurator } from '@/components/ProductConfigurator'
import { ProductJsonLd } from '@/components/ProductJsonLd'
import { formatPrice } from '@/lib/format'
import { getProducts } from '@/lib/products'
import { findExplicitSelection, resolveSelection } from '@/lib/selection'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const effectiveCents = (p: Product) => {
  const price = p.variants[0]?.price
  return price ? (price.saleAmount ?? price.amount) : null
}

const listNames = (names: string[]) =>
  names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  try {
    const { products, currency } = await getProducts()
    const params = await searchParams
    const selected = products.find((p) => p.id === findExplicitSelection(products, params.mattress))

    if (selected) {
      const cents = effectiveCents(selected)
      const price = cents !== null ? ` From ${formatPrice(cents, currency)}.` : ''
      const title = `${selected.name} Mattress | Saatva`
      const description = `${selected.headline ?? `The ${selected.name} mattress`}.${price}`
      return {
        title,
        description,
        alternates: { canonical: '/' },
        openGraph: { title, description, type: 'website', images: [selected.image.src] },
      }
    }

    const prices = products.map(effectiveCents).filter((c): c is number => c !== null)
    const from = prices.length ? ` from ${formatPrice(Math.min(...prices), currency)}` : ''
    const title = 'Saatva | Choose Your Mattress'
    const description = `Compare ${listNames(products.map((p) => p.name))} mattresses${from}.`
    return {
      title,
      description,
      alternates: { canonical: '/' },
      openGraph: { title, description, type: 'website', images: products.map((p) => p.image.src) },
    }
  } catch {
    // Layout defaults; the page itself renders the error boundary.
    return {}
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const { products, currency, degraded } = await getProducts()
  const params = await searchParams
  const initialSelectedId = resolveSelection(products, params.mattress)

  if (products.length === 0 || initialSelectedId === null) {
    return (
      <section className="container empty-state">
        <p>No mattresses available right now.</p>
      </section>
    )
  }

  return (
    <>
      <ProductJsonLd
        products={products}
        currency={currency}
        selectedId={findExplicitSelection(products, params.mattress)}
        baseUrl={SITE_URL}
      />
      <ProductConfigurator
        products={products}
        currency={currency}
        degraded={degraded === true}
        initialSelectedId={initialSelectedId}
      />
    </>
  )
}
