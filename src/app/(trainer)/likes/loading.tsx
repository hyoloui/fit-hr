import { JobCardSkeleton } from "@/components/common/CardSkeleton";

export default function LikesLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>

      {/* 좋아요 공고 목록 스켈레톤 */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
