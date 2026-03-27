'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Badge } from '@replyai/ui-base';

interface SystemSettings {
  PAYTR_MERCHANT_ID?: { value: string; isEncrypted: boolean };
  PAYTR_MERCHANT_KEY?: { value: string; isEncrypted: boolean };
  PAYTR_MERCHANT_SALT?: { value: string; isEncrypted: boolean };
  OPENROUTER_API_KEY?: { value: string; isEncrypted: boolean };
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  IBAN: string;
  accountHolder: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, banksRes] = await Promise.all([
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/bank-accounts', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      ]);
      
      if (settingsRes.ok) {
        const data = await settingsRes.json() as SystemSettings;
        setSettings(data);
      }
      if (banksRes.ok) {
        const data = await banksRes.json() as BankAccount[];
        setBankAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: string, isEncrypted: boolean) => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ key, value, isEncrypted }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await fetch('/api/admin/bank-accounts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        bankName: formData.get('bankName'),
        accountNumber: formData.get('accountNumber'),
        IBAN: formData.get('IBAN'),
        accountHolder: formData.get('accountHolder'),
      }),
    });
    
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sistem Ayarları</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Ödeme Ayarları (PayTR)</h2>
        <div className="space-y-4">
          {['PAYTR_MERCHANT_ID', 'PAYTR_MERCHANT_KEY', 'PAYTR_MERCHANT_SALT'].map((key) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-48 font-medium">{key}</label>
              <input
                type={showKey[key] ? 'text' : 'password'}
                defaultValue={settings[key as keyof SystemSettings]?.value || ''}
                className="flex-1 px-3 py-2 border rounded-lg"
                onBlur={(e) => handleSaveSetting(key, e.currentTarget.value, true)}
              />
              <Button variant="ghost" size="sm" onClick={() => setShowKey(prev => ({ ...prev, [key]: !prev[key] }))}>
                {showKey[key] ? 'Gizle' : 'Göster'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">API Ayarları</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">OPENROUTER_API_KEY</label>
            <input
              type={showKey.OPENROUTER_API_KEY ? 'text' : 'password'}
              defaultValue={settings.OPENROUTER_API_KEY?.value || ''}
              className="flex-1 px-3 py-2 border rounded-lg"
              onBlur={(e) => handleSaveSetting('OPENROUTER_API_KEY', e.currentTarget.value, true)}
            />
            <Button variant="ghost" size="sm" onClick={() => setShowKey(prev => ({ ...prev, OPENROUTER_API_KEY: !prev.OPENROUTER_API_KEY }))}>
              {showKey.OPENROUTER_API_KEY ? 'Gizle' : 'Göster'}
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Banka Hesapları (Havale)</h2>
        <div className="space-y-4 mb-6">
          {bankAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{account.bankName}</p>
                <p className="text-sm text-gray-600">{account.IBAN}</p>
                <p className="text-sm text-gray-500">{account.accountHolder}</p>
              </div>
              <Badge variant={account.isActive ? 'success' : 'danger'}>
                {account.isActive ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddBankAccount} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
          <Input name="bankName" label="Banka Adı" required />
          <Input name="accountNumber" label="Hesap Numarası" required />
          <Input name="IBAN" label="IBAN" required />
          <Input name="accountHolder" label="Hesap Sahibi" required />
          <Button type="submit" className="col-span-2">Ekle</Button>
        </form>
      </section>
    </div>
  );
}
