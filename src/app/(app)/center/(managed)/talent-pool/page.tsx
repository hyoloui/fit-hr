import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTrainers } from "@/actions/talent-pool";
import { TrainerTable } from "@/components/talent-pool/TrainerTable";
import { TrainerFilter } from "@/components/talent-pool/TrainerFilter";
import type { TrainerFilter as TrainerFilterType, JobCategoryCode, ExperienceLevelCode } from "@/types";

export const metadata = {
  title: "인재풀",
  description: "트레이너 인재풀 조회 및 관리",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    categories?: string;
    experienceLevel?: string;
  }>;
}

export default async function TalentPoolPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentFilter: TrainerFilterType = {
    search: params.search,
    categories: params.categories?.split(",") as JobCategoryCode[] | undefined,
    experienceLevel: params.experienceLevel as ExperienceLevelCode | undefined,
  };

  const result = await getTrainers(currentFilter);
  const trainers = result.data || [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">인재풀</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          트레이너를 검색하고 영입 제안을 보내보세요
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 shrink-0">
          <TrainerFilter currentFilter={currentFilter} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">총 {trainers.length}명의 트레이너</p>
          <TrainerTable trainers={trainers} />
        </div>
      </div>
    </div>
  );
}
