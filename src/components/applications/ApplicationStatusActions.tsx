"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ApplicationStatus } from "@/types";

interface ApplicationStatusActionsProps {
  currentStatus: ApplicationStatus;
  currentMessage: string | null;
  onUpdate: (status: ApplicationStatus, message?: string) => Promise<void>;
}

export function ApplicationStatusActions({
  currentStatus,
  currentMessage,
  onUpdate,
}: ApplicationStatusActionsProps) {
  const [message, setMessage] = useState(currentMessage || "");
  const [pending, setPending] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);

  // 상태 변경 핸들러
  const handleUpdate = async (newStatus: ApplicationStatus) => {
    // 불합격 시 메시지 필수 검증
    if (newStatus === "rejected" && !message.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    setPending(true);
    try {
      await onUpdate(newStatus, message);
    } finally {
      setPending(false);
      setConfirmDialogOpen(false);
      setPendingStatus(null);
    }
  };

  // 확인 다이얼로그 표시
  const confirmAndUpdate = (status: ApplicationStatus) => {
    setPendingStatus(status);
    setConfirmDialogOpen(true);
  };

  // 최종 처리 완료 상태
  const isFinalStatus = currentStatus === "accepted" || currentStatus === "rejected";

  return (
    <div className="space-y-4">
      {/* 메시지 입력 */}
      <div>
        <Label htmlFor="message">
          메시지
          {currentStatus === "rejected" && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            currentStatus === "rejected"
              ? "거절 사유를 입력해주세요 (필수)"
              : "지원자에게 전달할 메시지 (선택)"
          }
          rows={4}
          disabled={isFinalStatus || pending}
          className="mt-2"
        />
      </div>

      {/* 상태별 버튼 그룹 */}
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        {currentStatus === "pending" && (
          <>
            <Button
              variant="outline"
              onClick={() => handleUpdate("reviewed")}
              disabled={pending}
            >
              검토완료로 변경
            </Button>
            <Button
              variant="default"
              onClick={() => confirmAndUpdate("accepted")}
              disabled={pending}
            >
              합격 처리
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmAndUpdate("rejected")}
              disabled={pending}
            >
              불합격 처리
            </Button>
          </>
        )}

        {currentStatus === "reviewed" && (
          <>
            <Button
              variant="default"
              onClick={() => confirmAndUpdate("accepted")}
              disabled={pending}
            >
              합격 처리
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmAndUpdate("rejected")}
              disabled={pending}
            >
              불합격 처리
            </Button>
          </>
        )}

        {isFinalStatus && (
          <p className="text-sm text-muted-foreground">
            최종 처리 완료 - 상태 변경 불가
          </p>
        )}
      </div>

      {/* 확인 다이얼로그 */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === "accepted" ? "합격 처리 확인" : "불합격 처리 확인"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "accepted"
                ? "이 지원자를 합격 처리하시겠습니까?"
                : "이 지원자를 불합격 처리하시겠습니까?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* 모달 내 메시지 입력 (불합격 시) */}
          {pendingStatus === "rejected" && (
            <div className="space-y-2">
              <Label htmlFor="modal-message">
                거절 사유 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="modal-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="거절 사유를 입력해주세요 (필수)"
                rows={4}
                disabled={pending}
              />
              {!message.trim() && (
                <p className="text-sm text-destructive">거절 사유를 입력해주세요.</p>
              )}
            </div>
          )}

          {/* 모달 내 메시지 입력 (합격 시) */}
          {pendingStatus === "accepted" && (
            <div className="space-y-2">
              <Label htmlFor="modal-message">메시지 (선택)</Label>
              <Textarea
                id="modal-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="지원자에게 전달할 메시지 (선택)"
                rows={4}
                disabled={pending}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingStatus && handleUpdate(pendingStatus)}
              disabled={pending || (pendingStatus === "rejected" && !message.trim())}
            >
              {pending ? "처리 중..." : "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
