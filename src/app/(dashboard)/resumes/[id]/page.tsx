import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ResumeForm } from "@/components/resumes/ResumeForm";
import { ResumeActions } from "@/components/resumes/ResumeActions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { REGION_LABELS } from "@/constants/regions";
import type { CareerHistory, Education } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function ResumeDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { mode } = await searchParams;
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

  // 이력서 조회
  const { data: resume, error } = await supabase.from("resumes").select("*").eq("id", id).single();

  if (error || !resume) {
    notFound();
  }

  // 소유권 확인
  if (resume.user_id !== user.id) {
    redirect("/resumes");
  }

  // 수정 모드
  if (mode === "edit") {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/resumes/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">이력서 수정</h1>
            <p className="text-sm text-muted-foreground mt-1">이력서 정보를 수정하세요</p>
          </div>
        </div>

        <ResumeForm mode="edit" resume={resume} />
      </div>
    );
  }

  // 상세 보기 모드
  const careerHistory = (resume.career_history as unknown as CareerHistory[]) || [];
  const education = (resume.education as unknown as Education[]) || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/resumes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{resume.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              등록일: {new Date(resume.created_at || "").toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
        <ResumeActions resumeId={id} />
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">희망 업종</h4>
            <p>{resume.categories?.join(", ")}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">희망 지역</h4>
            <p>{REGION_LABELS[resume.region as keyof typeof REGION_LABELS]}</p>
          </div>
          {resume.experience_level && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">경력</h4>
              <p>{resume.experience_level}</p>
            </div>
          )}
          {resume.gender && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">성별</h4>
              <p>
                {resume.gender === "male"
                  ? "남성"
                  : resume.gender === "female"
                    ? "여성"
                    : resume.gender}
              </p>
            </div>
          )}
          {resume.birth_year && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">출생년도</h4>
              <p>{resume.birth_year}년</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 자기소개 */}
      {resume.introduction && (
        <Card>
          <CardHeader>
            <CardTitle>자기소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{resume.introduction}</p>
          </CardContent>
        </Card>
      )}

      {/* 경력 */}
      {careerHistory && careerHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>경력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {careerHistory.map((career, index) => (
              <div key={index} className="pb-6 border-b last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{career.company}</h4>
                    <p className="text-sm text-muted-foreground">{career.position}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{career.period}</p>
                </div>
                {career.description && (
                  <p className="text-sm mt-2 whitespace-pre-wrap">{career.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 학력 */}
      {education && education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>학력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="pb-4 border-b last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{edu.school}</h4>
                    <p className="text-sm text-muted-foreground">{edu.major}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 자격증 */}
      {resume.certifications && resume.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>자격증</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {Array.isArray(resume.certifications)
                ? resume.certifications.join(", ")
                : resume.certifications}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
