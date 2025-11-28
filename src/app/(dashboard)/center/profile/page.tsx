/**
 * 센터 정보 페이지
 *
 * @description 센터 정보 등록/수정
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterProfileForm } from "./CenterProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_CENTER } from "@/constants";

export const metadata = {
  title: "센터 정보",
  description: "센터 정보 등록 및 수정",
};

export default async function CenterProfilePage() {
  const supabase = await createClient();

  // 1. 먼저 사용자 정보 조회
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. 프로필과 센터 정보 병렬 조회 (Promise.all로 네트워크 워터폴 최소화)
  const [{ data: profile }, { data: center }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("centers").select("*").eq("owner_id", user.id).single(),
  ]);

  // 센터 계정이 아니면 홈으로 리다이렉트
  if (profile?.role !== ROLE_CENTER) {
    redirect("/");
  }

  const isNewCenter = !center;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">센터 정보</h1>
        <p className="text-muted-foreground mt-2">
          {isNewCenter ? "센터 정보를 등록해주세요" : "센터 정보를 수정할 수 있습니다"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNewCenter ? "센터 등록" : "센터 정보 수정"}</CardTitle>
          <CardDescription>
            {isNewCenter
              ? "구인공고를 올리기 위해서는 먼저 센터 정보를 등록해야 합니다"
              : "등록된 센터 정보를 수정할 수 있습니다"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CenterProfileForm center={center} />
        </CardContent>
      </Card>
    </div>
  );
}
