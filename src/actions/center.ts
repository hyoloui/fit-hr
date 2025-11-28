"use server";

/**
 * 센터 관련 Server Actions
 *
 * @description 센터 정보 등록, 조회, 수정
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { InsertCenter, UpdateCenter } from "@/types";

// ============================================
// Zod 스키마 정의
// ============================================

const centerSchema = z.object({
  name: z.string().min(1, "센터명을 입력해주세요"),
  description: z.string().optional(),
  address: z.string().optional(),
  region: z.string().min(1, "지역을 선택해주세요"),
  logo_url: z.string().url("올바른 URL 형식이 아닙니다").optional().or(z.literal("")),
  contact_email: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
});

// ============================================
// 타입 정의
// ============================================

type CenterFormState = {
  errors?: {
    name?: string[];
    description?: string[];
    address?: string[];
    region?: string[];
    logo_url?: string[];
    contact_email?: string[];
    contact_phone?: string[];
    _form?: string[];
  };
  success?: boolean;
};

// ============================================
// Server Actions
// ============================================

/**
 * 현재 사용자의 센터 정보 조회
 */
export async function getMyCenter() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: center } = await supabase
    .from("centers")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  return center;
}

/**
 * 센터 정보 등록
 */
export async function createCenter(
  prevState: CenterFormState | null,
  formData: FormData
): Promise<CenterFormState> {
  // 1. 폼 데이터 검증
  const validatedFields = centerSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    address: formData.get("address"),
    region: formData.get("region"),
    logo_url: formData.get("logo_url"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    // 2. 현재 사용자 확인
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

    // 3. 이미 센터가 등록되어 있는지 확인
    const { data: existingCenter } = await supabase
      .from("centers")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (existingCenter) {
      return {
        errors: {
          _form: ["이미 센터 정보가 등록되어 있습니다."],
        },
      };
    }

    // 4. 센터 정보 등록
    const centerData: InsertCenter = {
      owner_id: user.id,
      ...validatedFields.data,
    };

    const { error } = await supabase.from("centers").insert(centerData);

    if (error) {
      console.error("Create center error:", error);
      return {
        errors: {
          _form: [error.message || "센터 등록 중 오류가 발생했습니다."],
        },
      };
    }

    revalidatePath("/center/profile");
    return { success: true };
  } catch (error) {
    console.error("Create center catch error:", error);
    const errorMessage = error instanceof Error ? error.message : "센터 등록 중 오류가 발생했습니다.";
    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}

/**
 * 센터 정보 수정
 */
export async function updateCenter(
  centerId: string,
  prevState: CenterFormState | null,
  formData: FormData
): Promise<CenterFormState> {
  // 1. 폼 데이터 검증
  const validatedFields = centerSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    address: formData.get("address"),
    region: formData.get("region"),
    logo_url: formData.get("logo_url"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    // 2. 현재 사용자 확인
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

    // 3. 센터 정보 수정
    const centerData: UpdateCenter = {
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("centers")
      .update(centerData)
      .eq("id", centerId)
      .eq("owner_id", user.id); // 본인 센터만 수정 가능

    if (error) {
      console.error("Update center error:", error);
      return {
        errors: {
          _form: [error.message || "센터 수정 중 오류가 발생했습니다."],
        },
      };
    }

    revalidatePath("/center/profile");
    return { success: true };
  } catch (error) {
    console.error("Update center catch error:", error);
    const errorMessage = error instanceof Error ? error.message : "센터 수정 중 오류가 발생했습니다.";
    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}
