import { formatCount, formatRating } from '@/lib/format'

const STARS = '★★★★★'

export function StarRating({ average, count }: { average: number; count: number }) {
  const pct = Math.max(0, Math.min(100, (average / 5) * 100))
  const label = `${formatRating(average)} out of 5 stars, ${formatCount(count)} reviews`

  return (
    <div className="star-rating">
      <span className="visually-hidden">{label}</span>
      <span className="star-rating__stars" aria-hidden="true">
        <span className="star-rating__base">{STARS}</span>
        <span className="star-rating__fill" style={{ width: `${pct}%` }}>
          {STARS}
        </span>
      </span>
      <span className="star-rating__text" aria-hidden="true">
        {formatRating(average)} ({formatCount(count)} reviews)
      </span>
    </div>
  )
}
