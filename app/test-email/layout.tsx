// app/test-email/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Test - SpotItForMe',
  description: 'SpotItForMe email sistemini test edin',
}

export default function TestEmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}