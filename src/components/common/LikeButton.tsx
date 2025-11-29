"use client";

import { useState, useTransition, useEffect } from "react";
import { toggleLike, checkLiked } from "@/actions/like";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  jobId: string;
  userId: string;
  initialLiked?: boolean;
}

export function LikeButton({ jobId, userId, initialLiked = false }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  // 초기 좋아요 상태 확인
  useEffect(() => {
    const fetchLikedStatus = async () => {
      const result = await checkLiked(jobId);
      setLiked(result.liked);
    };
    fetchLikedStatus();
  }, [jobId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleLike(jobId);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setLiked(result.liked);
        toast.success(result.liked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "hover:bg-background/80",
        liked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart className={cn("h-5 w-5", liked && "fill-current")} />
    </Button>
  );
}
