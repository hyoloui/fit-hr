/**
 * 대시보드 레이아웃
 *
 * @description 인증이 필요한 페이지들의 공통 레이아웃
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 프로필 정보 조회 (역할 확인)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <Sidebar user={user} profile={profile} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col">
        {/* 헤더 */}
        <Header user={user} profile={profile} />

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 pt-16 md:p-6">{children}</main>
      </div>
    </div>
  );
}
