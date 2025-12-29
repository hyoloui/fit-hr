import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrainerStats } from "@/components/dashboard/TrainerStats";
import { RecentApplicationsList } from "@/components/dashboard/RecentApplicationsList";
import { getTrainerStats, getRecentApplications } from "@/actions/dashboard";
import { FileText, Briefcase, PlusCircle } from "lucide-react";

export default async function MyPage() {
  const supabase = await createClient();

  // 레이아웃에서 이미 인증 및 역할 체크 완료
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // user는 레이아웃에서 이미 보장됨
  if (!user) {
    redirect("/login");
  }

  // 트레이너 데이터 조회 (레이아웃에서 이미 트레이너임을 보장)
  const [stats, recentApplications] = await Promise.all([
    getTrainerStats(user.id),
    getRecentApplications(user.id),
  ]);

  if (!stats || !recentApplications) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">마이페이지</h1>
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
          <h1 className="text-2xl font-bold">마이페이지</h1>
          <p className="text-muted-foreground">환영합니다!</p>
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
                <p className="text-sm text-muted-foreground">이력서를 관리하고 업데이트하세요</p>
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
                <p className="text-sm text-muted-foreground">지원한 공고의 상태를 확인하세요</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
