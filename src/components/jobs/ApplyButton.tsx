"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToJob } from "@/actions/application";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import type { Resume } from "@/types";

interface ApplyButtonProps {
  jobId: string;
  application?: { id: string; status: string } | null;
}

export function ApplyButton({ jobId, application }: ApplyButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);

  // 이력서 목록 조회
  useEffect(() => {
    const fetchResumes = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setResumes(data);
      }
    };

    if (isDialogOpen && !application) {
      fetchResumes();
    }
  }, [isDialogOpen, application]);

  const handleApply = () => {
    if (!selectedResumeId) {
      toast.error("이력서를 선택해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await applyToJob(jobId, selectedResumeId);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("지원이 완료되었습니다.");
        setIsDialogOpen(false);
        router.refresh();
      }
    });
  };

  // 이미 지원한 경우
  if (application) {
    return (
      <Button disabled variant="secondary">
        지원 완료
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          지원하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>구인공고 지원</DialogTitle>
          <DialogDescription>지원할 이력서를 선택하세요</DialogDescription>
        </DialogHeader>

        {resumes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">등록된 이력서가 없습니다</p>
            <Button variant="outline" asChild>
              <a href="/resumes/new">이력서 등록하기</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume">이력서 선택</Label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger id="resume">
                  <SelectValue placeholder="이력서를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleApply} disabled={isPending}>
                {isPending ? "지원 중..." : "지원하기"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
