"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelApplication } from "@/actions/application";
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
import { X } from "lucide-react";
import { toast } from "sonner";

interface CancelApplicationButtonProps {
  applicationId: string;
}

export function CancelApplicationButton({ applicationId }: CancelApplicationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelApplication(applicationId);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("지원이 취소되었습니다.");
        setIsDialogOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          지원 취소
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>지원 취소</DialogTitle>
          <DialogDescription>
            정말로 지원을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
            {isPending ? "취소 중..." : "지원 취소"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
