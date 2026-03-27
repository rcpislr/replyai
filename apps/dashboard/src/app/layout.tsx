import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'

export const metadata: Metadata = {
  title: 'ReplyAI - Müşteri Paneli',
  description: 'Yapay zeka destekli müşteri hizmetleri platformu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="bg-white text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}