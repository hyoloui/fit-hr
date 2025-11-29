"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 구인공고 지원
 */
export async function applyToJob(jobId: string, resumeId: string) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 이력서 소유권 확인
  const { data: resume } = await supabase
    .from("resumes")
    .select("user_id")
    .eq("id", resumeId)
    .single();

  if (!resume || resume.user_id !== user.id) {
    return { error: "본인의 이력서만 사용할 수 있습니다." };
  }

  // 중복 지원 확인
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("job_posting_id", jobId)
    .eq("user_id", user.id)
    .single();

  if (existingApplication) {
    return { error: "이미 지원한 공고입니다." };
  }

  // 지원 생성
  const { error } = await supabase.from("applications").insert({
    job_posting_id: jobId,
    user_id: user.id,
    resume_id: resumeId,
    status: "pending",
  });

  if (error) {
    console.error("지원 실패:", error);
    return { error: "지원에 실패했습니다." };
  }

  revalidatePath("/applications");
  revalidatePath(`/jobs/${jobId}`);
  return { success: true };
}

/**
 * 지원 취소
 */
export async function cancelApplication(applicationId: string) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 지원 정보 조회 (소유권 및 상태 확인)
  const { data: application } = await supabase
    .from("applications")
    .select("user_id, status, job_posting_id")
    .eq("id", applicationId)
    .single();

  if (!application || application.user_id !== user.id) {
    return { error: "권한이 없습니다." };
  }

  // 대기중 상태에서만 취소 가능
  if (application.status !== "pending") {
    return { error: "대기중 상태의 지원만 취소할 수 있습니다." };
  }

  // 지원 삭제
  const { error } = await supabase.from("applications").delete().eq("id", applicationId);

  if (error) {
    console.error("지원 취소 실패:", error);
    return { error: "지원 취소에 실패했습니다." };
  }

  revalidatePath("/applications");
  revalidatePath(`/jobs/${application.job_posting_id}`);
  return { success: true };
}
