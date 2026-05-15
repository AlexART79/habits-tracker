interface HabitStatCardProps {
  value: number;
  label: string;
}

export function HabitStatCard({ value, label }: HabitStatCardProps) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
