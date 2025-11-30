"use client";

import { useEffect, useState, useOptimistic, startTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getApplicationDetail, updateApplicationStatus } from "@/actions/application";
import { ResumeDetailView } from "./ResumeDetailView";
import { ApplicationStatusActions } from "./ApplicationStatusActions";
import type { ApplicationDetail, ApplicationStatus } from "@/types";

interface ApplicationDetailDialogProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 상태별 Badge variant 매핑
const STATUS_VARIANTS: Record<
  ApplicationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  reviewed: "outline",
  accepted: "default",
  rejected: "destructive",
};

// 상태별 한글 라벨
const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "대기중",
  reviewed: "검토완료",
  accepted: "합격",
  rejected: "불합격",
};

export function ApplicationDetailDialog({
  applicationId,
  open,
  onOpenChange,
}: ApplicationDetailDialogProps) {
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimistic UI를 위한 상태
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    data?.status,
    (_, newStatus: ApplicationStatus) => newStatus
  );

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const result = await getApplicationDetail(applicationId);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else if (result.data) {
      setData(result.data);
    }

    setLoading(false);
  };

  // 모달 오픈 시 데이터 조회
  useEffect(() => {
    if (open) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, applicationId]);

  // 상태 변경 핸들러
  const handleStatusUpdate = async (newStatus: ApplicationStatus, message?: string) => {
    if (!data) return;

    // Optimistic UI 업데이트 (startTransition 내에서 실행)
    startTransition(() => {
      setOptimisticStatus(newStatus);
    });

    const result = await updateApplicationStatus(applicationId, newStatus, message);

    if (result.error) {
      toast.error(result.error);
      // 에러 시 롤백은 자동으로 됨 (useOptimistic)
    } else {
      toast.success("상태가 변경되었습니다.");
      // 데이터 재조회
      await fetchData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>지원자 상세 정보</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12 space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchData} variant="outline">
              다시 시도
            </Button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* 지원자 기본 정보 */}
            <section className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">지원자 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">이름</h4>
                  <p>{data.user.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">이메일</h4>
                  <p>{data.user.email}</p>
                </div>
                {data.user.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">연락처</h4>
                    <p>{data.user.phone}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">지원일</h4>
                  <p>{new Date(data.created_at || "").toLocaleDateString("ko-KR")}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">현재 상태</h4>
                  <Badge variant={STATUS_VARIANTS[optimisticStatus || data.status]}>
                    {STATUS_LABELS[optimisticStatus || data.status]}
                  </Badge>
                </div>
                {data.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    최종 업데이트: {new Date(data.updated_at).toLocaleString("ko-KR")}
                  </p>
                )}
              </div>
            </section>

            {/* 제출 이력서 */}
            <section className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">제출 이력서</h3>
              <div className="mb-4">
                <h4 className="font-medium">{data.resume.title}</h4>
              </div>
              <ResumeDetailView resume={data.resume} />
            </section>

            {/* 상태 관리 */}
            <section>
              <h3 className="text-lg font-semibold mb-4">상태 관리</h3>
              <ApplicationStatusActions
                applicationId={applicationId}
                currentStatus={optimisticStatus || data.status}
                currentMessage={data.message}
                onUpdate={handleStatusUpdate}
              />
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
