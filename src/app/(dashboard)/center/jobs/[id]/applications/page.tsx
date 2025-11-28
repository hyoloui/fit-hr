/**
 * 지원자 목록 조회 페이지
 *
 * @description 특정 구인공고에 지원한 지원자 목록
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getMyJobPosting } from "@/actions/job-posting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_CENTER } from "@/constants";
import Link from "next/link";

interface ApplicationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const APPLICATION_STATUS_LABELS = {
  pending: "대기중",
  reviewed: "검토완료",
  accepted: "합격",
  rejected: "불합격",
} as const;

const APPLICATION_STATUS_VARIANTS = {
  pending: "secondary",
  reviewed: "default",
  accepted: "default",
  rejected: "secondary",
} as const;

export async function generateMetadata({ params }: ApplicationsPageProps) {
  const { id } = await params;
  const jobPosting = await getMyJobPosting(id);

  return {
    title: jobPosting ? `${jobPosting.title} - 지원자 목록` : "지원자 목록",
    description: "구인공고 지원자 목록",
  };
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. 프로필 확인 (센터 계정인지)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== ROLE_CENTER) {
    redirect("/");
  }

  // 3. 구인공고 조회 (센터 소유자만)
  const jobPosting = await getMyJobPosting(id);

  if (!jobPosting) {
    notFound();
  }

  // 4. 지원자 목록 조회
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      user:profiles!applications_user_id_fkey(id, name, email, phone),
      resume:resumes(id, title)
    `
    )
    .eq("job_posting_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/center/jobs">
            <Button variant="ghost" size="sm" className="mb-2">
              ← 목록으로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">지원자 목록</h1>
          <p className="text-muted-foreground mt-2">{jobPosting.title}</p>
        </div>
        <Link href={`/center/jobs/${id}`}>
          <Button variant="outline">공고 수정</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 지원자 ({applications?.length || 0}명)</CardTitle>
          <CardDescription>지원자 정보와 상태를 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          {!applications || applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">아직 지원자가 없습니다</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>이력서</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>지원일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.user?.name || "-"}</TableCell>
                      <TableCell>{application.user?.email || "-"}</TableCell>
                      <TableCell>{application.user?.phone || "-"}</TableCell>
                      <TableCell>
                        {application.resume ? (
                          <span className="text-sm text-muted-foreground">
                            {application.resume.title}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            APPLICATION_STATUS_VARIANTS[
                              application.status as keyof typeof APPLICATION_STATUS_VARIANTS
                            ]
                          }
                        >
                          {
                            APPLICATION_STATUS_LABELS[
                              application.status as keyof typeof APPLICATION_STATUS_LABELS
                            ]
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          상세보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
