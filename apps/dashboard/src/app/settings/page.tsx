'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components'
import { Button, Input } from '../../components'
import { Card } from '../../components/Common'
import { useAuth } from '../../contexts/AuthContext'

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [settings, setSettings] = useState({
    approvalMode: 'auto',
    confidenceThreshold: 80,
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSave = () => {
    // Save to backend
    alert('Ayarlar kaydedildi!')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-gray-600">Platformu özelleştir</p>
        </div>

        {/* Bildirim Ayarları */}
        <Card title="Onay Modu">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otomatik Yanıt Modu
              </label>
              <select
                value={settings.approvalMode}
                onChange={(e) => setSettings({ ...settings, approvalMode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="auto">Otomatik - Güven skoru yeterli ise gönder</option>
                <option value="manual">Manuel - Tüm mesajları onayla</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Güven Skoru Eşiği ({settings.confidenceThreshold}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Bu değerin üzerinde skoru olan yanıtlar otomatik gönderilir
              </p>
            </div>

            <Button onClick={handleSave}>Kaydet</Button>
          </div>
        </Card>

        {/* Profil Bilgileri */}
        {user && (
          <Card title="Profil Bilgileri">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">E-posta</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ad</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <p className="font-medium text-gray-900">{user.role}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
