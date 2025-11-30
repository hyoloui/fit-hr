"use server";

/**
 * 인증 관련 Server Actions
 *
 * @description 회원가입, 로그인, 로그아웃 등 인증 관련 서버 액션
 * @note 초안 - 추후 업데이트 예정
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// ============================================
// Zod 스키마 정의
// ============================================

const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  name: z.string().min(1, "이름을 입력해주세요"),
  role: z.enum(["trainer", "center"], {
    message: "역할을 선택해주세요",
  }),
});

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

// ============================================
// 타입 정의
// ============================================

type SignupFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    role?: string[];
    _form?: string[];
  };
  success?: boolean;
  needsEmailConfirmation?: boolean;
};

type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
};

// ============================================
// Server Actions
// ============================================

/**
 * 회원가입
 *
 * @param prevState - 이전 폼 상태
 * @param formData - 폼 데이터
 * @returns 폼 상태 (에러 또는 성공)
 */
export async function signup(
  prevState: SignupFormState | null,
  formData: FormData
): Promise<SignupFormState> {
  // 1. 폼 데이터 검증
  const validatedFields = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, name, role } = validatedFields.data;

  try {
    const supabase = await createClient();

    // 2. Supabase Auth를 통한 회원가입
    // metadata에 name과 role을 포함하여 profiles 테이블 트리거 실행
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return {
        errors: {
          _form: [error.message || "회원가입 중 오류가 발생했습니다."],
        },
      };
    }

    // 3. 이메일 확인이 필요한 경우
    if (data.user && !data.user.confirmed_at) {
      return {
        success: false,
        needsEmailConfirmation: true,
        errors: {
          _form: ["회원가입이 완료되었습니다! 이메일을 확인한 후 로그인해주세요."],
        },
      };
    }

    // 4. 회원가입 성공 (즉시 로그인 가능)
    return { success: true };
  } catch (error) {
    console.error("Signup catch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.";
    return {
      errors: {
        _form: [errorMessage],
      },
    };
  }
}

/**
 * 로그인
 *
 * @param prevState - 이전 폼 상태
 * @param formData - 폼 데이터
 * @returns 폼 상태 (에러 또는 성공)
 */
export async function login(
  prevState: LoginFormState | null,
  formData: FormData
): Promise<LoginFormState> {
  // 1. 폼 데이터 검증
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const supabase = await createClient();

    // 2. Supabase Auth를 통한 로그인
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 이메일 미확인 에러 처리
      if (error.message === "Email not confirmed") {
        return {
          errors: {
            _form: ["이메일 인증이 필요합니다. 이메일을 확인해주세요."],
          },
        };
      }

      return {
        errors: {
          _form: ["이메일 또는 비밀번호가 올바르지 않습니다."],
        },
      };
    }

    // 3. 로그인 성공 시 대시보드로 리다이렉트
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // TODO: 나중에 에러 로깅에 사용
    // console.error("Login error:", error);
    return {
      errors: {
        _form: ["로그인 중 오류가 발생했습니다. 다시 시도해주세요."],
      },
    };
  }
}

/**
 * 로그아웃
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * 현재 로그인된 사용자 정보 조회
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 현재 로그인된 사용자의 프로필 정보 조회
 */
export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return profile;
}
