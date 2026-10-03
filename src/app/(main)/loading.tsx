export default function Loading() {
  return (
    <div className="w-full relative pb-24 space-y-12 animate-pulse min-h-[100vh]">
      {/* Hero Skeleton */}
      <div className="w-full h-[60vh] min-h-[500px] relative bg-surface-elevated/50 border-b border-white/5">
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-10 z-20 max-w-[1920px] mx-auto pb-12">
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-16 bg-white/10 rounded-full" />
              <div className="h-4 w-4 rounded-full bg-white/10" />
              <div className="h-4 w-16 bg-white/10 rounded-full" />
            </div>
            <div className="h-16 w-3/4 bg-white/10 rounded-lg" />
            <div className="h-4 w-full bg-white/5 rounded-full" />
            <div className="h-4 w-5/6 bg-white/5 rounded-full" />
            <div className="h-4 w-4/6 bg-white/5 rounded-full" />
            <div className="pt-4 flex items-center gap-4">
              <div className="h-12 w-40 bg-white/10 rounded-full" />
              <div className="h-12 w-40 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Rows Skeleton */}
      <div className="px-6 md:px-10 max-w-[1920px] mx-auto space-y-16">
        {[1, 2].map((row) => (
          <div key={row} className="space-y-6">
            <div className="h-8 w-48 bg-white/10 rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((card) => (
                <div key={card} className="aspect-[2/3] w-full rounded-lg bg-surface-elevated border border-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
