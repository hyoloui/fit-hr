/**
 * 헤더 컴포넌트
 *
 * @description 대시보드 상단 헤더 (사용자 정보, 로그아웃)
 * @note 초안 - 추후 업데이트 예정
 */

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/actions/auth";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface HeaderProps {
  user: User;
  profile: Pick<Profile, "id" | "name" | "role">;
}

export function Header({ user, profile }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("로그아웃되었습니다");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("로그아웃 중 오류가 발생했습니다");
    }
  };

  // 이름의 첫 글자를 아바타로 사용
  const avatarFallback = profile.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* 왼쪽: 페이지 제목 영역 (필요시 추가) */}
        <div className="flex-1" />

        {/* 오른쪽: 사용자 메뉴 */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile.role === "trainer" ? "트레이너" : "센터"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                프로필 설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
