'use client'

import { useState } from 'react'

interface Tenant {
  id: string
  name: string
  email: string
  plan: string
  status: 'active' | 'trial' | 'suspended'
  createdAt: string
}

interface Transaction {
  id: string
  tenantName: string
  amount: number
  method: 'paytr' | 'havale'
  status: 'pending' | 'completed' | 'failed'
  date: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('tenants')
  const [tenants] = useState<Tenant[]>([
    { id: '1', name: 'Test Firma', email: 'test@test.com', plan: 'Starter', status: 'active', createdAt: '2024-01-15' },
    { id: '2', name: 'ABC Tekstil', email: 'abc@abc.com', plan: 'Pro', status: 'trial', createdAt: '2024-01-20' },
    { id: '3', name: 'XYZ Mağazacılık', email: 'xyz@xyz.com', plan: 'Enterprise', status: 'active', createdAt: '2024-01-10' },
  ])
  const [transactions] = useState<Transaction[]>([
    { id: '1', tenantName: 'ABC Tekstil', amount: 299, method: 'paytr', status: 'completed', date: '2024-01-20' },
    { id: '2', tenantName: 'XYZ Mağazacılık', amount: 999, method: 'havale', status: 'pending', date: '2024-01-21' },
  ])

  const stats = { totalTenants: 156, activeTenants: 89, trialTenants: 42, monthlyRevenue: 45600, pendingPayments: 2340 }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      trial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    const labels: Record<string, string> = { active: 'Aktif', trial: 'Deneme', suspended: 'Askıda', completed: 'Tamamlandı', pending: 'Bekliyor', failed: 'Başarısız' }
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>{labels[status]}</span>
  }

  const tabs = [
    { id: 'tenants', label: 'Tenantlar', icon: '🏢' },
    { id: 'payments', label: 'Ödemeler', icon: '💳' },
    { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f12]">
      {/* Top Bar */}
      <header className="h-16 bg-[#18181b] border-b border-zinc-800/60 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-violet-500/25">R</div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">ReplyAI</span>
          <span className="px-2.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs font-medium rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors">🔔</button>
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-medium text-white">A</div>
            <span className="text-sm text-zinc-300">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-[#18181b] border-r border-zinc-800/60 p-4 min-h-[calc(100vh-64px)]">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-violet-500/15 text-violet-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Toplam Tenant', value: stats.totalTenants, color: 'blue' },
                { label: 'Aktif', value: stats.activeTenants, color: 'emerald' },
                { label: 'Deneme', value: stats.trialTenants, color: 'amber' },
                { label: 'Aylık Gelir', value: `${stats.monthlyRevenue} TL`, color: 'violet' },
                { label: 'Bekleyen', value: `${stats.pendingPayments} TL`, color: 'amber' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#18181b] rounded-xl p-4 border border-zinc-800/60">
                  <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'tenants' && (
              <div className="bg-[#18181b] rounded-2xl border border-zinc-800/60 overflow-hidden">
                <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Tenant Yönetimi</h2>
                  <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">+ Yeni Tenant</button>
                </div>
                <table className="w-full">
                  <thead className="bg-zinc-800/30">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Firma</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Plan</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Durum</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Katılma</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-4"><span className="font-medium text-white">{t.name}</span></td>
                        <td className="px-5 py-4 text-zinc-400">{t.email}</td>
                        <td className="px-5 py-4"><span className="px-2.5 py-1 bg-violet-500/20 text-violet-400 rounded-lg text-xs">{t.plan}</span></td>
                        <td className="px-5 py-4">{getStatusBadge(t.status)}</td>
                        <td className="px-5 py-4 text-zinc-500 text-sm">{t.createdAt}</td>
                        <td className="px-5 py-4"><button className="text-violet-400 hover:text-violet-300 text-sm">Düzenle</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-[#18181b] rounded-2xl border border-zinc-800/60 overflow-hidden">
                <div className="p-5 border-b border-zinc-800/60">
                  <h2 className="text-lg font-semibold text-white">Ödeme Geçmişi</h2>
                </div>
                <table className="w-full">
                  <thead className="bg-zinc-800/30">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tenant</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tutar</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Yöntem</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Durum</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-white">{tx.tenantName}</td>
                        <td className="px-5 py-4 text-white">{tx.amount} TL</td>
                        <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs ${tx.method === 'paytr' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{tx.method === 'paytr' ? 'PayTR' : 'Havale'}</span></td>
                        <td className="px-5 py-4">{getStatusBadge(tx.status)}</td>
                        <td className="px-5 py-4 text-zinc-500 text-sm">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-[#18181b] rounded-2xl border border-zinc-800/60 p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Sistem Ayarları</h2>
                <div className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">PayTR Merchant ID</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-[#0f0f12] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="Merchant ID girin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">PayTR Secret Key</label>
                    <input type="password" className="w-full px-4 py-2.5 bg-[#0f0f12] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="Secret Key girin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Banka Hesap No (HAVALE)</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-[#0f0f12] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="TR00 0000 0000 0000 0000 0000" />
                  </div>
                  <div className="pt-2">
                    <button className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors">Ayarları Kaydet</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}