/**
 * 통합 대시보드 페이지
 *
 * @description 이력서 요약 + 센터 소유 시 센터 요약 표시
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Briefcase, Send, Heart } from "lucide-react";

export const metadata = {
  title: "대시보드",
  description: "Fit HR 대시보드",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 이력서, 센터, 지원 내역 병렬 조회
  const [{ data: resumes }, { data: center }, { data: applications }] = await Promise.all([
    supabase.from("resumes").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("centers").select("id, name").eq("owner_id", user.id).single(),
    supabase.from("applications").select("id, status").eq("user_id", user.id),
  ]);

  const hasResumes = resumes && resumes.length > 0;
  const hasCenter = !!center;
  const pendingApplications = applications?.filter((a) => a.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">Fit HR 활동을 한눈에 확인하세요</p>
      </div>

      {/* 빠른 액션 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/resumes">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">내 이력서</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumes?.length || 0}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/applications">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">지원 내역</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.length || 0}</div>
              {pendingApplications > 0 && (
                <p className="text-xs text-muted-foreground">{pendingApplications}건 대기중</p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/jobs">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">구인공고</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">탐색</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/likes">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">좋아요</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">보기</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 이력서 유도 또는 요약 */}
      {!hasResumes && (
        <Card>
          <CardHeader>
            <CardTitle>이력서를 작성해보세요</CardTitle>
            <CardDescription>이력서를 등록하면 구인공고에 지원할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/resumes/new">이력서 작성하기</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 센터 유도 또는 요약 */}
      {hasCenter ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              내 센터: {center.name}
            </CardTitle>
            <CardDescription>센터 관리 페이지에서 공고를 등록하고 지원자를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/center/jobs">공고 관리</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/center/profile">센터 정보</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              센터를 운영하고 계신가요?
            </CardTitle>
            <CardDescription>센터를 등록하면 구인공고를 올리고 트레이너를 채용할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/center/register">센터 등록하기</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
