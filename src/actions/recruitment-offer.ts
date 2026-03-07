"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { RecruitmentOfferStatus, ReceivedOffer } from "@/types";

const createOfferSchema = z.object({
  trainerId: z.string().uuid(),
  jobPostingId: z.string().uuid(),
  message: z.string().min(1, "메시지를 입력해주세요"),
});

/**
 * 영입 제안 생성
 */
export async function createOffer(
  trainerId: string,
  jobPostingId: string,
  message: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const validated = createOfferSchema.safeParse({ trainerId, jobPostingId, message });
  if (!validated.success) {
    return { error: "잘못된 입력입니다." };
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

  // 공고가 해당 센터 소유인지 확인
  const { data: jobPosting } = await supabase
    .from("job_postings")
    .select("id, center_id")
    .eq("id", jobPostingId)
    .eq("center_id", center.id)
    .single();

  if (!jobPosting) {
    return { error: "해당 공고를 찾을 수 없습니다." };
  }

  // 중복 제안 확인
  const { data: existingOffer } = await supabase
    .from("recruitment_offers")
    .select("id")
    .eq("center_id", center.id)
    .eq("trainer_id", trainerId)
    .eq("job_posting_id", jobPostingId)
    .eq("status", "pending")
    .single();

  if (existingOffer) {
    return { error: "이미 동일한 제안이 진행 중입니다." };
  }

  const { error } = await supabase.from("recruitment_offers").insert({
    center_id: center.id,
    trainer_id: trainerId,
    job_posting_id: jobPostingId,
    message,
    status: "pending",
  });

  if (error) {
    console.error("영입 제안 생성 실패:", error);
    return { error: "영입 제안에 실패했습니다." };
  }

  revalidatePath("/center/talent-pool");
  return { success: true };
}

/**
 * 받은 영입 제안 목록 (트레이너용)
 */
export async function getReceivedOffers(): Promise<{
  data?: ReceivedOffer[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("recruitment_offers")
    .select(
      `
      id,
      message,
      status,
      created_at,
      job_posting:job_postings (
        id,
        title
      ),
      center:centers (
        id,
        name,
        address
      )
    `
    )
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("받은 제안 조회 실패:", error);
    return { error: "받은 제안 조회에 실패했습니다." };
  }

  const offers: ReceivedOffer[] = (data || []).map((item) => ({
    id: item.id,
    message: item.message,
    status: item.status as RecruitmentOfferStatus,
    created_at: item.created_at,
    job_posting: Array.isArray(item.job_posting)
      ? item.job_posting[0]
      : item.job_posting,
    center: Array.isArray(item.center) ? item.center[0] : item.center,
  }));

  return { data: offers };
}

/**
 * 영입 제안 상태 변경 (트레이너용)
 */
export async function updateOfferStatus(
  offerId: string,
  status: RecruitmentOfferStatus
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 제안 소유권 확인
  const { data: offer } = await supabase
    .from("recruitment_offers")
    .select("trainer_id")
    .eq("id", offerId)
    .single();

  if (!offer || offer.trainer_id !== user.id) {
    return { error: "권한이 없습니다." };
  }

  const { error } = await supabase
    .from("recruitment_offers")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", offerId);

  if (error) {
    console.error("제안 상태 변경 실패:", error);
    return { error: "상태 변경에 실패했습니다." };
  }

  revalidatePath("/offers");
  return { success: true };
}
