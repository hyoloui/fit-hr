"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { CareerHistory, Education } from "@/types";

// 이력서 작성/수정 스키마
const resumeSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  categories: z.array(z.string()).min(1, "희망 업종을 하나 이상 선택해주세요"),
  region: z.string().min(1, "희망 지역을 선택해주세요"),
  experience_level: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  birth_year: z.number().optional().nullable(),
  introduction: z.string().optional().nullable(),
  certifications: z.string().optional().nullable(),
  career_history: z.array(
    z.object({
      company: z.string().min(1, "회사명을 입력해주세요"),
      position: z.string().min(1, "직책을 입력해주세요"),
      period: z.string().min(1, "기간을 입력해주세요"),
      description: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      school: z.string().min(1, "학교명을 입력해주세요"),
      major: z.string().min(1, "전공을 입력해주세요"),
      period: z.string().min(1, "기간을 입력해주세요"),
    })
  ),
});

/**
 * 이력서 생성
 */
export async function createResume(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // FormData 파싱
  const careerHistory: CareerHistory[] = [];
  const education: Education[] = [];
  const categories: string[] = formData.getAll("categories") as string[];

  // 경력 파싱 (career_history_0_company, career_history_0_position 형식)
  let careerIndex = 0;
  while (formData.has(`career_history_${careerIndex}_company`)) {
    careerHistory.push({
      company: formData.get(`career_history_${careerIndex}_company`) as string,
      position: formData.get(`career_history_${careerIndex}_position`) as string,
      period: formData.get(`career_history_${careerIndex}_period`) as string,
      description: formData.get(`career_history_${careerIndex}_description`) as string,
    });
    careerIndex++;
  }

  // 학력 파싱
  let eduIndex = 0;
  while (formData.has(`education_${eduIndex}_school`)) {
    education.push({
      school: formData.get(`education_${eduIndex}_school`) as string,
      major: formData.get(`education_${eduIndex}_major`) as string,
      period: formData.get(`education_${eduIndex}_period`) as string,
    });
    eduIndex++;
  }

  // birth_year 파싱
  const birthYearStr = formData.get("birth_year") as string;
  const birthYear = birthYearStr ? parseInt(birthYearStr, 10) : null;

  // 검증
  const validated = resumeSchema.safeParse({
    title: formData.get("title"),
    categories: categories,
    region: formData.get("region"),
    experience_level: formData.get("experience_level") || null,
    gender: formData.get("gender") || null,
    birth_year: birthYear,
    introduction: formData.get("introduction") || null,
    certifications: formData.get("certifications") || null,
    career_history: careerHistory,
    education: education,
  });

  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || "입력 정보를 확인해주세요.",
    };
  }

  // 이력서 생성
  const { error } = await supabase.from("resumes").insert({
    user_id: user.id,
    title: validated.data.title,
    categories: validated.data.categories,
    region: validated.data.region,
    experience_level: validated.data.experience_level || null,
    gender: validated.data.gender || null,
    birth_year: validated.data.birth_year || null,
    introduction: validated.data.introduction || null,
    certifications: validated.data.certifications ? [validated.data.certifications] : null,
    career_history: validated.data.career_history,
    education: validated.data.education,
  });

  if (error) {
    console.error("이력서 생성 실패:", error);
    return { error: "이력서 생성에 실패했습니다." };
  }

  revalidatePath("/resumes");
  redirect("/resumes");
}

/**
 * 이력서 수정
 */
export async function updateResume(id: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 소유권 확인
  const { data: resume } = await supabase.from("resumes").select("user_id").eq("id", id).single();

  if (!resume || resume.user_id !== user.id) {
    return { error: "권한이 없습니다." };
  }

  // FormData 파싱
  const careerHistory: CareerHistory[] = [];
  const education: Education[] = [];
  const categories: string[] = formData.getAll("categories") as string[];

  let careerIndex = 0;
  while (formData.has(`career_history_${careerIndex}_company`)) {
    careerHistory.push({
      company: formData.get(`career_history_${careerIndex}_company`) as string,
      position: formData.get(`career_history_${careerIndex}_position`) as string,
      period: formData.get(`career_history_${careerIndex}_period`) as string,
      description: formData.get(`career_history_${careerIndex}_description`) as string,
    });
    careerIndex++;
  }

  let eduIndex = 0;
  while (formData.has(`education_${eduIndex}_school`)) {
    education.push({
      school: formData.get(`education_${eduIndex}_school`) as string,
      major: formData.get(`education_${eduIndex}_major`) as string,
      period: formData.get(`education_${eduIndex}_period`) as string,
    });
    eduIndex++;
  }

  // birth_year 파싱
  const birthYearStr = formData.get("birth_year") as string;
  const birthYear = birthYearStr ? parseInt(birthYearStr, 10) : null;

  // 검증
  const validated = resumeSchema.safeParse({
    title: formData.get("title"),
    categories: categories,
    region: formData.get("region"),
    experience_level: formData.get("experience_level") || null,
    gender: formData.get("gender") || null,
    birth_year: birthYear,
    introduction: formData.get("introduction") || null,
    certifications: formData.get("certifications") || null,
    career_history: careerHistory,
    education: education,
  });

  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || "입력 정보를 확인해주세요.",
    };
  }

  // 이력서 수정
  const { error } = await supabase
    .from("resumes")
    .update({
      title: validated.data.title,
      categories: validated.data.categories,
      region: validated.data.region,
      experience_level: validated.data.experience_level || null,
      gender: validated.data.gender || null,
      birth_year: validated.data.birth_year || null,
      introduction: validated.data.introduction || null,
      certifications: validated.data.certifications ? [validated.data.certifications] : null,
      career_history: validated.data.career_history,
      education: validated.data.education,
    })
    .eq("id", id);

  if (error) {
    console.error("이력서 수정 실패:", error);
    return { error: "이력서 수정에 실패했습니다." };
  }

  revalidatePath("/resumes");
  revalidatePath(`/resumes/${id}`);
  redirect("/resumes");
}

/**
 * 이력서 삭제
 */
export async function deleteResume(id: string) {
  const supabase = await createClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 소유권 확인
  const { data: resume } = await supabase.from("resumes").select("user_id").eq("id", id).single();

  if (!resume || resume.user_id !== user.id) {
    return { error: "권한이 없습니다." };
  }

  // 이력서 삭제
  const { error } = await supabase.from("resumes").delete().eq("id", id);

  if (error) {
    console.error("이력서 삭제 실패:", error);
    return { error: "이력서 삭제에 실패했습니다." };
  }

  revalidatePath("/resumes");
  return { success: true };
}
