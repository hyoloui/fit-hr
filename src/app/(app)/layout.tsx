/**
 * 통합 앱 레이아웃
 *
 * @description 인증된 사용자의 공통 레이아웃 (인증 체크 + 센터 소유 여부 조회)
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 프로필 정보 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // 센터 소유 여부 확인
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  const hasCenter = !!center;

  return (
    <div className="flex h-svh overflow-hidden">
      {/* 사이드바 */}
      <Sidebar profile={profile} hasCenter={hasCenter} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 헤더 */}
        <Header user={user} profile={profile} />

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 pt-16 md:p-6">{children}</main>
      </div>
    </div>
  );
}
