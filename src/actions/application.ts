"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ApplicationStatus, ApplicationDetail } from "@/types";

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

/**
 * 지원자 상세 정보 조회 (센터용)
 */
export async function getApplicationDetail(
  applicationId: string
): Promise<{ data?: ApplicationDetail; error?: string }> {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 프로필 조회 (센터 확인)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "center") {
    return { error: "권한이 없습니다." };
  }

  // 센터 정보 조회
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!center) {
    return { error: "센터 정보를 찾을 수 없습니다." };
  }

  // JOIN 쿼리로 지원자 상세 정보 조회
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      message,
      created_at,
      updated_at,
      job_posting:job_postings!inner(
        id,
        title,
        center_id
      ),
      user:profiles!applications_user_id_fkey(
        id,
        name,
        email,
        phone
      ),
      resume:resumes(
        id,
        title,
        categories,
        region,
        experience_level,
        gender,
        birth_year,
        introduction,
        certifications,
        career_history,
        education,
        is_primary,
        is_public,
        created_at,
        updated_at,
        user_id
      )
    `
    )
    .eq("id", applicationId)
    .single();

  if (error) {
    console.error("지원자 조회 실패:", error);
    return { error: "지원자 정보를 찾을 수 없습니다." };
  }

  // job_posting은 배열로 반환되므로 첫 번째 요소 사용
  const jobPosting = Array.isArray(data.job_posting) ? data.job_posting[0] : data.job_posting;

  if (!jobPosting?.center_id || !center?.id) {
    return { error: "지원자 정보 또는 센터 정보가 올바르지 않습니다." };
  }

  if (jobPosting.center_id !== center.id) {
    return { error: "권한이 없습니다." };
  }

  // 반환 타입에 배열이 아닌 값 사용하도록 변환
  return {
    data: {
      ...data,
      job_posting: jobPosting,
      user: Array.isArray(data.user) ? data.user[0] : data.user,
      resume: Array.isArray(data.resume) ? data.resume[0] : data.resume,
    } as ApplicationDetail,
  };
}

/**
 * 지원 상태 변경 (센터용)
 */
const updateStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
  message: z.string().optional(),
});

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  message?: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // 검증
  const validated = updateStatusSchema.safeParse({
    applicationId,
    status,
    message,
  });

  if (!validated.success) {
    return { error: "잘못된 입력입니다." };
  }

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 프로필 조회 (센터 확인)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "center") {
    return { error: "권한이 없습니다." };
  }

  // 센터 정보 조회
  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!center) {
    return { error: "센터 정보를 찾을 수 없습니다." };
  }

  // 해당 application의 center_id 확인
  const { data: app } = await supabase
    .from("applications")
    .select("job_posting:job_postings!inner(center_id, id)")
    .eq("id", applicationId)
    .single();

  if (!app || !app.job_posting || app.job_posting.center_id !== center.id) {
    return { error: "권한이 없습니다." };
  }

  // 불합격 시 메시지 필수
  if (status === "rejected" && !message?.trim()) {
    return { error: "거절 사유를 입력해주세요." };
  }

  // 업데이트
  const { data: updateResult, error } = await supabase
    .from("applications")
    .update({
      status,
      message: message || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select();

  if (error) {
    console.error("상태 변경 실패:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return { error: `상태 변경에 실패했습니다: ${error.message}` };
  }

  if (!updateResult || updateResult.length === 0) {
    console.error("업데이트된 행이 없습니다. RLS 정책을 확인하세요.");
    return { error: "업데이트 권한이 없거나 레코드를 찾을 수 없습니다." };
  }

  console.log("상태 변경 성공:", updateResult);
  revalidatePath(`/center/jobs/${app.job_posting.id}/applications`);
  return { success: true };
}
