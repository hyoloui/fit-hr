import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Calendar, ExternalLink } from "lucide-react";
import { CancelApplicationButton } from "@/components/applications/CancelApplicationButton";
import { REGION_LABELS } from "@/constants/regions";

export default async function ApplicationsPage() {
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

  // 지원 내역 조회
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      job_posting:job_postings (
        id,
        title,
        region,
        is_active,
        center:centers (
          name
        )
      ),
      resume:resumes (
        id,
        title
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">지원 내역</h1>
        <p className="text-sm text-muted-foreground mt-1">내가 지원한 구인공고 목록입니다</p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">지원 내역이 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-4">
              구인공고를 찾아 지원해보세요
            </p>
            <Button asChild>
              <Link href="/jobs">구인공고 보기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application: any) => {
            const job = application.job_posting;
            const center = job?.center;
            const resume = application.resume;

            const statusLabel =
              application.status === "pending"
                ? "대기중"
                : application.status === "reviewed"
                  ? "검토완료"
                  : application.status === "accepted"
                    ? "합격"
                    : "불합격";

            const statusVariant =
              application.status === "accepted"
                ? "default"
                : application.status === "rejected"
                  ? "destructive"
                  : "secondary";

            return (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="line-clamp-1">{job?.title}</CardTitle>
                        {!job?.is_active && (
                          <Badge variant="outline" className="text-xs">
                            마감
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{center?.name}</CardDescription>
                    </div>
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{REGION_LABELS[job?.region as keyof typeof REGION_LABELS]}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>지원 이력서: {resume?.title}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      지원일: {new Date(application.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/jobs/${job?.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        공고 보기
                      </Link>
                    </Button>

                    {application.status === "pending" && (
                      <CancelApplicationButton applicationId={application.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
