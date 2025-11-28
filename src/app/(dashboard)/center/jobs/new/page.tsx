/**
 * 구인공고 등록 페이지
 *
 * @description 새로운 구인공고 작성
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobPostingForm } from "./job-posting-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLE_CENTER } from "@/constants";
import Link from "next/link";

export const metadata = {
  title: "구인공고 등록",
  description: "새로운 구인공고 등록",
};

export default async function NewJobPostingPage() {
  const supabase = await createClient();

  // 1. 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. 프로필과 센터 정보 병렬 조회
  const [{ data: profile }, { data: center }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("centers").select("*").eq("owner_id", user.id).single(),
  ]);

  // 센터 계정이 아니면 홈으로 리다이렉트
  if (profile?.role !== ROLE_CENTER) {
    redirect("/");
  }

  // 센터 정보가 없으면 센터 등록 페이지로 리다이렉트
  if (!center) {
    redirect("/center/profile");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/center/jobs">
          <Button variant="ghost" size="sm" className="mb-2">
            ← 목록으로
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">구인공고 등록</h1>
        <p className="text-muted-foreground mt-2">새로운 구인공고를 등록하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>공고 작성</CardTitle>
          <CardDescription>구인공고의 상세 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostingForm />
        </CardContent>
      </Card>
    </div>
  );
}
