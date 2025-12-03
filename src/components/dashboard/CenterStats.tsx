import { Briefcase, Users, CheckCircle, Bell } from "lucide-react";
import { StatsCard } from "./StatsCard";
import type { CenterStats as CenterStatsType } from "@/actions/dashboard";

interface CenterStatsProps {
  stats: CenterStatsType;
}

export function CenterStats({ stats }: CenterStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="구인공고"
        value={stats.jobPostingCount}
        icon={Briefcase}
        description="등록된 공고"
      />
      <StatsCard
        title="총 지원자"
        value={stats.totalApplicants}
        icon={Users}
        description="받은 지원"
      />
      <StatsCard
        title="활성 공고"
        value={stats.activeJobCount}
        icon={CheckCircle}
        description="현재 활성화"
      />
      <StatsCard
        title="신규 지원"
        value={stats.todayApplicants}
        icon={Bell}
        description={`오늘 ${stats.todayApplicants}명 / 이번 주 ${stats.weekApplicants}명`}
      />
    </div>
  );
}
