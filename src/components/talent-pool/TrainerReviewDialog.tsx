"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { createReview } from "@/actions/trainer-review";
import { cn } from "@/lib/utils";

interface TrainerReviewDialogProps {
  trainerId: string;
  trainerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrainerReviewDialog({
  trainerId,
  trainerName,
  open,
  onOpenChange,
}: TrainerReviewDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRating(0);
      setHoverRating(0);
      setContent("");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("평점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("리뷰 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await createReview(trainerId, rating, content);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("리뷰가 등록되었습니다.");
        handleOpenChange(false);
      }
    });
  };

  const stars = [1, 2, 3, 4, 5];
  const displayRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>평점 남기기</DialogTitle>
          <DialogDescription>{trainerName}님에 대한 평점과 리뷰를 남겨주세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>평점</Label>
            <div className="flex items-center gap-1">
              {stars.map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">{rating}.0</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>리뷰</Label>
            <Textarea
              placeholder="리뷰 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "등록 중..." : "리뷰 등록"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
