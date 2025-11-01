'use client'

export function ProductCardSkeleton() {
  return (
    <div className="bg-dark-card rounded-xl overflow-hidden border border-dark-border animate-pulse">
      <div className="h-48 bg-dark-section" />
      <div className="p-6">
        <div className="h-6 bg-dark-section rounded mb-2 w-3/4" />
        <div className="h-4 bg-dark-section rounded mb-4 w-1/2" />
        <div className="h-4 bg-dark-section rounded mb-2 w-full" />
        <div className="h-4 bg-dark-section rounded mb-4 w-5/6" />
        <div className="flex gap-4 mb-4">
          <div className="h-4 bg-dark-section rounded w-16" />
          <div className="h-4 bg-dark-section rounded w-16" />
        </div>
        <div className="h-10 bg-dark-section rounded" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TextSkeleton({ width = 'full', height = 'h-4' }: { width?: string; height?: string }) {
  return (
    <div className={`${height} bg-dark-section rounded animate-pulse ${width === 'full' ? 'w-full' : width}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border animate-pulse">
      <div className="h-6 bg-dark-section rounded mb-4 w-3/4" />
      <div className="space-y-2">
        <TextSkeleton />
        <TextSkeleton width="5/6" />
        <TextSkeleton width="4/6" />
      </div>
    </div>
  )
}

