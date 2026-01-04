import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobCardSkeleton } from "@/components/common/CardSkeleton";

export default function JobsLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 필터 스켈레톤 */}
        <div className="lg:w-80 flex-shrink-0">
          <Card className="hidden lg:block">
            <CardHeader>
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 공고 목록 스켈레톤 */}
        <div className="flex-1">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
