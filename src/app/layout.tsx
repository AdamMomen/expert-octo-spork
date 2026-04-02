import type { Metadata } from 'next'
import './globals.css'
import '@/src/lib/init'

export const metadata: Metadata = {
  title: 'Playwright Integration Test Lab',
  description: 'Test lab for Playwright integrations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
