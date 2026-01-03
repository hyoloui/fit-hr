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
import type { Profile } from "@/types";
import { UserCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface PublicHeaderProps {
  user: User | null;
  profile: Pick<Profile, "id" | "name" | "role"> | null;
}

export function PublicHeader({ user, profile }: PublicHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("로그아웃되었습니다");
      router.push("/");
      router.refresh();
    } catch (error) {
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
          <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
            구인공고
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
              {profile?.role === "trainer" && (
                <Button variant="ghost" asChild>
                  <Link href="/my-page">마이페이지</Link>
                </Button>
              )}
              {profile?.role === "center" && (
                <Button variant="ghost" asChild>
                  <Link href="/center/jobs">내 공고</Link>
                </Button>
              )}

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
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.role === "trainer" ? "트레이너" : "센터"}
                      </p>
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
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>모바일 메뉴</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  href="/jobs"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  구인공고
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
                    {profile?.role === "trainer" && (
                      <Button variant="outline" asChild>
                        <Link href="/my-page" onClick={() => setMobileMenuOpen(false)}>
                          마이페이지
                        </Link>
                      </Button>
                    )}
                    {profile?.role === "center" && (
                      <Button variant="outline" asChild>
                        <Link href="/center/jobs" onClick={() => setMobileMenuOpen(false)}>
                          내 공고
                        </Link>
                      </Button>
                    )}
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
