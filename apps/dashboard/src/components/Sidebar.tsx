import Link from 'next/link';

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
}

interface SidebarProps {
  title?: string;
  items?: SidebarItem[];
}

export function Sidebar({ title = 'ReplyAI', items = [] }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[#18181b] border-r border-zinc-800/60 p-4">
      <div className="text-lg font-semibold text-white mb-6">{title}</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/50">
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
