import Image from 'next/image'
import { CartCount } from '@/components/CartCount'

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Image
          className="site-header__logo"
          src="/images/saatva-logo.webp"
          alt="Saatva"
          width={960}
          height={205}
          priority
        />
        <CartCount />
      </div>
    </header>
  )
}
