import { Skeleton } from "../ui";

export const SignInFormSkeleton = () => {
  return (
    <div className="w-full h-full bg-white">
      <div className="h-[91.3vh] bg-cover grid 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-1 grid-cols-1 bg-gray-100">
        {/* Left side - Image skeleton */}
        <div className="2xl:inline-block xl:inline-block lg:hidden hidden">
          <div className="h-full flex items-center justify-center p-4">
            <Skeleton className="w-full max-w-[1200px] aspect-[3/2] rounded-xl" />
          </div>
        </div>

        {/* Right side - Form skeleton */}
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center bg-white dark:bg-[#1e293b] 2xl:h-[730px] xl:h-[730px] lg:h-full h-full lg:w-full w-full xl:w-[600px] rounded-md z-10 p-8">
            {/* Logo/title skeleton */}
            <div className="w-full text-center mb-8">
              <Skeleton className="w-40 h-8 mx-auto mb-2 rounded-md" />
              <Skeleton className="w-64 h-4 mx-auto rounded-md" />
            </div>

            <div className="mt-4 w-full space-y-6">
              {/* Email field skeleton */}
              <div className="space-y-2">
                <Skeleton className="w-16 h-4 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
              </div>

              {/* Password field skeleton */}
              <div className="space-y-2">
                <Skeleton className="w-20 h-4 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
              </div>

              {/* Captcha skeleton */}
              <div className="min-h-[100px]">
                <Skeleton className="w-full h-20 rounded-md" />
              </div>

              {/* Remember me & Forgot password skeleton */}
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-24 h-4 rounded-md" />
                </div>
                <Skeleton className="w-32 h-4 rounded-md" />
              </div>

              {/* Login button skeleton */}
              <Skeleton className="w-full h-10 rounded-md" />

              {/* Demo credentials skeleton */}
              <div className="mt-10 space-y-3 rounded-md border border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-[#1e293b]">
                <Skeleton className="w-48 h-4 rounded-md" />
                <Skeleton className="w-40 h-4 rounded-md" />
                <div className="flex justify-end">
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
