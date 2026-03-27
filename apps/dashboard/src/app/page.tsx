'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../components'
import { StatCard } from '../components/MessageTable'
import { LoadingSpinner } from '../components/Common'
import { useAuth } from '../contexts/AuthContext'
import { useDashboard   } from '../hooks'

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { stats, isLoading, getStats } = useDashboard()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    getStats()
  }, [])

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hoşgeldin 👋</h1>
          <p className="text-gray-600">Müşteri mesajlarınızı yapay zeka ile yönetin</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Toplam Mesaj"
              value={stats.totalMessages}
              subtitle={`${stats.aiReplyPercentage}% AI yanıtlandı`}
              icon="💬"
            />
            <StatCard
              title="Gönderilen Mesaj"
              value={stats.sentMessages}
              subtitle="Bu ay"
              icon="✅"
            />
            <StatCard
              title="Bekleyen Mesaj"
              value={stats.pendingMessages}
              subtitle="Onay bekliyor"
              icon="⏳"
            />
            <StatCard
              title="AI Kredisi"
              value={`${stats.aiCredits - stats.usedAiCredits}/${stats.aiCredits}`}
              subtitle="Kullanılabilir"
              icon="🔌"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <a href="/messages" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-900">Mesajlar</h3>
            <p className="text-sm text-gray-600">Müşteri mesajlarını yönet</p>
          </a>
          <a href="/platforms" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold text-gray-900">Platformlar</h3>
            <p className="text-sm text-gray-600">Bağlı platformlarını gör</p>
          </a>
          <a href="/knowledge" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-gray-900">Bilgi Bankası</h3>
            <p className="text-sm text-gray-600">AI eğitim verilerini yönet</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
