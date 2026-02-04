import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardSkletonLoader({ CustomClass = "" }) {
  return (
    <Card className={`mt-4 ${CustomClass}`}>
      <CardContent className={`p-2 md:p-6 ${CustomClass}`}>
        {/* Tabs */}
        <div className="flex gap-x-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
          {/* Left Column */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          {/* Right Column */}
        </div>

        {/* Submit button */}
        <div className="mt-10">
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
