"use server";

/**
 * 구인공고 관련 Server Actions
 *
 * @description 구인공고 등록, 조회, 수정, 삭제
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { InsertJobPosting, UpdateJobPosting } from "@/types";

// ============================================
// Zod 스키마 정의
// ============================================

const jobPostingSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  region: z.string().min(1, "지역을 선택해주세요"),
  categories: z.array(z.string()).min(1, "업종을 최소 1개 이상 선택해주세요"),
  gender: z.enum(["male", "female", "any"]).optional(),
  employment_type: z.string().min(1, "고용형태를 선택해주세요"),
  experience_level: z.string().min(1, "경력을 선택해주세요"),
  salary_type: z.enum(["monthly", "hourly", "negotiable"]).optional(),
  salary_min: z.coerce.number().int().min(0, "최소 급여는 0 이상이어야 합니다").optional(),
  salary_max: z.coerce.number().int().min(0, "최대 급여는 0 이상이어야 합니다").optional(),
  deadline: z.string().optional(),
});

// ============================================
// 타입 정의
// ============================================

type JobPostingFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    region?: string[];
    categories?: string[];
    gender?: string[];
    employment_type?: string[];
    experience_level?: string[];
    salary_type?: string[];
    salary_min?: string[];
    salary_max?: string[];
    deadline?: string[];
    _form?: string[];
  };
  success?: boolean;
};

// ============================================
// Server Actions
// ============================================

/**
 * 현재 사용자의 센터에 등록된 구인공고 목록 조회
 */
export async function getMyJobPostings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!center) {
    return null;
  }

  const { data: jobPostings } = await supabase
    .from("job_postings")
    .select("*")
    .eq("center_id", center.id)
    .order("created_at", { ascending: false });

  return jobPostings;
}

/**
 * 구인공고 상세 조회 (센터 소유자만)
 */
export async function getMyJobPosting(jobPostingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: jobPosting } = await supabase
    .from("job_postings")
    .select(
      `
      *,
      center:centers!inner(id, owner_id)
    `
    )
    .eq("id", jobPostingId)
    .eq("center.owner_id", user.id)
    .single();

  return jobPosting;
}

/**
 * 구인공고 등록
 */
export async function createJobPosting(
  prevState: JobPostingFormState | null,
  formData: FormData
): Promise<JobPostingFormState> {
  const categories = formData.getAll("categories");

  const validatedFields = jobPostingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    region: formData.get("region"),
    categories: categories,
    gender: formData.get("gender") || undefined,
    employment_type: formData.get("employment_type"),
    experience_level: formData.get("experience_level"),
    salary_type: formData.get("salary_type") || undefined,
    salary_min: formData.get("salary_min") || undefined,
    salary_max: formData.get("salary_max") || undefined,
    deadline: formData.get("deadline") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        errors: {
          _form: ["로그인이 필요합니다."],
        },
      };
    }

    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!center) {
      return {
        errors: {
          _form: ["센터 정보를 먼저 등록해주세요."],
        },
      };
    }

    const { salary_min, salary_max } = validatedFields.data;
    if (salary_min !== undefined && salary_max !== undefined && salary_min > salary_max) {
      return {
        errors: {
          salary_max: ["최대 급여는 최소 급여보다 커야 합니다."],
        },
      };
    }

    const jobPostingData: InsertJobPosting = {
      center_id: center.id,
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      region: validatedFields.data.region,
      categories: validatedFields.data.categories,
      gender: validatedFields.data.gender,
      employment_type: validatedFields.data.employment_type,
      experience_level: validatedFields.data.experience_level,
      salary_type: validatedFields.data.salary_type,
      salary_min: validatedFields.data.salary_min,
      salary_max: validatedFields.data.salary_max,
      deadline: validatedFields.data.deadline,
      is_active: true,
    };

    const { error } = await supabase.from("job_postings").insert(jobPostingData);

    if (error) {
      console.error("Create job posting error:", error);
      return {
        errors: {
          _form: [error.message || "구인공고 등록 중 오류가 발생했습니다."],
        },
      };
    }

    revalidatePath("/center/jobs");
    return { success: true };
  } catch (error) {
    console.error("Create job posting catch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "구인공고 등록 중 오류가 발생했습니다.";
    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}

/**
 * 구인공고 수정
 */
export async function updateJobPosting(
  jobPostingId: string,
  prevState: JobPostingFormState | null,
  formData: FormData
): Promise<JobPostingFormState> {
  const categories = formData.getAll("categories");

  const validatedFields = jobPostingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    region: formData.get("region"),
    categories: categories,
    gender: formData.get("gender") || undefined,
    employment_type: formData.get("employment_type"),
    experience_level: formData.get("experience_level"),
    salary_type: formData.get("salary_type") || undefined,
    salary_min: formData.get("salary_min") || undefined,
    salary_max: formData.get("salary_max") || undefined,
    deadline: formData.get("deadline") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        errors: {
          _form: ["로그인이 필요합니다."],
        },
      };
    }

    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!center) {
      return {
        errors: {
          _form: ["센터 정보를 찾을 수 없습니다."],
        },
      };
    }

    const { salary_min, salary_max } = validatedFields.data;
    if (salary_min !== undefined && salary_max !== undefined && salary_min > salary_max) {
      return {
        errors: {
          salary_max: ["최대 급여는 최소 급여보다 커야 합니다."],
        },
      };
    }

    const jobPostingData: UpdateJobPosting = {
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      region: validatedFields.data.region,
      categories: validatedFields.data.categories,
      gender: validatedFields.data.gender,
      employment_type: validatedFields.data.employment_type,
      experience_level: validatedFields.data.experience_level,
      salary_type: validatedFields.data.salary_type,
      salary_min: validatedFields.data.salary_min,
      salary_max: validatedFields.data.salary_max,
      deadline: validatedFields.data.deadline,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("job_postings")
      .update(jobPostingData)
      .eq("id", jobPostingId)
      .eq("center_id", center.id);

    if (error) {
      console.error("Update job posting error:", error);
      return {
        errors: {
          _form: [error.message || "구인공고 수정 중 오류가 발생했습니다."],
        },
      };
    }

    revalidatePath("/center/jobs");
    revalidatePath(`/center/jobs/${jobPostingId}`);
    return { success: true };
  } catch (error) {
    console.error("Update job posting catch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "구인공고 수정 중 오류가 발생했습니다.";
    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}

/**
 * 구인공고 활성화/비활성화 토글
 */
export async function toggleJobPostingActive(jobPostingId: string, isActive: boolean) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "로그인이 필요합니다." };
    }

    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!center) {
      return { error: "센터 정보를 찾을 수 없습니다." };
    }

    const { error } = await supabase
      .from("job_postings")
      .update({ is_active: isActive })
      .eq("id", jobPostingId)
      .eq("center_id", center.id);

    if (error) {
      console.error("Toggle job posting active error:", error);
      return { error: error.message || "상태 변경 중 오류가 발생했습니다." };
    }

    revalidatePath("/center/jobs");
    return { success: true };
  } catch (error) {
    console.error("Toggle job posting active catch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "상태 변경 중 오류가 발생했습니다.";
    return { error: errorMessage };
  }
}

/**
 * 구인공고 삭제
 */
export async function deleteJobPosting(jobPostingId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "로그인이 필요합니다." };
    }

    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!center) {
      return { error: "센터 정보를 찾을 수 없습니다." };
    }

    const { error } = await supabase
      .from("job_postings")
      .delete()
      .eq("id", jobPostingId)
      .eq("center_id", center.id);

    if (error) {
      console.error("Delete job posting error:", error);
      return { error: error.message || "구인공고 삭제 중 오류가 발생했습니다." };
    }

    revalidatePath("/center/jobs");
    return { success: true };
  } catch (error) {
    console.error("Delete job posting catch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "구인공고 삭제 중 오류가 발생했습니다.";
    return { error: errorMessage };
  }
}
