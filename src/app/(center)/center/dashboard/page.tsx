import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CenterStats } from "@/components/dashboard/CenterStats";
import { RecentApplicantsList } from "@/components/dashboard/RecentApplicantsList";
import { getCenterStats, getRecentApplicants } from "@/actions/dashboard";
import { FileText, Briefcase, PlusCircle } from "lucide-react";

export default async function CenterDashboardPage() {
  const supabase = await createClient();

  // 레이아웃에서 이미 인증 및 역할 체크 완료
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // user는 레이아웃에서 이미 보장됨
  if (!user) {
    redirect("/login");
  }

  // 센터 정보 조회
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!center) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">대시보드</h1>
            <p className="text-muted-foreground">환영합니다!</p>
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

  // 센터 데이터 조회
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
            <p className="text-muted-foreground">환영합니다!</p>
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
          <p className="text-muted-foreground">환영합니다!</p>
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
