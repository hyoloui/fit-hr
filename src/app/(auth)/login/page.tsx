/**
 * 로그인 페이지
 *
 * @description 이메일과 비밀번호 또는 소셜 로그인을 통한 로그인
 */

import { LoginForm } from "./login-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

export const metadata = {
  title: "로그인",
  description: "Fit HR 로그인",
};

export default async function LoginPage() {
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
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>이메일과 비밀번호로 로그인하세요</CardDescription>
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

        {/* 이메일 로그인 */}
        <LoginForm />

        <div className="mt-4 text-center text-sm">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            회원가입
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
