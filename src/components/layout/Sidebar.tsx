/**
 * 사이드바 컴포넌트
 *
 * @description 대시보드 사이드바 (역할별 메뉴)
 * @note 초안 - 추후 업데이트 예정
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import {
  Building2,
  Briefcase,
  FileText,
  Heart,
  Home,
  PlusCircle,
  Send,
  UserCircle,
  Menu,
} from "lucide-react";

interface SidebarProps {
  user: User;
  profile: Pick<Profile, "id" | "name" | "role">;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 역할별 메뉴 아이템
  const trainerMenuItems: NavItem[] = [
    { href: "/", label: "홈", icon: Home },
    { href: "/jobs", label: "구인공고", icon: Briefcase },
    { href: "/resumes", label: "내 이력서", icon: FileText },
    { href: "/applications", label: "지원 내역", icon: Send },
    { href: "/likes", label: "좋아요", icon: Heart },
  ];

  const centerMenuItems: NavItem[] = [
    { href: "/", label: "홈", icon: Home },
    { href: "/center/profile", label: "센터 정보", icon: Building2 },
    { href: "/center/jobs", label: "구인공고 관리", icon: Briefcase },
    { href: "/center/jobs/new", label: "공고 등록", icon: PlusCircle },
  ];

  const menuItems = profile.role === "trainer" ? trainerMenuItems : centerMenuItems;

  // 메뉴 아이템 렌더링 (재사용)
  const renderMenuItems = (onItemClick?: () => void) => (
    <>
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
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
    </>
  );

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              {/* 로고 */}
              <SheetHeader className="flex h-16 items-center border-b px-6">
                <SheetTitle asChild>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 font-bold text-lg"
                  >
                    <UserCircle className="h-6 w-6" />
                    <span>{APP_NAME}</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* 메뉴 */}
              <nav className="flex-1 space-y-1 p-4">{renderMenuItems(() => setOpen(false))}</nav>

              {/* 하단 사용자 정보 */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === "trainer" ? "트레이너" : "센터"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        {/* 로고 */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <UserCircle className="h-6 w-6" />
            <span>{APP_NAME}</span>
          </Link>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 space-y-1 p-4">{renderMenuItems()}</nav>

        {/* 하단 사용자 정보 */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">
                {profile.role === "trainer" ? "트레이너" : "센터"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
