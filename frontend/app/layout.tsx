import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maritime Supply Decision Platform',
  description: 'AI-powered maritime supply chain optimization for energy buyers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg-base text-text-primary font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
