import type { Metadata } from 'next'
import './globals.css'
import { BackgroundAtmosphere } from '@/components/ui/BackgroundAtmosphere'

export const metadata: Metadata = {
  title: 'EON EXEA — AI Maritime Supply Decision Platform',
  description: 'AI decision platform for energy supply chain optimization',
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
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="bg-[#FAFAF8] text-[#18181B] font-sans antialiased min-h-screen relative selection:bg-[#18181B] selection:text-white">
        <BackgroundAtmosphere />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
