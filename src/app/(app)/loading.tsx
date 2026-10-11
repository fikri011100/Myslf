export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
