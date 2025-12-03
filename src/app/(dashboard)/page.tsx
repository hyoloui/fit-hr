import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrainerStats } from "@/components/dashboard/TrainerStats";
import { CenterStats } from "@/components/dashboard/CenterStats";
import { RecentApplicationsList } from "@/components/dashboard/RecentApplicationsList";
import { RecentApplicantsList } from "@/components/dashboard/RecentApplicantsList";
import {
  getTrainerStats,
  getCenterStats,
  getRecentApplications,
  getRecentApplicants,
} from "@/actions/dashboard";
import { FileText, Briefcase, PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 프로필 정보 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // 역할별 데이터 조회
  if (profile.role === "trainer") {
    const [stats, recentApplications] = await Promise.all([
      getTrainerStats(user.id),
      getRecentApplications(user.id),
    ]);

    if (!stats || !recentApplications) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">대시보드</h1>
              <p className="text-muted-foreground">{profile.name}님, 환영합니다!</p>
            </div>
          </div>
          <p className="text-destructive">데이터를 불러오는데 실패했습니다.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">대시보드</h1>
            <p className="text-muted-foreground">{profile.name}님, 환영합니다!</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                구인공고 보기
              </Link>
            </Button>
            <Button asChild>
              <Link href="/resumes/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                이력서 작성
              </Link>
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <TrainerStats stats={stats} />

        {/* 최근 활동 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentApplicationsList applications={recentApplications} />

          {/* 빠른 링크 */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <Link
                href="/resumes"
                className="flex items-center gap-4 rounded-lg border p-6 hover:bg-accent transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">내 이력서</h3>
                  <p className="text-sm text-muted-foreground">
                    이력서를 관리하고 업데이트하세요
                  </p>
                </div>
              </Link>

              <Link
                href="/applications"
                className="flex items-center gap-4 rounded-lg border p-6 hover:bg-accent transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">지원 내역</h3>
                  <p className="text-sm text-muted-foreground">
                    지원한 공고의 상태를 확인하세요
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 센터인 경우
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!center) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">대시보드</h1>
            <p className="text-muted-foreground">{profile.name}님, 환영합니다!</p>
          </div>
        </div>
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground mb-4">센터 정보를 먼저 등록해주세요.</p>
          <Button asChild>
            <Link href="/center/profile">센터 정보 등록</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [stats, recentApplicants] = await Promise.all([
    getCenterStats(center.id),
    getRecentApplicants(center.id),
  ]);

  if (!stats || !recentApplicants) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">대시보드</h1>
            <p className="text-muted-foreground">{profile.name}님, 환영합니다!</p>
          </div>
        </div>
        <p className="text-destructive">데이터를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">{profile.name}님, 환영합니다!</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/center/jobs">
              <Briefcase className="mr-2 h-4 w-4" />
              내 공고 관리
            </Link>
          </Button>
          <Button asChild>
            <Link href="/center/jobs/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              공고 등록
            </Link>
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <CenterStats stats={stats} />

      {/* 최근 활동 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentApplicantsList applicants={recentApplicants} />

        {/* 빠른 링크 */}
        <div className="space-y-4">
          <div className="grid gap-4">
            <Link
              href="/center/profile"
              className="flex items-center gap-4 rounded-lg border p-6 hover:bg-accent transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">센터 정보</h3>
                <p className="text-sm text-muted-foreground">센터 프로필을 관리하세요</p>
              </div>
            </Link>

            <Link
              href="/center/jobs"
              className="flex items-center gap-4 rounded-lg border p-6 hover:bg-accent transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">구인공고 관리</h3>
                <p className="text-sm text-muted-foreground">등록한 공고를 관리하세요</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
