import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 (중요: getUser()를 호출해야 쿠키가 갱신됨)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 루트 경로: 로그인된 사용자는 대시보드로 리다이렉트
  if (pathname === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 로그인/회원가입 페이지: 이미 로그인된 사용자는 대시보드로 리다이렉트
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const url = request.nextUrl.clone();
    const returnUrl = request.nextUrl.searchParams.get("returnUrl");
    url.pathname = returnUrl || "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};
