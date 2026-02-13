/**
 * 센터 관리 영역 레이아웃
 *
 * @description 센터 소유 여부 일괄 체크. 미소유 시 센터 등록 페이지로 리다이렉트
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CenterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 센터 소유 여부 확인
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  // 센터 미소유 시 등록 페이지로 리다이렉트 (register 페이지 자체는 제외)
  if (!center) {
    redirect("/center/register");
  }

  return <>{children}</>;
}
