/**
 * 회원가입 페이지
 *
 * @description 이메일, 비밀번호, 이름 입력 또는 소셜 로그인을 통한 회원가입
 */

import { SignupForm } from "./signup-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

export const metadata = {
  title: "회원가입",
  description: "Fit HR 회원가입",
};

export default async function SignupPage() {
  // 이미 로그인된 사용자는 홈으로 리다이렉트
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>계정을 생성하여 Fit HR을 시작하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 소셜 로그인 */}
        <SocialLoginButtons />

        {/* 또는 구분선 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        {/* 이메일 회원가입 */}
        <SignupForm />

        <div className="mt-4 text-center text-sm">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            로그인
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
