/**
 * 구인공고 상세/수정 페이지
 *
 * @description 구인공고 상세 정보 조회 및 수정
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getMyJobPosting } from "@/actions/job-posting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_CENTER } from "@/constants";
import { JobPostingForm } from "../new/JobPostingForm";
import { JobPostingActions } from "./JobPostingActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface JobPostingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: JobPostingPageProps) {
  const { id } = await params;
  const jobPosting = await getMyJobPosting(id);

  return {
    title: jobPosting ? `${jobPosting.title} - 구인공고 수정` : "구인공고",
    description: "구인공고 상세 정보 및 수정",
  };
}

export default async function JobPostingDetailPage({ params }: JobPostingPageProps) {
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
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== ROLE_CENTER) {
    redirect("/");
  }

  // 3. 구인공고 조회 (센터 소유자만)
  const jobPosting = await getMyJobPosting(id);

  if (!jobPosting) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/center/jobs">
            <Button variant="ghost" size="sm" className="mb-2">
              ← 목록으로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">구인공고 수정</h1>
          <p className="text-muted-foreground mt-2">구인공고 정보를 수정할 수 있습니다</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/center/jobs/${id}/applications`}>
            <Button variant="outline">지원자 목록</Button>
          </Link>
          <JobPostingActions jobPosting={jobPosting} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>공고 정보</CardTitle>
          <CardDescription>구인공고의 정보를 수정하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostingForm jobPosting={jobPosting} />
        </CardContent>
      </Card>
    </div>
  );
}
