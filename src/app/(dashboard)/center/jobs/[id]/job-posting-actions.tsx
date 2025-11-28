"use client";

/**
 * 구인공고 액션 컴포넌트
 *
 * @description 구인공고 활성화/비활성화, 삭제 기능
 * @note 초안 - 추후 업데이트 예정
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleJobPostingActive, deleteJobPosting } from "@/actions/job-posting";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { JobPosting } from "@/types";

interface JobPostingActionsProps {
  jobPosting: JobPosting;
}

export function JobPostingActions({ jobPosting }: JobPostingActionsProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const result = await toggleJobPostingActive(jobPosting.id, !jobPosting.is_active);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          jobPosting.is_active ? "구인공고가 비활성화되었습니다" : "구인공고가 활성화되었습니다"
        );
        router.refresh();
      }
    } catch (error) {
      toast.error("상태 변경 중 오류가 발생했습니다");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteJobPosting(jobPosting.id);

      if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
      } else {
        toast.success("구인공고가 삭제되었습니다");
        router.push("/center/jobs");
      }
    } catch (error) {
      toast.error("삭제 중 오류가 발생했습니다");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={jobPosting.is_active ? "outline" : "default"}
        onClick={handleToggleActive}
        disabled={isToggling || isDeleting}
      >
        {isToggling
          ? "처리 중..."
          : jobPosting.is_active
            ? "비활성화"
            : "활성화"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isToggling || isDeleting}>
            삭제
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>구인공고를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 구인공고와 관련된 모든 지원 내역이 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
