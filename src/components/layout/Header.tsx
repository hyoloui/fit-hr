/**
 * 헤더 컴포넌트
 *
 * @description 대시보드 상단 헤더 (사용자 정보, 로그아웃, 모바일 메뉴)
 * @note 초안 - 추후 업데이트 예정
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/actions/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import {
  Building2,
  Briefcase,
  FileText,
  Heart,
  Home,
  Menu,
  PlusCircle,
  Send,
  UserCircle,
} from "lucide-react";

interface HeaderProps {
  user: User;
  profile: Pick<Profile, "id" | "name" | "role">;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("로그아웃되었습니다");
      router.push("/login");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // TODO: 나중에 에러 로깅에 사용
      // console.error("Logout error:", error);
      toast.error("로그아웃 중 오류가 발생했습니다");
    }
  };

  // 이름의 첫 글자를 아바타로 사용
  const avatarFallback = profile.name?.charAt(0).toUpperCase() || "U";

  // 역할별 메뉴 아이템
  const trainerMenuItems: NavItem[] = [
    { href: "/my-page", label: "마이페이지", icon: Home },
    { href: "/jobs", label: "구인공고", icon: Briefcase },
    { href: "/resumes", label: "내 이력서", icon: FileText },
    { href: "/applications", label: "지원 내역", icon: Send },
    { href: "/likes", label: "좋아요", icon: Heart },
  ];

  const centerMenuItems: NavItem[] = [
    { href: "/center/dashboard", label: "대시보드", icon: Home },
    { href: "/center/profile", label: "센터 정보", icon: Building2 },
    { href: "/center/jobs", label: "구인공고 관리", icon: Briefcase },
    { href: "/center/jobs/new", label: "공고 등록", icon: PlusCircle },
  ];

  const menuItems = profile.role === "trainer" ? trainerMenuItems : centerMenuItems;

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* 왼쪽: 모바일 메뉴 + 로고 */}
        <div className="flex items-center gap-3">
          {/* 모바일 햄버거 메뉴 */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>네비게이션 메뉴</SheetTitle>
                <SheetDescription>주요 메뉴를 선택하세요</SheetDescription>
              </SheetHeader>

              {/* 로고 */}
              <div className="flex h-16 items-center border-b px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircle className="h-6 w-6" />
                  <span>{APP_NAME}</span>
                </Link>
              </div>

              {/* 메뉴 */}
              <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* 하단 사용자 정보 */}
              <div className="border-t p-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {avatarFallback}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === "trainer" ? "트레이너" : "센터"}
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* 모바일 로고 (햄버거 메뉴 옆) */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg md:hidden">
            <UserCircle className="h-6 w-6" />
            <span>{APP_NAME}</span>
          </Link>
        </div>

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
