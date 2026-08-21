import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent: string;
  sublabel?: string;
};

export function StatCard({ label, value, icon, accent, sublabel }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {sublabel && <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
