export function Header() {
  // TODO (candidate): the cart count should reflect what's been added to the cart.
  const cartCount = 0

  return (
    <header className="site-header">
      <span className="site-header__logo">Saatva</span>
      <span className="site-header__cart" aria-label={`Cart, ${cartCount} items`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="20" r="1.25" fill="currentColor" />
          <circle cx="17" cy="20" r="1.25" fill="currentColor" />
        </svg>
        <span>{cartCount}</span>
      </span>
    </header>
  )
}
