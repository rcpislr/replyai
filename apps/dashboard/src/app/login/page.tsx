'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input } from '../../components'
import { Card } from '../../components/Common'

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isLoading, error: authError, clearError, isAuthenticated } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    tenantName: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password)
      } else {
        await register(formData.email, formData.password, formData.name, formData.tenantName)
      }
      router.push('/')
    } catch (err) {
      console.error('Auth error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card title="ReplyAI">
          <form onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <Input
              label="E-posta"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            {!isLoginMode && (
              <>
                <Input
                  label="Ad"
                  placeholder="Adınız"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="İşletme Adı"
                  placeholder="İşletmenizin adı"
                  value={formData.tenantName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tenantName: e.target.value })}
                  required
                />
              </>
            )}

            <Input
              label="Şifre"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoginMode ? 'Giriş Yap' : 'Kaydol'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode)
                clearError()
              }}
              className="w-full text-sm text-violet-600 hover:text-violet-700"
            >
              {isLoginMode ? 'Hesabın yok mu? Kaydol' : 'Zaten hesabın var mı? Giriş yap'}
            </button>
          </form>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo Kredileri:</p>
          <code className="text-xs bg-gray-200 px-2 py-1 rounded">test@test.com / password123</code>
        </div>
      </div>
    </div>
  )
}
