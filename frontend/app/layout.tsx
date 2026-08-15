import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'POLY EXEA — AI Maritime Supply Decision Platform',
  description: 'Evaluates vessels, pipelines, alternate routes, and spot suppliers simultaneously to solve energy supply chain disruptions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-[#FAFAF8] text-[#18181B] font-sans antialiased selection:bg-[#18181B] selection:text-white">
        {children}
      </body>
    </html>
  )
}
