/**
 * OAuth Callback 라우트
 *
 * @description Supabase Auth의 OAuth 인증 후 콜백 처리
 * - 인증 성공 시 /dashboard로 리다이렉트
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // next 파라미터가 있으면 해당 경로로 이동 (이메일 로그인 등)
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // 기본: 대시보드로 이동
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login`);
}
