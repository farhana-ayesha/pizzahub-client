export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative grid size-20 place-items-center rounded-full bg-[#fde7e1]">
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          <span className="text-3xl" role="img" aria-label="Pizza">
            🍕
          </span>
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-tight">Warming up the oven…</p>
          <p className="mt-1 text-sm text-muted-foreground">Loading fresh pizza for you.</p>
        </div>
      </div>
    </div>
  );
}
