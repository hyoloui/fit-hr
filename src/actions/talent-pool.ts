"use server";

import { createClient } from "@/lib/supabase/server";
import type { TalentPoolTrainer, TrainerFilter } from "@/types";

/**
 * 인재풀 트레이너 목록 조회
 */
export async function getTrainers(
  filter: TrainerFilter
): Promise<{ data?: TalentPoolTrainer[]; error?: string }> {
  const supabase = await createClient();

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

  // 트레이너 역할 프로필 조회 (role = 'trainer')
  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      email,
      phone,
      resumes (
        id,
        title,
        categories,
        region,
        experience_level,
        gender,
        is_primary,
        is_public
      )
    `
    )
    .eq("role", "trainer")
    .order("name", { ascending: true });

  // 검색어 필터
  if (filter.search) {
    query = query.ilike("name", `%${filter.search}%`);
  }

  const { data: profiles, error } = await query;

  if (error) {
    console.error("트레이너 목록 조회 실패:", error);
    return { error: "트레이너 목록 조회에 실패했습니다." };
  }

  // 리뷰 평균 평점 조회
  const { data: reviews } = await supabase
    .from("trainer_reviews")
    .select("trainer_id, rating");

  const ratingMap = new Map<string, { total: number; count: number }>();
  if (reviews) {
    for (const review of reviews) {
      const existing = ratingMap.get(review.trainer_id) || { total: 0, count: 0 };
      existing.total += review.rating;
      existing.count += 1;
      ratingMap.set(review.trainer_id, existing);
    }
  }

  // 프로필 + 이력서 + 평점 조합
  const trainers: TalentPoolTrainer[] = (profiles || [])
    .map((profile) => {
      const resumes = Array.isArray(profile.resumes) ? profile.resumes : [];
      const primaryResume =
        resumes.find((r) => r.is_primary && r.is_public) ||
        resumes.find((r) => r.is_public) ||
        null;

      const ratingInfo = ratingMap.get(profile.id);
      const avgRating = ratingInfo
        ? Math.round((ratingInfo.total / ratingInfo.count) * 10) / 10
        : null;

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        resume: primaryResume
          ? {
              id: primaryResume.id,
              title: primaryResume.title,
              categories: primaryResume.categories || [],
              region: primaryResume.region,
              experience_level: primaryResume.experience_level,
              gender: primaryResume.gender,
            }
          : null,
        avg_rating: avgRating,
        review_count: ratingInfo?.count || 0,
      };
    })
    .filter((trainer) => {
      // 카테고리 필터
      if (filter.categories && filter.categories.length > 0) {
        if (!trainer.resume) return false;
        const hasCategory = filter.categories.some((c) =>
          trainer.resume!.categories.includes(c)
        );
        if (!hasCategory) return false;
      }

      // 경력 필터
      if (filter.experienceLevel) {
        if (!trainer.resume) return false;
        if (trainer.resume.experience_level !== filter.experienceLevel) return false;
      }

      return true;
    });

  return { data: trainers };
}

/**
 * 트레이너 리뷰 목록 조회
 */
export async function getTrainerReviews(trainerId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: reviews, error } = await supabase
    .from("trainer_reviews")
    .select(
      `
      id,
      rating,
      content,
      created_at,
      center:centers (
        name
      )
    `
    )
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("리뷰 조회 실패:", error);
    return { error: "리뷰 조회에 실패했습니다." };
  }

  return { data: reviews };
}
