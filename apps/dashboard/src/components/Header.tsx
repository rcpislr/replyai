import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-violet-600">ReplyAI</div>
        {user && <span className="text-gray-600 text-sm">/ {user.email}</span>}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-gray-700">{user.name}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
            >
              Çıkış
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export function Sidebar() {
  const menuItems = [
    { label: 'Anasayfa', href: '/', icon: '📊' },
    { label: 'Mesajlar', href: '/messages', icon: '💬' },
    { label: 'Platform', href: '/platforms', icon: '🔗' },
    { label: 'Bilgi Bankası', href: '/knowledge', icon: '📚' },
    { label: 'Ayarlar', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
