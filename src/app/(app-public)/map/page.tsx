import { createClient } from "@/lib/supabase/server";
import { JobFilter } from "@/components/jobs/JobFilter";
import { JobMapView } from "@/components/jobs/JobMapView";
import type {
  JobFilter as JobFilterType,
  JobCategoryCode,
  Gender,
  EmploymentTypeCode,
  ExperienceLevelCode,
} from "@/types";

interface PageProps {
  searchParams: Promise<{
    location?: string;
    categories?: string;
    gender?: string;
    employmentType?: string;
    experienceLevel?: string;
    search?: string;
  }>;
}

export default async function MapPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("job_postings_with_details")
    .select("*")
    .eq("is_active", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("created_at", { ascending: false });

  if (params.location) query = query.ilike("address", `%${params.location}%`);
  if (params.categories) query = query.contains("categories", params.categories.split(","));
  if (params.gender && params.gender !== "any") query = query.in("gender", [params.gender, "any"]);
  if (params.employmentType) query = query.eq("employment_type", params.employmentType);
  if (params.experienceLevel) query = query.eq("experience_level", params.experienceLevel);
  if (params.search)
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);

  const { data: jobs } = await query;

  const currentFilter: JobFilterType = {
    location: params.location,
    categories: params.categories?.split(",") as JobCategoryCode[] | undefined,
    gender: params.gender as Gender | undefined,
    employmentType: params.employmentType as EmploymentTypeCode | undefined,
    experienceLevel: params.experienceLevel as ExperienceLevelCode | undefined,
    search: params.search,
  };

  const searchParamsString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

  return (
    <div className="-m-4 -mt-4 md:-m-6 h-[calc(100%+5rem)] md:h-[calc(100%+3rem)] flex overflow-hidden">
      {/*
        (app-public)/layout.tsx main의 p-4 pt-16 md:p-6 패딩을 상쇄.
        로그인: Sidebar+Header 레이아웃에서 h-svh 기준, main flex-1이 나머지 높이를 채움
        비로그인: min-h-screen flex-col에서 main flex-1이 나머지 높이를 채움
        두 경우 모두 main이 flex-1이므로 h-full + 음수마진으로 처리
        5rem = pt-16(4rem) + p-4(1rem), 3rem = p-6 top(1.5rem) + p-6 bottom(1.5rem)
      */}
      {/* 왼쪽 패널 (데스크톱) */}
      <div className="hidden lg:flex lg:w-[380px] lg:shrink-0 lg:flex-col lg:border-r lg:bg-background lg:overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">구인공고 지도</h1>
        </div>
        <div className="p-4 flex-1">
          <JobFilter currentFilter={currentFilter} />
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <JobMapView
          jobs={jobs ?? []}
          isAuthenticated={!!user}
          userId={user?.id}
          currentSearchParams={searchParamsString}
          currentFilter={currentFilter}
        />
      </div>
    </div>
  );
}
