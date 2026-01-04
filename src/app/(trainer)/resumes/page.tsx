import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MapPin, Briefcase } from "lucide-react";
import type { Resume } from "@/types";

export default async function ResumesPage() {
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

  // 이력서 목록 조회
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 이력서</h1>
          <p className="text-sm text-muted-foreground mt-1">
            이력서를 등록하고 구인공고에 지원하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/resumes/new">
            <Plus className="mr-2 h-4 w-4" />
            이력서 등록
          </Link>
        </Button>
      </div>

      {!resumes || resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">등록된 이력서가 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-4">
              첫 이력서를 작성하여 구인공고에 지원해보세요
            </p>
            <Button asChild>
              <Link href="/resumes/new">
                <Plus className="mr-2 h-4 w-4" />
                이력서 등록
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const careerHistory = resume.career_history as Array<{
    company: string;
    position: string;
    period: string;
    description?: string;
  }>;

  const totalYears = careerHistory?.length || 0;

  return (
    <Link href={`/resumes/${resume.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="line-clamp-1">{resume.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {resume.categories?.join(", ")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{resume.region}</span>
          </div>

          {resume.experience_level && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{resume.experience_level}</span>
            </div>
          )}

          {totalYears > 0 && (
            <div>
              <Badge variant="secondary">{totalYears}개 경력</Badge>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {new Date(resume.created_at || "").toLocaleDateString("ko-KR")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
