export default function Loading() {
  return (
    <div className="container skeleton" aria-busy="true">
      <span className="visually-hidden">Loading mattresses</span>
      <div className="configurator">
        <div className="configurator__media skeleton__block" />
        <div className="configurator__details">
          <h1 className="configurator__title">Choose Your Mattress</h1>
          <p className="configurator__label">Select mattress type</p>
          <div className="skeleton__block skeleton__toggle" />
          <div className="configurator__info">
            <div className="configurator__row">
              <div className="skeleton__block skeleton__line skeleton__line--name" />
              <div className="skeleton__block skeleton__line skeleton__line--price" />
            </div>
            <div className="skeleton__block skeleton__line skeleton__line--rating" />
            <div className="skeleton__block skeleton__line" />
            <div className="skeleton__block skeleton__line skeleton__line--short" />
          </div>
          <div className="skeleton__block skeleton__cta" />
        </div>
      </div>
    </div>
  )
}
