"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createOffer } from "@/actions/recruitment-offer";
import { getMyJobPostings } from "@/actions/job-posting";
import type { JobPosting } from "@/types";

interface RecruitmentOfferDialogProps {
  trainerId: string;
  trainerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecruitmentOfferDialog({
  trainerId,
  trainerName,
  open,
  onOpenChange,
}: RecruitmentOfferDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const fetchJobPostings = async () => {
      const data = await getMyJobPostings();
      const activeJobs = (data || []).filter((j) => j.is_active);
      setJobPostings(activeJobs);
    };
    fetchJobPostings();
  }, [open]);

  const handleClose = () => {
    setSelectedJobId("");
    setMessage("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!selectedJobId) {
      toast.error("공고를 선택해주세요.");
      return;
    }
    if (!message.trim()) {
      toast.error("메시지를 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await createOffer(trainerId, selectedJobId, message);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("영입 제안을 보냈습니다.");
        handleClose();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>영입 제안</DialogTitle>
          <DialogDescription>{trainerName}님에게 영입 제안을 보냅니다</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>공고 선택</Label>
            {jobPostings.length === 0 ? (
              <p className="text-sm text-muted-foreground">활성화된 공고가 없습니다</p>
            ) : (
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="공고를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {jobPostings.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>메시지</Label>
            <Textarea
              placeholder="영입 제안 메시지를 입력하세요"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || jobPostings.length === 0}
            >
              {isPending ? "전송 중..." : "제안 보내기"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
