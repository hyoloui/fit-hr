"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, checkLiked } from "@/actions/like";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  jobId: string;
  userId?: string;
  initialLiked?: boolean;
}

export function LikeButton({ jobId, initialLiked = false }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const queryKey = ["like", jobId];

  // 좋아요 상태 조회 (마운트 시 서버에서 실제 값 fetch, 초기값은 initialLiked)
  const { data: liked = initialLiked } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await checkLiked(jobId);
      return result.liked;
    },
    placeholderData: initialLiked,
  });

  // 좋아요 토글 (Optimistic Update)
  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleLike(jobId),
    onMutate: async () => {
      // 진행 중인 refetch 취소 (race condition 방지)
      await queryClient.cancelQueries({ queryKey });
      // 현재 캐시 스냅샷 저장
      const previousLiked = queryClient.getQueryData<boolean>(queryKey);
      // 즉시 UI 반전
      queryClient.setQueryData(queryKey, !previousLiked);
      return { previousLiked };
    },
    onError: (_err, _vars, context) => {
      // 실패 시 롤백
      queryClient.setQueryData(queryKey, context?.previousLiked);
      toast.error("좋아요 처리에 실패했습니다.");
    },
    onSuccess: (result) => {
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.liked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.");
      }
    },
    onSettled: () => {
      // 서버 실제값으로 최종 동기화
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mutate();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={cn("hover:bg-background/80", liked && "text-red-500 hover:text-red-600")}
    >
      <Heart className={cn("h-5 w-5", liked && "fill-current")} />
    </Button>
  );
}
