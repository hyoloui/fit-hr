/**
 * 사이드바 컴포넌트
 *
 * @description 통합 사이드바 (메인 + 트레이너 + 센터 섹션)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Building2,
  Briefcase,
  FileText,
  Heart,
  Home,
  Map,
  Send,
  UserCircle,
  Menu,
  Users,
  Inbox,
} from "lucide-react";

interface SidebarProps {
  profile: { id: string; name: string; email: string };
  hasCenter: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ profile, hasCenter }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 메인 메뉴
  const mainSection: NavSection = {
    title: "메인",
    items: [
      { href: "/dashboard", label: "대시보드", icon: Home },
      { href: "/jobs", label: "구인공고", icon: Briefcase },
      { href: "/map", label: "지도", icon: Map },
    ],
  };

  // 트레이너 메뉴
  const trainerSection: NavSection = {
    title: "트레이너",
    items: [
      { href: "/resumes", label: "내 이력서", icon: FileText },
      { href: "/applications", label: "지원 내역", icon: Send },
      { href: "/offers", label: "받은 제안", icon: Inbox },
      { href: "/likes", label: "좋아요", icon: Heart },
    ],
  };

  // 센터 메뉴 (소유 여부에 따라 다름)
  const centerSection: NavSection = {
    title: "센터 관리",
    items: hasCenter
      ? [
          { href: "/center/profile", label: "센터 정보", icon: Building2 },
          { href: "/center/jobs", label: "공고 관리", icon: Briefcase },
          { href: "/center/talent-pool", label: "인재풀", icon: Users },
        ]
      : [{ href: "/center/register", label: "센터 등록하기", icon: Building2 }],
  };

  const sections = [mainSection, trainerSection, centerSection];

  // 메뉴 아이템 렌더링
  const renderSections = (onItemClick?: () => void) => (
    <>
      {sections.map((section, sectionIndex) => (
        <div key={section.title}>
          {sectionIndex > 0 && <div className="my-3 border-t" />}
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </p>
          {section.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
        </div>
      ))}
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
              <SheetHeader className="flex h-16 items-center border-b px-6">
                <SheetTitle asChild>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 font-bold text-lg"
                  >
                    <UserCircle className="h-6 w-6" />
                    <span>{APP_NAME}</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex-1 space-y-1 p-4">{renderSections(() => setOpen(false))}</nav>

              <div className="border-t p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{profile.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card shrink-0">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <UserCircle className="h-6 w-6" />
            <span>{APP_NAME}</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">{renderSections()}</nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{profile.name}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
