export function HabitSkeletonList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
