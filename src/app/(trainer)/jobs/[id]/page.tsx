import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, User, DollarSign, Calendar } from "lucide-react";
import { LikeButton } from "@/components/common/LikeButton";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { REGION_LABELS } from "@/constants/regions";
import { JOB_CATEGORY_LABELS } from "@/constants/job-categories";
import { EMPLOYMENT_TYPE_LABELS } from "@/constants/employment-types";
import { EXPERIENCE_LEVEL_LABELS } from "@/constants/experience-levels";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 레이아웃에서 이미 인증 및 역할 체크 완료
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 구인공고 상세 조회
  const { data: job, error } = await supabase
    .from("job_postings_with_details")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  // 지원 여부 확인
  const { data: application } = await supabase
    .from("applications")
    .select("id, status")
    .eq("job_posting_id", id)
    .eq("user_id", user!.id)
    .single();

  const categories = job.categories as string[];
  const genderLabel = job.gender === "male" ? "남성" : job.gender === "female" ? "여성" : "무관";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{job.center_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <LikeButton jobId={id} userId={user!.id} />
          <ApplyButton
            jobId={id}
            application={
              application
                ? {
                    id: application.id,
                    status: application.status || "pending",
                  }
                : null
            }
          />
        </div>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">지역</h4>
              <p>{REGION_LABELS[job.region as keyof typeof REGION_LABELS]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">업종</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {JOB_CATEGORY_LABELS[category as keyof typeof JOB_CATEGORY_LABELS]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">고용형태</h4>
              <p>
                {EMPLOYMENT_TYPE_LABELS[job.employment_type as keyof typeof EMPLOYMENT_TYPE_LABELS]}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">경력</h4>
              <p>
                {
                  EXPERIENCE_LEVEL_LABELS[
                    job.experience_level as keyof typeof EXPERIENCE_LEVEL_LABELS
                  ]
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">선호 성별</h4>
              <p>{genderLabel}</p>
            </div>
          </div>

          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">급여</h4>
                <p>
                  {job.salary_type === "monthly" && job.salary_min && job.salary_max
                    ? `월 ${job.salary_min.toLocaleString()}~${job.salary_max.toLocaleString()}만원`
                    : job.salary_type === "hourly" && job.salary_min
                      ? `시급 ${job.salary_min.toLocaleString()}원`
                      : job.salary_type === "negotiable"
                        ? "협의"
                        : ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">등록일</h4>
              <p>{job.created_at ? new Date(job.created_at).toLocaleDateString("ko-KR") : "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 설명 */}
      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle>상세 설명</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {/* 센터 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>센터 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">센터명</h4>
            <p>{job.center_name}</p>
          </div>
        </CardContent>
      </Card>

      {/* 지원 상태 표시 */}
      {application && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">지원 완료</h4>
                <p className="text-sm text-muted-foreground">
                  현재 상태:{" "}
                  {application.status === "pending"
                    ? "대기중"
                    : application.status === "reviewed"
                      ? "검토완료"
                      : application.status === "accepted"
                        ? "합격"
                        : "불합격"}
                </p>
              </div>
              <Badge
                variant={
                  application.status === "accepted"
                    ? "default"
                    : application.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {application.status === "pending"
                  ? "대기중"
                  : application.status === "reviewed"
                    ? "검토완료"
                    : application.status === "accepted"
                      ? "합격"
                      : "불합격"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
