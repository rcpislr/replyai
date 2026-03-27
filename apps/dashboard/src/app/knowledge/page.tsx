'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../components'
import { Button, Input } from '../../components'
import { Card, LoadingSpinner } from '../../components/Common'
import { useAuth } from '../../contexts/AuthContext'
import APIClient from '@replyai/api-client'
import type { KnowledgeDocument } from '@replyai/shared'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function KnowledgePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, token } = useAuth()
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '' })
  const apiClient = new APIClient(apiBaseUrl)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!token) return

    apiClient.setToken(token)
    void fetchDocuments()
  }, [token])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getDocuments()
      setDocuments(response.data || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await apiClient.uploadDocument(formData.title, formData.content)
      setFormData({ title: '', content: '' })
      setShowForm(false)
      await fetchDocuments()
    } catch (err) {
      console.error('Error uploading document:', err)
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
            <h1 className="text-3xl font-bold text-gray-900">Bilgi Bankasi</h1>
            <p className="text-gray-600">AI yanitlarini guclendir</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>+ Dokuman Ekle</Button>
        </div>

        {showForm && (
          <Card title="Dokuman Yukle">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Baslik"
                placeholder="Dokuman basligi"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icerik
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Dokuman icerigi"
                  rows={6}
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Yukle</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Iptal
                </Button>
              </div>
            </form>
          </Card>
        )}

        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} title={doc.title}>
                <p className="text-gray-600 text-sm mb-2">{doc.content.substring(0, 100)}...</p>
                <p className="text-xs text-gray-500">
                  Yuklenen: {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">Henuz dokuman yuklenmemis</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
