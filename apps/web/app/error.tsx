'use client'

import { startTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  // reset() alone only re-renders the boundary; refresh() re-runs the server data load.
  const retry = () => {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <section className="container error-state" role="alert">
      <h1 className="error-state__title">We couldn&apos;t load mattresses right now.</h1>
      <p className="error-state__text">Please try again in a moment.</p>
      <button type="button" className="button-cta error-state__button" onClick={retry}>
        Try again
      </button>
    </section>
  )
}
