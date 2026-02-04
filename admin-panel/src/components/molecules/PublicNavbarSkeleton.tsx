import { Skeleton } from "../ui";

export function PublicNavbarSkeleton() {
  return (
    <header className="p-2 sticky top-0 z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary h-[80px]">
      <div className="mx-0 lg:mx-4 flex h-14 items-center">
        {/* Logo skeleton */}
        <div className="cursor-pointer">
          <div className="hidden md:flex gap-4 lg:gap-0 items-center px-4">
            <div className="relative w-32 h-12">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </div>
          <div className="flex md:hidden gap-4 lg:gap-0 items-center">
            <div className="relative w-8 h-8">
              <Skeleton className="w-full h-full rounded-md" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 items-center space-x-2 justify-end px-2">
          <div className="flex items-center justify-center space-x-4">
            {/* Theme toggle skeleton */}
            <Skeleton className="w-9 h-9 rounded-md" />
            
            {/* Visit Site button skeleton */}
            <Skeleton className="w-24 h-9 rounded-md" />
            
            {/* Locale switcher skeleton */}
            <Skeleton className="w-20 h-9 rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}
