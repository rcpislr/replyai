'use client'

import Link from 'next/link'

const stats = [
  { label: 'Toplam Tenant', value: '156' },
  { label: 'Aktif Tenant', value: '89' },
  { label: 'Bekleyen Odeme', value: '2.340 TL' },
  { label: 'Aylik Gelir', value: '45.600 TL' },
]

const shortcuts = [
  { href: '/settings', title: 'Sistem Ayarlari', description: 'PayTR, API anahtarlari ve banka hesaplarini yonet.' },
  { href: '/settings', title: 'Odeme Altyapisi', description: 'Merchant bilgilerini ve havale ayarlarini guncelle.' },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#0f0f12] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="flex flex-col gap-3 border-b border-zinc-800/70 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">ReplyAI Admin</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Yonetim Merkezi</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Tenant, odeme ve platform ayarlarini tek yerden yonetin.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Ayarlara Git
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-800/70 bg-[#18181b] p-5 shadow-lg shadow-black/20">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {shortcuts.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition-colors hover:border-violet-500/40"
            >
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}
