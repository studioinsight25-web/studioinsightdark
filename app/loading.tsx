export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-card rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-dark-card rounded w-2/3"></div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-card rounded-xl overflow-hidden border border-dark-border">
                <div className="animate-pulse">
                  {/* Image Skeleton */}
                  <div className="h-48 bg-dark-section"></div>
                  
                  {/* Content Skeleton */}
                  <div className="p-6">
                    <div className="h-6 bg-dark-section rounded mb-2"></div>
                    <div className="h-4 bg-dark-section rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-dark-section rounded mb-2"></div>
                    <div className="h-4 bg-dark-section rounded w-3/4 mb-4"></div>
                    
                    {/* Stats Skeleton */}
                    <div className="flex gap-4 mb-4">
                      <div className="h-4 bg-dark-section rounded w-16"></div>
                      <div className="h-4 bg-dark-section rounded w-16"></div>
                      <div className="h-4 bg-dark-section rounded w-16"></div>
                    </div>
                    
                    {/* Price Skeleton */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-6 bg-dark-section rounded w-20"></div>
                      <div className="h-8 bg-dark-section rounded w-24"></div>
                    </div>
                    
                    {/* Button Skeleton */}
                    <div className="h-10 bg-dark-section rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}


