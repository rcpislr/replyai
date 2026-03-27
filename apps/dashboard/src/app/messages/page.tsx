'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components'
import { MessageTable } from '../../components/MessageTable'
import { Badge, Card, LoadingSpinner } from '../../components/Common'
import { useAuth } from '../../contexts/AuthContext'
import { useMessages } from '../../hooks'

export default function MessagesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { messages, isLoading, getMessages, approve, reject } = useMessages()
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'sent' | 'failed'>('all')
  const [platformFilter, setPlatformFilter] = useState<'all' | 'trendyol' | 'hepsiburada' | 'instagram'>('all')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    getMessages()
  }, [getMessages])

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter
      const matchesPlatform = platformFilter === 'all' || message.platform === platformFilter
      return matchesStatus && matchesPlatform
    })
  }, [messages, platformFilter, statusFilter])

  const stats = useMemo(() => {
    return {
      total: messages.length,
      waitingApproval: messages.filter(message => (message.status === 'pending' || message.status === 'approved') && message.aiResponse).length,
      processing: messages.filter(message => message.status === 'processing').length,
      sent: messages.filter(message => message.status === 'sent').length,
    }
  }, [messages])

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mesajlar</h1>
          <p className="text-gray-600">AI akislarini, onay bekleyen yanitlari ve gonderim durumlarini yonet</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-gray-500">Toplam</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Onay Bekleyen</div>
            <div className="text-3xl font-bold text-amber-600 mt-2">{stats.waitingApproval}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Islenen</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.processing}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Gonderilen</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.sent}</div>
          </Card>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Durum</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tum durumlar</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Platform</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as typeof platformFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tum platformlar</option>
              <option value="trendyol">Trendyol</option>
              <option value="hepsiburada">Hepsiburada</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          <Badge variant="info">{filteredMessages.length} kayit gosteriliyor</Badge>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <MessageTable
            messages={filteredMessages}
            isLoading={isLoading}
            onApprove={approve}
            onReject={reject}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
