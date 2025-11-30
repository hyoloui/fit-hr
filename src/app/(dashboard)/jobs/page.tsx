import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobFilter } from "@/components/jobs/JobFilter";
import { JobCard } from "@/components/jobs/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import type { JobFilter as JobFilterType, RegionCode, JobCategoryCode, Gender, EmploymentTypeCode, ExperienceLevelCode } from "@/types";

interface PageProps {
  searchParams: Promise<{
    region?: string;
    categories?: string;
    gender?: string;
    employmentType?: string;
    experienceLevel?: string;
    search?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 프로필 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 트레이너만 접근 가능
  if (profile?.role !== "trainer") {
    redirect("/");
  }

  // 필터 적용하여 구인공고 조회
  let query = supabase
    .from("job_postings_with_details")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // 지역 필터
  if (params.region) {
    query = query.eq("region", params.region);
  }

  // 업종 필터 (배열)
  if (params.categories) {
    const categoryArray = params.categories.split(",");
    query = query.contains("categories", categoryArray);
  }

  // 성별 필터
  if (params.gender && params.gender !== "any") {
    query = query.in("preferred_gender", [params.gender, "any"]);
  }

  // 고용형태 필터
  if (params.employmentType) {
    query = query.eq("employment_type", params.employmentType);
  }

  // 경력 필터
  if (params.experienceLevel) {
    query = query.eq("experience_level", params.experienceLevel);
  }

  // 검색어 필터 (제목 또는 설명)
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  const { data: jobs } = await query;

  // 현재 필터 상태
  const currentFilter: JobFilterType = {
    region: params.region as RegionCode | undefined,
    categories: params.categories?.split(",") as JobCategoryCode[] | undefined,
    gender: params.gender as Gender | undefined,
    employmentType: params.employmentType as EmploymentTypeCode | undefined,
    experienceLevel: params.experienceLevel as ExperienceLevelCode | undefined,
    search: params.search,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">구인공고</h1>
        <p className="text-sm text-muted-foreground mt-1">
          원하는 조건의 구인공고를 찾아보세요
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 필터 */}
        <div className="lg:w-80 flex-shrink-0">
          <JobFilter currentFilter={currentFilter} />
        </div>

        {/* 공고 목록 */}
        <div className="flex-1">
          {!jobs || jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-sm text-muted-foreground">다른 조건으로 검색해보세요</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">총 {jobs.length}개의 공고</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} userId={user.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
