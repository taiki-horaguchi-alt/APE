import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Worker App - 外国人労働者向けマルチ言語アプリ',
  description: 'Agricultural worker management app for foreign workers',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
