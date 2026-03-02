"use client";

/**
 * 소셜 로그인 버튼 컴포넌트
 *
 * @description 카카오, 구글 OAuth 로그인 버튼을 제공합니다.
 */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 카카오 아이콘 컴포넌트
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3C6.477 3 2 6.463 2 10.708c0 2.747 1.81 5.148 4.516 6.512-.195.714-.712 2.601-.816 3.004-.131.508.187.5.393.364.162-.107 2.582-1.752 3.632-2.463.74.108 1.505.167 2.275.167 5.523 0 10-3.463 10-7.584C22 6.463 17.523 3 12 3z" />
    </svg>
  );
}

type Provider = "kakao";

interface SocialLoginButtonsProps {
  /** 로딩 상태를 외부에서 제어할 수 있습니다 */
  disabled?: boolean;
}

export function SocialLoginButtons({ disabled = false }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleSocialLogin = async (provider: Provider) => {
    try {
      setLoadingProvider(provider);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message || "소셜 로그인 중 오류가 발생했습니다.");
        setLoadingProvider(null);
      }
    } catch {
      toast.error("소셜 로그인 중 오류가 발생했습니다.");
      setLoadingProvider(null);
    }
  };

  const isLoading = loadingProvider !== null;

  return (
    <div className="flex flex-col gap-3">
      {/* 카카오 로그인 버튼 */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-[#FEE500] text-[#000000] hover:bg-[#FEE500]/90 border-[#FEE500]"
        onClick={() => handleSocialLogin("kakao")}
        disabled={disabled || isLoading}
      >
        {loadingProvider === "kakao" ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            로그인 중...
          </span>
        ) : (
          <>
            <KakaoIcon className="h-5 w-5" />
            카카오로 시작하기
          </>
        )}
      </Button>

      {/* 구글 로그인 버튼 */}
      {/* <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("google")}
        disabled={disabled || isLoading}
      >
        {loadingProvider === "google" ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            로그인 중...
          </span>
        ) : (
          <>
            <GoogleIcon className="h-5 w-5" />
            구글로 시작하기
          </>
        )}
      </Button> */}
    </div>
  );
}
