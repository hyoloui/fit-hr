"use client";

import { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { JobCard } from "@/components/jobs/JobCard";
import type { JobPostingWithDetails } from "@/types";

interface JobMapPanelProps {
  jobs: JobPostingWithDetails[];
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userId?: string;
}

function PanelContent({
  jobs,
  onClose,
  isAuthenticated,
  userId,
}: Omit<JobMapPanelProps, "isOpen">) {
  const centerName = jobs[0]?.center_name ?? "센터";
  const address = jobs[0]?.address ?? "";

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2 p-4 border-b shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold line-clamp-1">{centerName}</h2>
          {address && (
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{address}</span>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">공고 {jobs.length}건</p>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-1" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </Button>
      </div>

      {/* 공고 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isAuthenticated={isAuthenticated}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function JobMapPanel({ jobs, isOpen, onClose, isAuthenticated, userId }: JobMapPanelProps) {
  // SheetOverlay는 포털로 document.body에 렌더링되므로 lg:hidden이 적용되지 않음.
  // 데스크톱에서 Sheet를 열지 않도록 isDesktop 상태로 제어.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (jobs.length === 0) return null;

  return (
    <>
      {/* 모바일: Sheet (하단 슬라이드) — 데스크톱에서는 open=false로 오버레이 방지 */}
      <Sheet open={isOpen && !isDesktop} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[70vh] p-0 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>공고 목록</SheetTitle>
          </SheetHeader>
          <PanelContent
            jobs={jobs}
            onClose={onClose}
            isAuthenticated={isAuthenticated}
            userId={userId}
          />
        </SheetContent>
      </Sheet>

      {/* 데스크톱: absolute 사이드패널 */}
      {isOpen && (
        <div className="absolute top-0 left-0 w-[380px] h-full z-20 bg-background border-r shadow-lg hidden lg:flex flex-col">
          <PanelContent
            jobs={jobs}
            onClose={onClose}
            isAuthenticated={isAuthenticated}
            userId={userId}
          />
        </div>
      )}
    </>
  );
}
