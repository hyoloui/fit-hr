import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ResumeForm } from "@/components/resumes/ResumeForm";

export default async function NewResumePage() {
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

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/resumes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">이력서 등록</h1>
          <p className="text-sm text-muted-foreground mt-1">
            이력서 정보를 입력하여 등록하세요
          </p>
        </div>
      </div>

      <ResumeForm mode="create" />
    </div>
  );
}
