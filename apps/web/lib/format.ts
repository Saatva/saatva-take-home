export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatRating(avg: number): string {
  return avg.toFixed(1)
}
