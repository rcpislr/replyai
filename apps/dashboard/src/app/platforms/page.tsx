'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components'
import { Button, Input } from '../../components'
import { Card, LoadingSpinner } from '../../components/Common'
import { useAuth } from '../../contexts/AuthContext'
import { usePlatforms } from '../../hooks'

export default function PlatformsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { platforms, isLoading, getPlatforms, addPlatform } = usePlatforms()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ platform: 'trendyol', credentials: '' })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    getPlatforms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addPlatform(formData.platform, { mock: formData.credentials })
      setFormData({ platform: 'trendyol', credentials: '' })
      setShowForm(false)
      getPlatforms()
    } catch (err) {
      console.error('Error adding platform:', err)
    }
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platformlar</h1>
            <p className="text-gray-600">Mesaj kanallarını yönet</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>+ Platform Ekle</Button>
        </div>

        {showForm && (
          <Card title="Platform Bağla">
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="trendyol">Trendyol</option>
                <option value="hepsiburada">Hepsiburada</option>
                <option value="instagram">Instagram</option>
              </select>
              <Input
                label="Kimlik Bilgisi"
                placeholder="API Key veya Token"
                value={formData.credentials}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit">Bağla</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>İptal</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4">
          {platforms.map((p) => (
            <Card key={p.id} title={p.platform.toUpperCase()}>
              <p className="text-gray-600">Bağlı: {p.isActive ? '✅' : '❌'}</p>
              <p className="text-sm text-gray-500 mt-2">Bağlant. Tarihi: {new Date(p.createdAt).toLocaleDateString('tr-TR')}</p>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
