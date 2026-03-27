interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-[#18181b] rounded-xl p-4 border border-zinc-800/60">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-sm">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
    </div>
  );
}
