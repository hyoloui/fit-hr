// 공통 상수 정의

// 역할 타입
export const ROLES = ["trainer", "center"] as const;

export type Role = (typeof ROLES)[number];

// 지역 타입 (예시 - 실제 DB 스키마에 맞게 수정 필요)
export const REGIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

export type Region = (typeof REGIONS)[number];

// 업종 타입 (예시)
export const BUSINESS_TYPES = [
  "헬스장",
  "요가",
  "필라테스",
  "크로스핏",
  "복합운동시설",
  "기타",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

// 성별 타입
export const GENDERS = ["남성", "여성", "무관"] as const;

export type Gender = (typeof GENDERS)[number];

// 고용형태 타입
export const EMPLOYMENT_TYPES = ["정규직", "계약직", "파트타임", "프리랜서"] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

// 경력 타입
export const EXPERIENCE_LEVELS = ["신입", "1년 이상", "3년 이상", "5년 이상", "10년 이상"] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
