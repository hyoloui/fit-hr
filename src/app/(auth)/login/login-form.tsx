"use client";

/**
 * 로그인 폼 컴포넌트
 *
 * @description 이메일, 비밀번호 입력 폼
 * @note 초안 - 추후 업데이트 예정
 */

import { useActionState, useEffect } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [state, formAction, pending] = useActionState(login, null);

  // 로그인 성공 시 리다이렉트
  useEffect(() => {
    if (state?.success) {
      toast.success("로그인 성공!");

      let redirectPath = "/jobs"; // 기본값

      if (returnUrl) {
        redirectPath = returnUrl;
      } else if (state.role === "center") {
        redirectPath = "/center/jobs";
      }

      router.push(redirectPath);
      router.refresh();
    }
  }, [state?.success, state?.role, router, returnUrl]);

  return (
    <form action={formAction} className="space-y-4">
      {/* 이메일 */}
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@example.com"
          required
          disabled={pending}
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          required
          disabled={pending}
        />
        {state?.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        )}
      </div>

      {/* 전체 에러 메시지 */}
      {state?.errors?._form && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm text-destructive">{state.errors._form[0]}</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
