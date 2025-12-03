"use server";

import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types";

/**
 * 트레이너 대시보드 통계 타입
 */
export interface TrainerStats {
  resumeCount: number; // 내 이력서 개수
  totalApplications: number; // 총 지원 건수
  pendingApplications: number; // 대기중인 지원
  likeCount: number; // 좋아요 누른 공고 수
}

/**
 * 센터 대시보드 통계 타입
 */
export interface CenterStats {
  jobPostingCount: number; // 등록한 구인공고 수
  totalApplicants: number; // 총 지원자 수
  activeJobCount: number; // 활성 공고 수
  todayApplicants: number; // 오늘 지원자 수
  weekApplicants: number; // 이번 주 지원자 수
}

/**
 * 최근 지원 내역 타입 (트레이너용)
 */
export interface RecentApplication {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  job_posting: {
    id: string;
    title: string;
    region: string;
    center: {
      name: string;
    };
  };
}

/**
 * 최근 받은 지원 타입 (센터용)
 */
export interface RecentApplicant {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  resume: {
    id: string;
    title: string;
  };
  job_posting: {
    id: string;
    title: string;
  };
}

/**
 * 트레이너 대시보드 통계 조회
 */
export async function getTrainerStats(userId: string): Promise<TrainerStats | null> {
  try {
    const supabase = await createClient();

    // 병렬로 모든 통계 조회
    const [resumeResult, applicationResult, likeResult] = await Promise.all([
      // 이력서 개수
      supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", userId),

      // 지원 내역 (전체 및 대기중)
      supabase.from("applications").select("id, status").eq("user_id", userId),

      // 좋아요 개수
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    const resumeCount = resumeResult.count ?? 0;
    const likeCount = likeResult.count ?? 0;
    const applications = applicationResult.data ?? [];
    const totalApplications = applications.length;
    const pendingApplications = applications.filter((app) => app.status === "pending").length;

    return {
      resumeCount,
      totalApplications,
      pendingApplications,
      likeCount,
    };
  } catch (error) {
    console.error("트레이너 통계 조회 실패:", error);
    return null;
  }
}

/**
 * 센터 대시보드 통계 조회
 */
export async function getCenterStats(centerId: string): Promise<CenterStats | null> {
  try {
    const supabase = await createClient();

    // 오늘과 이번 주 시작 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 이번 주 일요일
    const weekStartStr = weekStart.toISOString();

    // 병렬로 모든 통계 조회
    const [jobPostingResult, activeJobResult, allApplicationsResult] = await Promise.all([
      // 전체 구인공고 개수
      supabase
        .from("job_postings")
        .select("id", { count: "exact", head: true })
        .eq("center_id", centerId),

      // 활성 공고 개수
      supabase
        .from("job_postings")
        .select("id", { count: "exact", head: true })
        .eq("center_id", centerId)
        .eq("is_active", true),

      // 모든 지원 내역 (센터의 공고에 대한)
      supabase
        .from("applications")
        .select("id, created_at, job_posting!inner(center_id)")
        .eq("job_posting.center_id", centerId),
    ]);

    const jobPostingCount = jobPostingResult.count ?? 0;
    const activeJobCount = activeJobResult.count ?? 0;
    const allApplications = allApplicationsResult.data ?? [];
    const totalApplicants = allApplications.length;

    // 오늘과 이번 주 지원자 수 계산
    const todayApplicants = allApplications.filter(
      (app) => new Date(app.created_at) >= today
    ).length;
    const weekApplicants = allApplications.filter(
      (app) => new Date(app.created_at) >= weekStart
    ).length;

    return {
      jobPostingCount,
      totalApplicants,
      activeJobCount,
      todayApplicants,
      weekApplicants,
    };
  } catch (error) {
    console.error("센터 통계 조회 실패:", error);
    return null;
  }
}

/**
 * 트레이너 최근 지원 내역 조회 (최대 5개)
 */
export async function getRecentApplications(
  userId: string
): Promise<RecentApplication[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        created_at,
        job_posting:job_postings!inner(
          id,
          title,
          region,
          center:centers!inner(name)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return data as unknown as RecentApplication[];
  } catch (error) {
    console.error("최근 지원 내역 조회 실패:", error);
    return null;
  }
}

/**
 * 센터 최근 받은 지원 조회 (최대 5개)
 */
export async function getRecentApplicants(centerId: string): Promise<RecentApplicant[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        created_at,
        user:profiles!inner(name, email),
        resume:resumes!inner(id, title),
        job_posting:job_postings!inner(id, title, center_id)
      `
      )
      .eq("job_posting.center_id", centerId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return data as unknown as RecentApplicant[];
  } catch (error) {
    console.error("최근 받은 지원 조회 실패:", error);
    return null;
  }
}

/**
 * 추천 구인공고 조회 (트레이너용)
 * 사용자의 이력서 기반으로 매칭되는 공고 추천
 */
export async function getRecommendedJobs(userId: string, limit: number = 5) {
  try {
    const supabase = await createClient();

    // 사용자의 최신 이력서 조회
    const { data: resume } = await supabase
      .from("resumes")
      .select("desired_job_categories, desired_region")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (!resume) {
      // 이력서가 없으면 최신 공고 반환
      const { data } = await supabase
        .from("job_postings_with_details")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      return data ?? [];
    }

    // 이력서 기반 매칭 공고 조회
    const { data } = await supabase
      .from("job_postings_with_details")
      .select("*")
      .eq("is_active", true)
      .or(
        `region.eq.${resume.desired_region},job_categories.cs.{${resume.desired_job_categories?.join(",")}}`
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    return data ?? [];
  } catch (error) {
    console.error("추천 구인공고 조회 실패:", error);
    return [];
  }
}
