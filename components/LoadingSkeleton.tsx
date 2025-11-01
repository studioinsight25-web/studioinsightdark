'use client'

export function ProductCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-dark-card to-dark-section rounded-xl overflow-hidden border border-dark-border animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-52 bg-gradient-to-br from-dark-section via-dark-border to-dark-section">
        <div className="absolute top-4 right-4 w-16 h-6 bg-dark-section/50 rounded-full" />
      </div>
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        <div className="h-6 bg-dark-section rounded-lg w-3/4" />
        <div className="h-4 bg-dark-section rounded-lg w-1/2" />
        <div className="space-y-2">
          <div className="h-4 bg-dark-section rounded w-full" />
          <div className="h-4 bg-dark-section rounded w-5/6" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 bg-dark-section rounded-lg w-20" />
          <div className="h-4 bg-dark-section rounded-lg w-20" />
        </div>
        <div className="h-12 bg-gradient-to-r from-dark-section via-dark-border to-dark-section rounded-xl" />
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
    <div className="bg-gradient-to-br from-dark-card to-dark-section rounded-xl p-6 border border-dark-border animate-pulse">
      <div className="h-6 bg-dark-section rounded-lg mb-4 w-3/4" />
      <div className="space-y-3">
        <TextSkeleton />
        <TextSkeleton width="5/6" />
        <TextSkeleton width="4/6" />
      </div>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-dark-card to-dark-section rounded-xl p-6 border border-dark-border animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-dark-section rounded-xl" />
        <div className="flex-1">
          <div className="h-5 bg-dark-section rounded-lg mb-2 w-3/4" />
          <div className="h-4 bg-dark-section rounded-lg w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-dark-section rounded-lg w-2/3" />
    </div>
  )
}

