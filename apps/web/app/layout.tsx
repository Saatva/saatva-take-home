import type { Metadata } from 'next'
import { Questrial, Source_Serif_4 } from 'next/font/google'
import { Header } from '@/components/Header'
import './globals.css'

const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' })
const body = Questrial({ subsets: ['latin'], weight: '400', variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Saatva | Choose Your Mattress',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
