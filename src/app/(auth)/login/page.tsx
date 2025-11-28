/**
 * 로그인 페이지
 *
 * @description 이메일과 비밀번호를 통한 로그인
 * @note 초안 - 추후 업데이트 예정
 */

import { LoginForm } from "./login-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    redirect("/");
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>이메일과 비밀번호로 로그인하세요</CardDescription>
      </CardHeader>
      <CardContent>
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
