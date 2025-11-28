/**
 * 인증 페이지 레이아웃
 *
 * @description 로그인, 회원가입 등 인증 관련 페이지의 공통 레이아웃
 * @note 초안 - 추후 업데이트 예정
 */

import { APP_NAME } from "@/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="mt-2 text-sm text-muted-foreground">피트니스 업계 전문 채용 플랫폼</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
