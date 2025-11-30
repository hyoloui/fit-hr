"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 좋아요 토글
 */
export async function toggleLike(jobId: string) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 기존 좋아요 확인
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_posting_id", jobId)
    .single();

  if (existingLike) {
    // 좋아요 취소
    const { error } = await supabase.from("likes").delete().eq("id", existingLike.id);

    if (error) {
      console.error("좋아요 취소 실패:", error);
      return { error: "좋아요 취소에 실패했습니다." };
    }

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/likes");
    return { success: true, liked: false };
  } else {
    // 좋아요 추가
    const { error } = await supabase.from("likes").insert({
      user_id: user.id,
      job_posting_id: jobId,
    });

    if (error) {
      console.error("좋아요 추가 실패:", error);
      return { error: "좋아요 추가에 실패했습니다." };
    }

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/likes");
    return { success: true, liked: true };
  }
}

/**
 * 좋아요한 공고 목록 조회
 */
export async function getLikedJobs() {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 좋아요한 공고 조회
  const { data: likes, error } = await supabase
    .from("likes")
    .select(
      `
      id,
      created_at,
      job_posting_id,
      job_postings (
        id,
        title,
        region,
        categories,
        employment_type,
        experience_level,
        gender,
        salary_type,
        salary_min,
        salary_max,
        created_at,
        center:centers (
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("좋아요 목록 조회 실패:", error);
    return { error: "좋아요 목록 조회에 실패했습니다." };
  }

  return { data: likes };
}

/**
 * 특정 공고의 좋아요 여부 확인
 */
export async function checkLiked(jobId: string) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { liked: false };
  }

  // 좋아요 여부 확인
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_posting_id", jobId)
    .single();

  return { liked: !!data };
}
