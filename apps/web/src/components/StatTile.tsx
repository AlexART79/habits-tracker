import type { LucideIcon } from 'lucide-react';

type StatTileProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
};

export function StatTile({
  icon: Icon,
  label,
  value,
}: StatTileProps): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/65">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
