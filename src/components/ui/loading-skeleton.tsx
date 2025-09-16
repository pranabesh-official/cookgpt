"use client";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "avatar" | "card" | "button" | "input";
  lines?: number;
  height?: string;
  width?: string;
}

export function LoadingSkeleton({ 
  className = "", 
  variant = "text", 
  lines = 1, 
  height = "h-4", 
  width = "w-full" 
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-700 rounded";
  
  if (variant === "text") {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${height} ${width} ${
              index === lines - 1 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={`${baseClasses} ${height} ${width} rounded-full ${className}`} />
    );
  }

  if (variant === "card") {
    return (
      <div className={`${baseClasses} ${height} ${width} rounded-lg ${className}`} />
    );
  }

  if (variant === "button") {
    return (
      <div className={`${baseClasses} ${height} ${width} rounded-md ${className}`} />
    );
  }

  if (variant === "input") {
    return (
      <div className={`${baseClasses} ${height} ${width} rounded-md ${className}`} />
    );
  }

  return (
    <div className={`${baseClasses} ${height} ${width} ${className}`} />
  );
}

// Specialized skeleton components
export function RecipeCardSkeleton() {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden p-6">
      <div className="space-y-4">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex space-x-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-16" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-20" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-orange-900/10 dark:via-red-900/10 dark:to-yellow-900/10 py-16 sm:py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge skeleton */}
        <div className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 mb-8 shadow-lg">
          <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mr-3" />
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Heading skeleton */}
        <div className="space-y-4 mb-8">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4 mx-auto" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3 mx-auto" />
        </div>

        {/* Subtitle skeleton */}
        <div className="space-y-2 mb-12 max-w-3xl mx-auto">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6 mx-auto" />
        </div>

        {/* Button skeleton */}
        <div className="w-48 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse mx-auto mb-16" />

        {/* Feature cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl p-8">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse mx-auto mb-6" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4 mx-auto mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <nav className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo skeleton */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>

          {/* Navigation links skeleton */}
          <div className="hidden md:flex space-x-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>

          {/* CTA buttons skeleton */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <NavigationSkeleton />
      <HeroSkeleton />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Section skeleton */}
        <div className="space-y-16">
          {[1, 2, 3].map((section) => (
            <div key={section} className="space-y-8">
              {/* Section header skeleton */}
              <div className="text-center space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3 mx-auto" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2 mx-auto" />
              </div>

              {/* Content skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-4">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse mx-auto" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4 mx-auto" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
