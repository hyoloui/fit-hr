"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createReviewSchema = z.object({
  trainerId: z.string().uuid(),
  rating: z.number().min(1.0).max(5.0),
  content: z.string().min(1, "리뷰 내용을 입력해주세요"),
});

/**
 * 트레이너 리뷰 작성
 */
export async function createReview(
  trainerId: string,
  rating: number,
  content: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const validated = createReviewSchema.safeParse({ trainerId, rating, content });
  if (!validated.success) {
    return { error: "잘못된 입력입니다. 평점은 1.0~5.0 사이여야 합니다." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 센터 소유 확인
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!center) {
    return { error: "센터 정보가 필요합니다." };
  }

  const { error } = await supabase.from("trainer_reviews").insert({
    center_id: center.id,
    trainer_id: trainerId,
    rating: validated.data.rating,
    content: validated.data.content,
  });

  if (error) {
    console.error("리뷰 작성 실패:", error);
    return { error: "리뷰 작성에 실패했습니다." };
  }

  revalidatePath("/center/talent-pool");
  return { success: true };
}
