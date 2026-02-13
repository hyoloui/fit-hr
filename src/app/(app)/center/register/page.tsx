/**
 * 센터 등록 페이지
 *
 * @description 새로운 센터를 등록하는 페이지. 이미 센터를 소유한 경우 센터 관리로 리다이렉트
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CenterProfileForm } from "../(managed)/profile/CenterProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "센터 등록",
  description: "새로운 센터를 등록하세요",
};

export default async function CenterRegisterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 이미 센터를 소유한 경우 센터 관리로 리다이렉트
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (center) {
    redirect("/center/profile");
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-7 w-7" />
          센터 등록
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          센터 정보를 등록하면 구인공고를 올리고 트레이너를 채용할 수 있습니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>센터 정보 입력</CardTitle>
          <CardDescription>센터의 기본 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <CenterProfileForm center={null} />
        </CardContent>
      </Card>
    </div>
  );
}
