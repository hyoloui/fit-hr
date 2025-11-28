/**
 * 구인공고 목록 페이지
 *
 * @description 센터의 구인공고 목록 조회 및 관리
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMyJobPostings } from "@/actions/job-posting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_CENTER } from "@/constants";
import Link from "next/link";

export const metadata = {
  title: "구인공고 관리",
  description: "구인공고 목록 조회 및 관리",
};

export default async function CenterJobsPage() {
  const supabase = await createClient();

  // 1. 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. 프로필 확인 (센터 계정인지)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== ROLE_CENTER) {
    redirect("/");
  }

  // 3. 구인공고 목록 조회
  const jobPostings = await getMyJobPostings();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">구인공고 관리</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">등록한 구인공고를 관리할 수 있습니다</p>
        </div>
        <Link href="/center/jobs/new" className="md:self-start">
          <Button className="w-full md:w-auto">새 공고 등록</Button>
        </Link>
      </div>

      {!jobPostings || jobPostings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">등록된 구인공고가 없습니다</p>
            <Link href="/center/jobs/new">
              <Button>첫 공고 등록하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobPostings.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg md:text-xl">{job.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {job.region} · {job.employment_type} · {job.experience_level}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        활성
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                        비활성
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {job.categories.map((category: string) => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted-foreground">
                      등록일: {new Date(job.created_at).toLocaleDateString("ko-KR")}
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row">
                      <Link href={`/center/jobs/${job.id}/applications`} className="flex-1 md:flex-initial">
                        <Button variant="ghost" size="sm" className="w-full md:w-auto">
                          지원자 보기
                        </Button>
                      </Link>
                      <Link href={`/center/jobs/${job.id}`} className="flex-1 md:flex-initial">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          수정하기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
