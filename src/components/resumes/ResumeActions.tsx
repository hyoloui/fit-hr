"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteResume } from "@/actions/resume";
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
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ResumeActionsProps {
  resumeId: string;
}

export function ResumeActions({ resumeId }: ResumeActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteResume(resumeId);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("이력서가 삭제되었습니다.");
        router.push("/resumes");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href={`/resumes/${resumeId}?mode=edit`}>
          <Edit className="h-4 w-4 mr-2" />
          수정
        </Link>
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이력서 삭제</DialogTitle>
            <DialogDescription>
              정말로 이력서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
