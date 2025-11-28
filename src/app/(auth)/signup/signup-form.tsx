"use client";

/**
 * 회원가입 폼 컴포넌트
 *
 * @description 역할 선택, 이메일, 비밀번호, 이름 입력 폼
 * @note 초안 - 추후 업데이트 예정
 */

import { useActionState, useEffect, useState } from "react";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signup, null);
  const [showDialog, setShowDialog] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 이미 로그인된 사용자 확인
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setShowDialog(true);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // 회원가입 결과 처리
  useEffect(() => {
    if (state?.success) {
      // 즉시 로그인 가능한 경우
      toast.success("회원가입이 완료되었습니다!");
      router.push("/login");
    } else if (state?.needsEmailConfirmation) {
      // 이메일 확인이 필요한 경우
      toast.info("회원가입이 완료되었습니다! 이메일을 확인한 후 로그인해주세요.", {
        duration: 5000,
      });
    }
  }, [state?.success, state?.needsEmailConfirmation, router]);

  // 다이얼로그 취소 시 뒤로 가기
  const handleCancel = () => {
    setShowDialog(false);
    router.back();
  };

  // 다이얼로그 확인 시 계속 진행
  const handleContinue = () => {
    setShowDialog(false);
  };

  // 인증 확인 중일 때 로딩 표시
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      {/* 이미 로그인된 사용자 확인 다이얼로그 */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이미 로그인되어 있습니다</AlertDialogTitle>
            <AlertDialogDescription>
              현재 계정으로 로그인되어 있습니다. 새로운 계정을 만드시겠습니까?
              <br />
              <br />새 계정을 만들려면 먼저 로그아웃해야 합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>취소하고 돌아가기</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}>계속 진행</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form action={formAction} className="space-y-4">
        {/* 역할 선택 */}
        <div className="space-y-2">
          <Label htmlFor="role">역할 *</Label>
          <Select name="role" required>
            <SelectTrigger>
              <SelectValue placeholder="역할을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trainer">트레이너 (구직자)</SelectItem>
              <SelectItem value="center">센터 (구인자)</SelectItem>
            </SelectContent>
          </Select>
          {state?.errors?.role && (
            <p className="text-sm text-destructive">{state.errors.role[0]}</p>
          )}
        </div>

        {/* 이름 */}
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            required
            disabled={pending}
          />
          {state?.errors?.name && (
            <p className="text-sm text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        {/* 이메일 */}
        <div className="space-y-2">
          <Label htmlFor="email">이메일 *</Label>
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
          <Label htmlFor="password">비밀번호 *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="최소 6자 이상"
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
          {pending ? "처리 중..." : "회원가입"}
        </Button>
      </form>
    </>
  );
}
