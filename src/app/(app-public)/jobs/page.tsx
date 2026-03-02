import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JobFilter } from "@/components/jobs/JobFilter";
import { JobCard } from "@/components/jobs/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Map } from "lucide-react";
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

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 인증 상태 확인 (선택적)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 필터 적용하여 구인공고 조회
  let query = supabase
    .from("job_postings_with_details")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params.location) {
    query = query.ilike("address", `%${params.location}%`);
  }
  if (params.categories) {
    const categoryArray = params.categories.split(",");
    query = query.contains("categories", categoryArray);
  }
  if (params.gender && params.gender !== "any") {
    query = query.in("gender", [params.gender, "any"]);
  }
  if (params.employmentType) {
    query = query.eq("employment_type", params.employmentType);
  }
  if (params.experienceLevel) {
    query = query.eq("experience_level", params.experienceLevel);
  }
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  const { data: jobs } = await query;


  const currentFilter: JobFilterType = {
    location: params.location,
    categories: params.categories?.split(",") as JobCategoryCode[] | undefined,
    gender: params.gender as Gender | undefined,
    employmentType: params.employmentType as EmploymentTypeCode | undefined,
    experienceLevel: params.experienceLevel as ExperienceLevelCode | undefined,
    search: params.search,
  };

  return (
    <div className="container px-4 mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">구인공고</h1>
          <p className="text-sm text-muted-foreground mt-1">원하는 조건의 구인공고를 찾아보세요</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={`/map${
              Object.keys(params).length > 0
                ? `?${new URLSearchParams(
                    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
                  ).toString()}`
                : ""
            }`}
          >
            <Map className="h-4 w-4 mr-2" />
            지도로 보기
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 shrink-0">
          <JobFilter currentFilter={currentFilter} />
        </div>
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
                  <JobCard
                    key={job.id}
                    job={job}
                    isAuthenticated={!!user}
                    userId={user?.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
