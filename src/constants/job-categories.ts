/**
 * 업종 상수
 *
 * @description Supabase job_categories 테이블의 데이터를 TypeScript 상수로 정의
 * @note 초안 - 추후 업데이트 예정
 */

import type { JobCategoryCode } from "@/types";

export const JOB_CATEGORY_LABELS: Record<JobCategoryCode, string> = {
  pt: "퍼스널트레이닝",
  pilates: "필라테스",
  yoga: "요가",
  crossfit: "크로스핏",
  swimming: "수영",
  golf: "골프",
  dance: "댄스/줌바",
  martial_arts: "무술/격투기",
  rehab: "재활/교정",
  group_ex: "그룹운동(GX)",
  kids: "유아체육",
  etc: "기타",
} as const;

export const JOB_CATEGORY_OPTIONS: Array<{ value: JobCategoryCode; label: string }> = [
  { value: "pt", label: "퍼스널트레이닝" },
  { value: "pilates", label: "필라테스" },
  { value: "yoga", label: "요가" },
  { value: "crossfit", label: "크로스핏" },
  { value: "swimming", label: "수영" },
  { value: "golf", label: "골프" },
  { value: "dance", label: "댄스/줌바" },
  { value: "martial_arts", label: "무술/격투기" },
  { value: "rehab", label: "재활/교정" },
  { value: "group_ex", label: "그룹운동(GX)" },
  { value: "kids", label: "유아체육" },
  { value: "etc", label: "기타" },
];
