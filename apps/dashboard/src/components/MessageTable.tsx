import React from 'react';
import { Message } from '@replyai/shared';
import { Badge, LoadingSpinner } from './Common';
import { Button } from './Button';

interface MessageTableProps {
  messages: Message[];
  isLoading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

function formatDate(value: Date | null) {
  if (!value) return '-';

  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageTable({ messages, isLoading = false, onApprove, onReject }: MessageTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Mesaj bulunamadi
      </div>
    );
  }

  const statusVariant = {
    pending: 'warning',
    processing: 'info',
    approved: 'success',
    sent: 'success',
    rejected: 'error',
    failed: 'error',
  } as const;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">Musteri</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">Gelen Mesaj</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">AI Onerisi</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">Platform</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">Durum</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">Zaman</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">Islem</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg.id} className="border-b border-gray-200 align-top hover:bg-gray-50">
              <td className="px-6 py-4 min-w-[180px]">
                <div className="font-medium text-gray-900">{msg.customerName || 'Bilinmeyen musteri'}</div>
                <div className="text-xs text-gray-500 mt-1">{msg.customerEmail || msg.customerId}</div>
              </td>
              <td className="px-6 py-4 min-w-[260px]">
                <p className="text-gray-800 whitespace-pre-wrap leading-6">{msg.content}</p>
              </td>
              <td className="px-6 py-4 min-w-[300px]">
                {msg.aiResponse ? (
                  <div className="space-y-2">
                    <p className="text-gray-800 whitespace-pre-wrap leading-6">{msg.aiResponse}</p>
                    <Badge variant={msg.confidenceScore && msg.confidenceScore >= 85 ? 'success' : 'warning'}>
                      Guven {msg.confidenceScore ?? 0}%
                    </Badge>
                  </div>
                ) : (
                  <span className="text-gray-400">Henuz AI yaniti yok</span>
                )}
              </td>
              <td className="px-6 py-4 capitalize text-gray-700">{msg.platform}</td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <Badge variant={statusVariant[msg.status as keyof typeof statusVariant] || 'default'}>
                    {msg.status}
                  </Badge>
                  {msg.direction === 'outbound' && (
                    <div className="text-xs text-gray-500">Gonderilen cevap kaydi</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                <div>{formatDate(msg.createdAt)}</div>
                {msg.processedAt && (
                  <div className="text-xs text-gray-500 mt-1">Islendi: {formatDate(msg.processedAt)}</div>
                )}
                {msg.sentAt && (
                  <div className="text-xs text-gray-500 mt-1">Gonderildi: {formatDate(msg.sentAt)}</div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {(msg.status === 'pending' || msg.status === 'approved') && msg.aiResponse && (
                    <Button size="sm" variant="primary" onClick={() => onApprove?.(msg.id)}>
                      Onayla ve Gonder
                    </Button>
                  )}
                  {(msg.status === 'pending' || msg.status === 'approved') && (
                    <Button size="sm" variant="danger" onClick={() => onReject?.(msg.id)}>
                      Reddet
                    </Button>
                  )}
                  {msg.status === 'processing' && (
                    <span className="text-xs text-blue-600">AI yaniti hazirlaniyor</span>
                  )}
                  {msg.status === 'sent' && (
                    <span className="text-xs text-green-600">Akis tamamlandi</span>
                  )}
                  {msg.status === 'failed' && (
                    <span className="text-xs text-red-600">Gonderim hatasi</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}
