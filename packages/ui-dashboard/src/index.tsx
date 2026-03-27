'use client';

import type { ReactNode } from 'react';
import { Badge } from '@replyai/ui-base';

interface SidebarProps {
  items: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    badge?: number;
  }>;
  activeItem?: string;
}

export function Sidebar({ items, activeItem }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">ReplyAI</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeItem === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge variant="danger">{item.badge}</Badge>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export function DataTable<T>({ columns, data, keyField, onRowClick, loading }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
  onDrop?: (item: T) => void;
}

interface KanbanProps<T> {
  columns: KanbanColumn<T>[];
  renderItem: (item: T) => ReactNode;
}

export function Kanban<T>({ columns, renderItem }: KanbanProps<T>) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.id} className="flex-shrink-0 w-80">
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              {col.title} ({col.items.length})
            </h3>
            <div className="space-y-3">
              {col.items.map((item, idx) => (
                <div key={idx}>{renderItem(item)}</div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
