/**
 * 고용형태 상수
 *
 * @description Supabase employment_types 테이블의 데이터를 TypeScript 상수로 정의
 * @note 초안 - 추후 업데이트 예정
 */

import type { EmploymentTypeCode } from "@/types";

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentTypeCode, string> = {
  full_time: "정규직",
  contract: "계약직",
  part_time: "파트타임",
} as const;

export const EMPLOYMENT_TYPE_OPTIONS: Array<{ value: EmploymentTypeCode; label: string }> = [
  { value: "full_time", label: "정규직" },
  { value: "contract", label: "계약직" },
  { value: "part_time", label: "파트타임" },
];
