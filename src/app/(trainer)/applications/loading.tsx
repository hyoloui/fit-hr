import { CardSkeleton } from "@/components/common/CardSkeleton";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>

      {/* 지원 목록 스켈레톤 */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
