import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLikedJobs } from "@/actions/like";
import { JobCard } from "@/components/jobs/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { ROLE_TRAINER } from "@/constants";

export default async function LikesPage() {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 프로필 조회하여 역할 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== ROLE_TRAINER) {
    redirect("/");
  }

  // 좋아요한 공고 목록 조회
  const result = await getLikedJobs();

  if (result.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">좋아요</h1>
          <p className="text-sm text-muted-foreground mt-1">저장한 구인공고 목록입니다</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const likes = result.data || [];

  // 데이터 변환: job_postings 중첩 구조 → JobCard 형태
  const jobs = likes
    .map((like) => {
      const jobPosting = like.job_postings;
      if (!jobPosting || typeof jobPosting !== "object") return null;

      // job_postings_with_details 뷰의 구조에 맞게 변환
      return {
        id: jobPosting.id,
        title: jobPosting.title,
        region: jobPosting.region,
        categories: jobPosting.categories,
        employment_type: jobPosting.employment_type,
        experience_level: jobPosting.experience_level,
        gender: jobPosting.gender,
        salary_type: jobPosting.salary_type,
        salary_min: jobPosting.salary_min,
        salary_max: jobPosting.salary_max,
        created_at: jobPosting.created_at,
        center_name: jobPosting.center?.name || null,
        // job_postings_with_details 뷰의 나머지 필드들 (nullable)
        center_id: null,
        center_logo: null,
        deadline: null,
        description: null,
        employment_type_name: null,
        experience_level_name: null,
        is_active: null,
        like_count: null,
        region_name: null,
        updated_at: null,
        view_count: null,
        application_count: null,
      };
    })
    .filter((job) => job !== null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">좋아요</h1>
        <p className="text-sm text-muted-foreground mt-1">저장한 구인공고 목록입니다</p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">저장한 공고가 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-4">
              구인공고를 찾아 좋아요를 눌러보세요
            </p>
            <Button asChild>
              <Link href="/jobs">구인공고 보기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">총 {jobs.length}개의 공고</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isAuthenticated={true} userRole="trainer" userId={user.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
