import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wide Hormuz — AI Maritime Decision Platform for Hormuz Disruption',
  description:
    'AI-powered maritime energy decision platform evaluating live vessels, IPSA pipeline bypasses, and alternate sea lanes when the Strait of Hormuz is unavailable.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="bg-[#FAFAF8] text-[#1B133C] antialiased selection:bg-[#1B133C] selection:text-white font-sans">
        {children}
      </body>
    </html>
  )
}
