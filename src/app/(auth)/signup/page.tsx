/**
 * 회원가입 페이지
 *
 * @description 이메일, 비밀번호, 이름, 역할(trainer/center) 선택을 통한 회원가입
 * @note 초안 - 추후 업데이트 예정
 */

import { SignupForm } from "./signup-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "회원가입",
  description: "Fit HR 회원가입",
};

export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>계정을 생성하여 Fit HR을 시작하세요</CardDescription>
      </CardHeader>
      <CardContent>
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
