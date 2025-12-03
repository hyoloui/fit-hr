import { FileText, Send, Clock, Heart } from "lucide-react";
import { StatsCard } from "./StatsCard";
import type { TrainerStats as TrainerStatsType } from "@/actions/dashboard";

interface TrainerStatsProps {
  stats: TrainerStatsType;
}

export function TrainerStats({ stats }: TrainerStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="내 이력서"
        value={stats.resumeCount}
        icon={FileText}
        description="등록된 이력서"
      />
      <StatsCard
        title="총 지원"
        value={stats.totalApplications}
        icon={Send}
        description="지원한 공고"
      />
      <StatsCard
        title="대기중"
        value={stats.pendingApplications}
        icon={Clock}
        description="검토 대기중"
      />
      <StatsCard
        title="좋아요"
        value={stats.likeCount}
        icon={Heart}
        description="관심 공고"
      />
    </div>
  );
}
