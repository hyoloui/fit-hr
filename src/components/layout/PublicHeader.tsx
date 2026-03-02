"use client";

import Link from "next/link";
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
import { APP_NAME } from "@/constants";
import type { User } from "@supabase/supabase-js";
import { UserCircle, Menu, Map, Briefcase } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface PublicHeaderProps {
  user: User | null;
  profile: { id: string; name: string } | null;
}

export function PublicHeader({ user, profile }: PublicHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success("로그아웃되었습니다");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error || "로그아웃 중 오류가 발생했습니다");
      }
    } catch (error) {
      console.error("PublicHeader handleLogout error:", error);
      toast.error("로그아웃 중 오류가 발생했습니다");
    }
  };

  const avatarFallback = profile?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <UserCircle className="h-6 w-6" />
          <span>{APP_NAME}</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            구인공고
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
          >
            <Map className="h-4 w-4" />
            지도
          </Link>
        </nav>

        {/* 우측: 로그인 상태별 */}
        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">대시보드</Link>
              </Button>

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
                      <p className="text-sm font-medium leading-none">{profile?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  href="/jobs"
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase className="h-4 w-4" />
                  구인공고
                </Link>
                <Link
                  href="/map"
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Map className="h-4 w-4" />
                  지도
                </Link>

                {!user ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        로그인
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        회원가입
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        대시보드
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      로그아웃
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
