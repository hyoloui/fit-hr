/**
 * 헤더 컴포넌트
 *
 * @description 대시보드 상단 헤더 (사용자 정보, 로그아웃)
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

interface HeaderProps {
  user: User;
  profile: { id: string; name: string; email: string };
}

export function Header({ user, profile }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success("로그아웃되었습니다");
        router.push("/login");
        router.refresh();
      } else {
        toast.error(result.error || "로그아웃 중 오류가 발생했습니다");
      }
    } catch (error) {
      console.error("Header handleLogout error:", error);
      toast.error("로그아웃 중 오류가 발생했습니다");
    }
  };

  const avatarFallback = profile.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-end px-4 md:px-6">
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
                </div>
              </DropdownMenuLabel>
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
