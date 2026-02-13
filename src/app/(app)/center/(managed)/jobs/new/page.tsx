/**
 * 구인공고 등록 페이지
 *
 * @description 새로운 구인공고 작성
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobPostingForm } from "./JobPostingForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // 2. 센터 정보 조회 (레이아웃에서 소유 여부 확인됨)
  const { data: center } = await supabase
    .from("centers")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  // 센터 정보가 없으면 센터 등록 페이지로 리다이렉트
  if (!center) {
    redirect("/center/register");
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Link href="/center/jobs">
          <Button variant="ghost" size="sm" className="mb-2">
            ← 목록으로
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">구인공고 등록</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">새로운 구인공고를 등록하세요</p>
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
