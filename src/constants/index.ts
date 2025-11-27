/**
 * 전역 상수
 *
 * @description 프로젝트 전역에서 사용하는 상수 정의
 * @note 초안 - 추후 업데이트 예정
 */

// 상수 파일 재export
export * from "./regions";
export * from "./job-categories";
export * from "./employment-types";
export * from "./experience-levels";

// 앱 전역 상수
export const APP_NAME = "Fit HR";
export const APP_DESCRIPTION = "피트니스 업계 전문 채용 플랫폼";

// 역할 상수
export const ROLE_TRAINER = "trainer";
export const ROLE_CENTER = "center";
export const ROLES = [ROLE_TRAINER, ROLE_CENTER] as const;

export type Role = (typeof ROLES)[number];

// Gender 라벨
export const GENDER_LABELS = {
  male: "남성",
  female: "여성",
  any: "무관",
} as const;

// Salary Type 라벨
export const SALARY_TYPE_LABELS = {
  monthly: "월급",
  hourly: "시급",
  negotiable: "협의",
} as const;

// Application Status 라벨
export const APPLICATION_STATUS_LABELS = {
  pending: "대기중",
  reviewed: "검토완료",
  accepted: "합격",
  rejected: "불합격",
} as const;

// Application Status 색상 (Tailwind CSS)
export const APPLICATION_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
} as const;
