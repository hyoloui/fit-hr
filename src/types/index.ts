// 공통 타입 정의 및 export
import type { Database, Tables, TablesInsert, TablesUpdate } from "./database.types";

// Database 타입 export
export type { Database, Tables, TablesInsert, TablesUpdate };

// 도메인 타입 alias
export type Profile = Tables<"profiles">;
export type InsertProfile = TablesInsert<"profiles">;
export type UpdateProfile = TablesUpdate<"profiles">;

export type Center = Tables<"centers">;
export type InsertCenter = TablesInsert<"centers">;
export type UpdateCenter = TablesUpdate<"centers">;

export type JobPosting = Tables<"job_postings">;
export type InsertJobPosting = TablesInsert<"job_postings">;
export type UpdateJobPosting = TablesUpdate<"job_postings">;

export type JobPostingWithDetails = Tables<"job_postings_with_details">;

export type Resume = Tables<"resumes">;
export type InsertResume = TablesInsert<"resumes">;
export type UpdateResume = TablesUpdate<"resumes">;

export type Application = Tables<"applications">;
export type InsertApplication = TablesInsert<"applications">;
export type UpdateApplication = TablesUpdate<"applications">;

export type Like = Tables<"likes">;
export type InsertLike = TablesInsert<"likes">;
export type UpdateLike = TablesUpdate<"likes">;

// 상수 테이블 타입
export type Region = Tables<"regions">;
export type EmploymentType = Tables<"employment_types">;
export type ExperienceLevel = Tables<"experience_levels">;
export type JobCategory = Tables<"job_categories">;

// Enum 타입
export type UserRole = "trainer" | "center";
export type Gender = "male" | "female" | "any";
export type SalaryType = "monthly" | "hourly" | "negotiable";
export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

// 상수 코드 타입
export type RegionCode =
  | "seoul"
  | "gyeonggi"
  | "incheon"
  | "busan"
  | "daegu"
  | "daejeon"
  | "gwangju"
  | "ulsan"
  | "sejong"
  | "gangwon"
  | "chungbuk"
  | "chungnam"
  | "jeonbuk"
  | "jeonnam"
  | "gyeongbuk"
  | "gyeongnam"
  | "jeju";

export type JobCategoryCode =
  | "pt"
  | "pilates"
  | "yoga"
  | "crossfit"
  | "swimming"
  | "golf"
  | "dance"
  | "martial_arts"
  | "rehab"
  | "group_ex"
  | "kids"
  | "etc";

export type EmploymentTypeCode = "full_time" | "contract" | "part_time";
export type ExperienceLevelCode = "entry" | "junior" | "senior";

// JSONB 타입
export interface CareerHistory {
  company: string;
  position: string;
  period: string;
  description?: string;
}

export interface Education {
  school: string;
  major: string;
  period: string;
}

// 필터 타입
export interface JobFilter {
  region?: RegionCode;
  categories?: JobCategoryCode[];
  gender?: Gender;
  employmentType?: EmploymentTypeCode;
  experienceLevel?: ExperienceLevelCode;
  search?: string;
}

// 지원자 상세 정보 타입
export interface ApplicationDetail {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
  job_posting: {
    id: string;
    title: string;
    center_id: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  resume: Resume;
}
