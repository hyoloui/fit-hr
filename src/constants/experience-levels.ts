/**
 * 경력 수준 상수
 *
 * @description Supabase experience_levels 테이블의 데이터를 TypeScript 상수로 정의
 * @note 초안 - 추후 업데이트 예정
 */

import type { ExperienceLevelCode } from "@/types";

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevelCode, string> = {
  entry: "신입",
  junior: "~3년차",
  senior: "팀장 이상",
} as const;

export const EXPERIENCE_LEVEL_OPTIONS: Array<{ value: ExperienceLevelCode; label: string }> = [
  { value: "entry", label: "신입" },
  { value: "junior", label: "~3년차" },
  { value: "senior", label: "팀장 이상" },
];
